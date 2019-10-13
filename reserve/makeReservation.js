const login = require('./login')
const reserveCourt = require('./reserveCourt')
const navigateToCourtSelection = require('./navigateToCourtSelection')
const puppeteer = require('puppeteer')
const moment = require('moment')
const { promisify } = require('util')
const delay = promisify(setTimeout)

const dateToProSportUrlForm = date => moment(date).format('L') //L is the Month numeral, day of month, year locale built-in
const generateCourtScheduleUrl = date => `https://dnn.proclub.com/Sports/Squash/Court-Schedule/CourtScheduleStandalone?CurrentDate=${dateToProSportUrlForm(date)}`


const makeReservation = ({ username, password }) => async ({ dateBegin, dateEnd }) => {
    if ( !dateEnd ) { dateEnd = moment(dateBegin).add(1, 'hour') }
    const browser = await puppeteer.launch({headless: false})
    try {
	console.log("Starting reservation process");
	const page = await browser.newPage()
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');


        await navigateToCourtSelection(page, dateBegin);
        console.log('Navigated to page')

        await login({ page, username, password })
        await page.waitForSelector('#Form'); //waits for the dom to reload post login (scheduler is wrapped in #Form)
        console.log('Login successful')


        await reserveCourt({ dateBegin, dateEnd, page }) //no really need to return?
        console.log('Reserved court')

        await delay(10000) //likely not needed, but unsure if browser would close before page finishes all requests
        //if no throw by this point then good news
    } catch (e) {
        console.log('makeReservation Error: ', e)
    } finally {
        //browser.close()
    }
}


module.exports = makeReservation
