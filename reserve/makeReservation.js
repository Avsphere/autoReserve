const login = require('./login')
const reserveCourt = require('./reserveCourt')
const puppeteer = require('puppeteer')
const moment = require('moment')



const dateToProSportUrlForm = date => moment(date).format('L') //L is the Month numeral, day of month, year locale built-in
const generateCourtScheduleUrl = date => `https://dnn.proclub.com/Sports/Squash/Court-Schedule/CourtScheduleStandalone?CurrentDate=${dateToProSportUrlForm(date)}`


const makeReservation = ({ username, password }) => async ({ dateBegin, dateEnd }) => {
    try {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage()

        const courtSchedulerUrl = generateCourtScheduleUrl(dateBegin)
        await page.goto(courtSchedulerUrl) //iframe reserve component
        

        await login({ page, username, password })
        await page.waitForSelector('#Form'); //waits for the dom to reload post login (scheduler is wrapped in #Form)

        const reservationText = await reserveCourt({ dateBegin, dateEnd, page })
        return reservationText;

    } catch (e) {
        console.log('makeReservation Error: ', e)
        return false
    }
}


module.exports = makeReservation