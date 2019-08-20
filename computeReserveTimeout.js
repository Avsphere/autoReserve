const moment = require('moment-timezone') //it appears from documentation that this is an additional wrapper on top of moment
const { compose } = require('ramda')

const RESERVATION_IN_ADVANCE_DAYS = 3 //this is the amount of days pro sport lets us reserve early

const nextOccurrence = currentTime => ({ day, hour }) => moment(currentTime).tz('US/Pacific').day(day).hour(hour).minute(0)
const subtractNDays = n => date => moment(date).subtract(n, 'days')


const computeDateDifference = b => a => moment(a).tz('US/Pacific').diff(b)

//given currentTime then { day, hour } find the next occurence, then compute how long in ms till we should make the reservation
//making it initialized with the current time to practice purity
const computeReserveTimeoutGivenCurrent = currentTime => compose(
    computeDateDifference(currentTime),
    subtractNDays(RESERVATION_IN_ADVANCE_DAYS),
    nextOccurrence(currentTime)
)


module.exports = computeReserveTimeoutGivenCurrent