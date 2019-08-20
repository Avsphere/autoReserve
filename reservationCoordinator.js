const moment = require('moment-timezone') //it appears from documentation that this is an additional wrapper on top of moment
const { compose } = require('ramda')

/*
Given config file
initialize make reservation with username and password
then for each day create a timeout and an interval

the timeout is used to wait until the proper reserve time. ie if you want to reserve on friday, it should make the reservation on tuesday
the interval is simply a weekly interval



*/

const nextOccurrence = ({day, hour}) => moment().tz('US/Pacific').day(day).hour(hour).minute(0) 


const subtractNDays = n => date => moment(date).subtract(n, 'days')

const reservationAdvance = 3 //this is the amount of days pro sport lets us reserve early
const computeOptimalReserveDate = subtractNDays(reservationAdvance)

const computeDateDifference = b => a => moment(a).tz('US/Pacific').diff(b)

//given { day, hour } find the next occurence, then compute how long in ms till we should make the reservation
const computeReserveTimeoutGivenCurrent = currentTime => compose(
    computeDateDifference(currentTime),
    computeOptimalReserveDate,
    nextOccurrence
)

const computeReserveTimeout = computeReserveTimeoutGivenCurrent( moment().tz('US/Pacific') )

const a = computeReserveTimeout({
    day: 'friday',
    hour: 16
})

console.log(a)
