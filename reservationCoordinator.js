const moment = require('moment-timezone') //it appears from documentation that this is an additional wrapper on top of moment
const { curry, compose } = require('ramda')
const { readFileSync } = require('jsonfile')
const { username, password, reserveInfo } = readFileSync('./config.json')
const { promisify } = require('util')
const delay = promisify(setTimeout)
const makeReservation = require('./reserve/makeReservation')({ username, password })

const RESERVATION_IN_ADVANCE_DAYS = 3 //this is the amount of days pro sport lets us reserve early


const reservationRunner = curry( async (currentMoment, reserveDate) => {
    console.log('Making reservation for date: ', reserveDate.format())
    const canMakeReservationOn = moment(reserveDate).subtract(RESERVATION_IN_ADVANCE_DAYS, 'days')
    console.log('Making reservation ON : ', canMakeReservationOn.format())
    
    const msTillMakeReserveCall = canMakeReservationOn.diff(currentMoment) //this could be negative if the date was past on init, in which case delay is 0
    console.log('ms till reserve : ', msTillMakeReserveCall, 'which is ', msTillMakeReserveCall / 1000 / 60 / 60, ' hours')

    await delay(msTillMakeReserveCall)
    await makeReservation({ dateBegin : reserveDate })
})

const dayHourToDate = ({day, hour}) => moment().tz('US/Pacific').startOf('week').day(day).hour(hour).minute(0)
const addWeeks = n => date => moment(date).add(n, 'week')
const thisTimeNextWeek = compose( addWeeks(1), dayHourToDate)


const getReserveDates = curry( (currentMoment, rawReserveConfig) => rawReserveConfig.map( ({day, hour}) => {
        const currentDay = currentMoment.day()
        const reserveDay = moment().day(day).day()

        return reserveDay > currentDay
            ? moment(currentMoment).day(day).hour(hour).minute(0)
            : thisTimeNextWeek({ day, hour })
    })
)

//application head
const run = initialReserveDates => async function reservationLoop(weeksToAdd=0) {
    const reserveDatesWithOffset = initialReserveDates.map(addWeeks(weeksToAdd))

    const currentMoment = moment().tz('US/Pacific') //while this breaks purity it is the app head and feels safer since is used to compute the timeout
    await Promise.all(reserveDatesWithOffset.map(d => reservationRunner(currentMoment, d)))

    //after the initial reservation is made, we offset from where we started and wait again
    reservationLoop(weeksToAdd+1)
}


const currentMoment = moment().tz('US/Pacific')
const reserveDates = getReserveDates(currentMoment)(reserveInfo)

run(reserveDates)()