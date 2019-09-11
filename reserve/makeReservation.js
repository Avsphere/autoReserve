const login = require('./login')
const reserveCourt = require('./reserveCourt')
const puppeteer = require('puppeteer')
const moment = require('moment')


const dateToProSportUrlForm = date => moment(date).format('L') //L is the Month numeral, day of month, year locale built-in
const generateCourtScheduleUrl = date => `https://dnn.proclub.com/Sports/Squash/Court-Schedule/CourtScheduleStandalone?CurrentDate=${dateToProSportUrlForm(date)}`


const makeReservation = ({ username, password }) => async ({ dateBegin, dateEnd }) => {
    if ( !dateEnd ) { dateEnd = moment(dateBegin).add(1, 'hour') }
    const browser = await puppeteer.launch({headless: false});

    try {
        const page = await browser.newPage()

        const courtSchedulerUrl = generateCourtScheduleUrl(dateBegin)
        await page.goto(courtSchedulerUrl) //iframe reserve component
        

        await login({ page, username, password })
        await page.waitForSelector('#Form'); //waits for the dom to reload post login (scheduler is wrapped in #Form)

        const reservationText = await reserveCourt({ dateBegin, dateEnd, page }) //no really need to return?
        console.log('Made a reservation : ', reservationText)

    } catch (e) {
        console.log('makeReservation Error: ', e)
    } finally {
        // browser.close()
    }
}


module.exports = makeReservation