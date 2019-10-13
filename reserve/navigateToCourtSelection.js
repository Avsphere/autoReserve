const moment = require('moment')

const dateToProSportUrlForm = date => moment(date).format('L') //L is the Month numeral, day of month, year locale built-in
const generateCourtScheduleUrl = date => `https://dnn.proclub.com/Sports/Squash/Court-Schedule/CourtScheduleStandalone?CurrentDate=${dateToProSportUrlForm(date)}`

const navigateToCourtSelection = async(page, dateBegin) => {
    try {
        const courtSchedulerUrl = generateCourtScheduleUrl(dateBegin)
        await page.goto(courtSchedulerUrl) //iframe reserve component
    } catch (err) {
        console.error('navigateToCourtSelection failed : ', err)
    }
}


module.exports = navigateToCourtSelection;