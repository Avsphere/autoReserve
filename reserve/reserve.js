//STATUS : Early testing
const puppeteer = require('puppeteer')
const moment = require('moment')
const selectDateCell = require('./selectDateCell')

const username = 'testyTest'
const password = 'testityTest'

const inputCredentials = ({ username, password }) => {
    document.querySelector('#loginFormWrapper').style.display = 'block'; //for click to work, el must be visible
    document.querySelector('#dnn_LOGINFORM_Login_DNN_chkCookie').checked = true; //perhaps unnecessary
    document.querySelector('#dnn_LOGINFORM_Login_DNN_txtUsername').value = username
    document.querySelector('#dnn_LOGINFORM_Login_DNN_txtPassword').value = password
}

//note that this executes within the context of the page
const login = page => page
    .evaluate(inputCredentials, { username, password })
    .then( _ => page.click('#dnn_LOGINFORM_Login_DNN_cmdLogin'))



//TESTING
const reserve = async () => {
    try {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage()

        const reserveDate = `8/21/2019`
        await page.goto(`https://dnn.proclub.com/Sports/Squash/Court-Schedule/CourtScheduleStandalone?CurrentDate=${reserveDate}`) //iframe reserve component
        await login(page)
        await page.waitForSelector('#Form'); //waits for the dom to reload after the login request
        
        const cellDates = await selectDateCell({
            rangeBegin : moment('8/21/2019 5:00:00 PM'),
            rangeEnd: moment('8/21/2019 7:00:00 PM'),
            page 
        })

    } catch (e) {
        console.log('Top level catch: ', e)
    }
}


// module.exports = curry(reserve)

