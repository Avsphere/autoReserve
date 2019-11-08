const injectLibraries = require('./clientScripts/injectLibraries')
const selectCourt = require('./clientScripts/selectCourt') 
const getAvailableCourts = require('./clientScripts/getAvailableCourts') 
const selectReservationSpan = require('./clientScripts/selectReservationSpan')
const isReservationSuccessful = require('./clientScripts/isReservationSuccessful')
const navigateToCourtSelection = require('./navigateToCourtSelection')
const { promisify } = require('util')
const safeDelay = promisify(setTimeout)
const log = require('../logger')('ReserveCourt')



// const reserveCourt = async ({ dateBegin, dateEnd, page }) => {
//     try {

//         await navigateToCourtSelection(page, dateBegin);
//         await injectLibraries(page)
//         const availableCourts = await page.evaluate(getAvailableCourts, dateBegin, dateEnd)
//         log(availableCourts)

//         if ( availableCourts.length == 0 ) 
//         {
//             throw new Error('no open courts')
//         }

        
//         // await page.waitForSelector('#selectTimeGroup span')
//         // console.log("On verify page")
//         // await injectLibraries(page) //pro sport reloads scripts inside page after selection, thus need to reinject scripts
//         // console.log("injected")
//         // await safeDelay(2000);

//         // console.log("wait for selector")

//         // const possibleReservation = await page.evaluate(attemptReservation, dateBegin, dateEnd)
        
//     } catch (e) {
//         console.error('ReserveCourt Error: ', e)
//     }
// }


const submitReservationSelection = () => {
    document.querySelector('#dnn_ctr2372_View_SelectTimeView_btnCreateBooking').click() //this will navigate to a new page but may not succeed
}

//debugging
const checkForReservationSpans = () => {
    const isNotUndefined = item => item !== undefined && item !== null
    const spans = Array.from(document.querySelectorAll('#selectTimeGroup span')).filter(isNotUndefined) //each span contains the hour now in 24 hour format rather than 12 hour format like the previous page......

    return spans.map( s => s.outerHTML );
}


const reserveCourt = async ({ dateBegin, dateEnd, page }) => {
    if ( !dateBegin || !dateEnd ) throw new Error('reserve court requires dateBegin and dateEnd')
    let courtReserved = false;
    let selectionIndex = 0; //ie select court will attempt to select the first valid court
    try {
        while (!courtReserved) {
            console.log("selection index is : ", selectionIndex);
            await navigateToCourtSelection(page, dateBegin);
            await injectLibraries(page)
            const availableCourts = await page.evaluate(getAvailableCourts, dateBegin, dateEnd)
            log(availableCourts.slice(selectionIndex))
            if ( availableCourts.length == 0 || availableCourts.length < selectionIndex ) 
                throw new Error('reserveCourts has failed either because there are no available courts, or because it has tried to the point where there are none left to try')
            
            await page.evaluate(selectCourt, dateBegin, dateEnd, selectionIndex)

            await page.waitForSelector('#selectTimeGroup span')

            await injectLibraries(page) //pro sport reloads scripts inside page after selection, thus need to reinject scripts
            await safeDelay(2000);
           
            const reservationSelected = await page.evaluate(selectReservationSpan, dateBegin, dateEnd)
            log({ test : 'the reservation that was selected', reservationSelected })

            const reservationSpans = await page.evaluate(checkForReservationSpans);
            log({ test : 'checkingForReservationSpans', reservationSpans })

            await page.evaluate(submitReservationSelection)
            await safeDelay(5000);

            if ( reservationSelected ) {
                await navigateToCourtSelection(page, dateBegin);
                const reservationSuccess = await page.evaluate(isReservationSuccessful)
                if ( reservationSuccess ) {
                    log("Reservation was succesful")
                    courtReserved = true;
                } else {
                    log("Reservation was clicked but failed after")
                }
            } else {
                log("attempt reservation failed, trying again");
            }

            selectionIndex++;
            await safeDelay(2000);
        }
        
    } catch (e) {
        console.error('ReserveCourt Error: ', e)
    }
}


module.exports = reserveCourt