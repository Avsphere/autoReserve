const injectLibraries = require('./injectLibraries')
const selectCourt = require('./selectCourt')  //seperated because of evaluation context
const attemptReservation = require('./attemptReservation')
const navigateToCourtSelection = require('./navigateToCourtSelection')
const { promisify } = require('util')
const safeDelay = promisify(setTimeout)

const isReservationSuccessful = () => {
    const extractText = el => el.innerText //as their code stores the cell date in the onClick
    const isReservedByMe = str => str.includes("Reserved For You");
    const cells = Array.from(document.querySelectorAll('.calendar-table .col-court .cell'))
    return cells.map(extractText).find(isReservedByMe) ? true : false;
}


const reserveCourt = async ({ dateBegin, dateEnd, page }) => {
    let courtReserved = false;
    let selectionIndex = 0; //ie select court will attempt to select the first valid court
    try {

        while (!courtReserved) {
            await navigateToCourtSelection(page, dateBegin);
            await safeDelay(2000);
            await injectLibraries(page)
            await page.evaluate(selectCourt, dateBegin, dateEnd, selectionIndex) //navigates to the verify page
            
            await page.waitForSelector('#selectTimeGroup span')
            await injectLibraries(page) //pro sport reloads scripts inside page after selection, thus need to reinject scripts
            await page.waitForSelector('#dnn_ctr2372_View_SelectTimeView_btnCreateBooking') //make sure that the verify view dom is ready
            const possibleReservation = await page.evaluate(attemptReservation)
            
            if ( possibleReservation ) {
                await navigateToCourtSelection(page, dateBegin);
                const reservationSuccess = await page.evaluate(isReservationSuccessful)
                if ( reservationSuccess ) {
                    console.log("Reservation was succesful")
                    courtReserved = true;
                } else {
                    console.log("Reservation was clicked but failed after")
                }
            } else {
                console.log("attempt reservation failed");
            }

            selectionIndex++;
            await safeDelay(2000);
        }
        
    } catch (e) {
        console.error('ReserveCourt Error: ', e)
    }
}


module.exports = reserveCourt