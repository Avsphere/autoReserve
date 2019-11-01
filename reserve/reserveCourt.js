const injectLibraries = require('./clientScripts/injectLibraries')
const selectCourt = require('./clientScripts/selectCourt') 
const getAvailableCourts = require('./clientScripts/getAvailableCourts') 
const attemptReservation = require('./clientScripts/attemptReservation')
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

const reserveCourt = async ({ dateBegin, dateEnd, page }) => {
    if ( !dateBegin || !dateEnd ) throw new Error('reserve court requires dateBegin and dateEnd')
    let courtReserved = false;
    let selectionIndex = 0; //ie select court will attempt to select the first valid court
    try {
        while (!courtReserved) {
            await navigateToCourtSelection(page, dateBegin);
            await injectLibraries(page)
            const availableCourts = await page.evaluate(getAvailableCourts, dateBegin, dateEnd)
            log(availableCourts)
            if ( availableCourts.length == 0 || availableCourts.length < selectionIndex ) 
                throw new Error('reserveCourts has failed either because there are no available courts, or because it has tried to the point where there are none left to try')
            
            await page.evaluate(selectCourt, dateBegin, dateEnd, selectionIndex)

            await page.waitForSelector('#selectTimeGroup span')
            log('On verify page')
            await injectLibraries(page) //pro sport reloads scripts inside page after selection, thus need to reinject scripts
            await safeDelay(2000);
           
            const possibleReservation = await page.evaluate(attemptReservation, dateBegin, dateEnd)
            if ( possibleReservation ) {
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