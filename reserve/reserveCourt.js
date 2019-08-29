const injectLibraries = require('./injectLibraries')
const selectCourt = require('./selectCourt')  //seperated because of evaluation context
const verifyReservation = require('./verifyReservation') //seperated because of evaluation context


const reserveCourt = async ({ dateBegin, dateEnd, page }) => {
    try {
        await injectLibraries(page)
        await page.evaluate(selectCourt, dateBegin, dateEnd, )
        await page.waitForSelector('#selectTimeGroup span')
        await injectLibraries(page) //pro sport reloads scripts inside page after selection, thus need to reinject scripts
        await page.waitForSelector('#dnn_ctr2372_View_SelectTimeView_btnCreateBooking') //make sure that the verify view dom is ready
        await page.evaluate(verifyReservation, dateBegin, dateEnd)
    } catch (e) {
        //LOOK AT ME : worth it for better handling? 8/19 -- 8/24 still not sure if this will ever be worth since the court reserver should grab all courts initially
        console.error('ReserveCourt Error: ', e)
    }
}


module.exports = reserveCourt