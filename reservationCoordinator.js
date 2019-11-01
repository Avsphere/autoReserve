const moment = require('moment-timezone') //it appears from documentation that this is an additional wrapper on top of moment
const { curry, compose } = require('ramda')
const { readFileSync } = require('jsonfile')
const { username, password, reserveInfo } = readFileSync('./config.json')
const { promisify } = require('util')
const delay = promisify(setTimeout)
const makeReservation = require('./reserve/makeReservation')({ username, password })

const RESERVATION_IN_ADVANCE_HOURS = 3*24 //this is the amount of time pro sport lets us reserve early


const printDebugTable = ({ currentMoment, reserveDate, canMakeReservationOn, msTillMakeReserveCall }) => {
    console.log(Array(20).join('-'))
    console.log(`Current moment: ${currentMoment}`)
    console.log(`Making reservation for the date ${reserveDate.format()}`)
    console.log(`Can make reservation on date ${canMakeReservationOn}`)
    console.log(`Which is in ${msTillMakeReserveCall/60/60} minutes`)
    console.log(Array(20).join('-'))
}


const reservationRunner = curry( async (currentMoment, reserveDate) => {
    const canMakeReservationOn = moment(reserveDate).subtract(RESERVATION_IN_ADVANCE_HOURS, 'hours') 

    const inconspicuousDelay = 0 //So that we are not reserving at the same time -- max wait is ~3 hours
    const msTillMakeReserveCall = canMakeReservationOn.diff(currentMoment) > 0 
		? canMakeReservationOn.diff(currentMoment) + inconspicuousDelay
		: inconspicuousDelay //always make sure there is some delay


    printDebugTable({ currentMoment, reserveDate, canMakeReservationOn, msTillMakeReserveCall })
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

//main loop
const loopReserve = initialReserveDates => async function reservationLoop(weeksToAdd=0) {
    const reserveDatesWithOffset = initialReserveDates.map(addWeeks(weeksToAdd))

    const currentMoment = moment().tz('US/Pacific') //while this breaks purity it is the app head and feels safer since is used to compute the timeout
    await Promise.all(reserveDatesWithOffset.map(dateToReserve => reservationRunner(currentMoment, dateToReserve)))

    //after the initial reservation is made, we offset from where we started and wait again
    reservationLoop(weeksToAdd+1)
}

const run = () => {
    const currentMoment = moment().tz('US/Pacific')
    const reserveDates = getReserveDates(currentMoment)(reserveInfo)

    loopReserve(reserveDates)()
}


run()

// module.exports = run;
