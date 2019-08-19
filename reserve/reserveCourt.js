const injectLibraries = require('./injectLibraries')

//selectCourt searches for all available court cells that match the range and selects the time closest to dateBegin
//once the court is selected, the page is redirected to a verification page which must be awaited
//note that selectCourt is executed within the context of the puppeteer page


const selectCourt = (dateBegin, dateEnd) => {
    const { compose, match, head } = window.R //from injection 
    const moment = window.moment //from injection

    //matchDate :: RegExp -> String -> [String]
    const matchDate = match(/(?:\d+\/+\d+\/\d+) (\d+:\d\d:\d\d \w\w)/g)

    //isBetweenDates :: Date -> Boolean
    const isBetweenDates = date => moment(date).isBetween(dateBegin, dateEnd)

    //extractOnClick :: domElement -> String
    const extractOnClick = el => el.getAttribute('onClick') //as their code stores the cell date in the onClick

    //cellElementToDate :: domElement -> Date
    const cellElementToDate = compose(
        moment,
        head,
        matchDate,
        extractOnClick
    )

    //compareCellDates :: Date -> Date -> Integer { -, 0, + }
    const compareCellDates = (a, b) => cellElementToDate(a).diff(cellElementToDate(b))

    //courtIsOpen :: domElement -> Boolean
    const courtIsOpen = compose(isBetweenDates, cellElementToDate)



    
    const cells = Array.from(document.querySelectorAll('.calendar-table .col-court .cell.empty'))
    const openCourts = cells.filter(courtIsOpen)
    const orderedCourts = openCourts.sort(compareCellDates)

    orderedCourts[0].click()
}


//It appears that this verify screen was a shitty hotfix, it appears that these are by the hour, thus I always search for dateBegin increment until dateEnd hour
const verifyReservation = (dateBegin, dateEnd) => {
    const { compose, equals } = window.R //from injection 
    const arrayFromRange = (start, end) => Array(end - start + 1).fill(0).map((_, i) => start + i) //for generating hours to test -- must keep inside evaluate scope

    const spans = Array.from(document.querySelectorAll('#selectTimeGroup span')) //each span contains the hour now in 24 hour format rather than 12 hour format like the previous page......
    const extractSpanHour = el => Number.parseFloat(el.getAttribute('data-bookingtime')) / 60 //stored as minutes ie 60 -> 1 am
    const selectSpanReservation = span => span.querySelector('input').checked = true

    const dateToHour = date => moment(date).hours()
    const hoursToMatch = arrayFromRange(dateToHour(dateBegin), dateToHour(dateEnd))

    const matchSpanHour = h => compose(equals(h), extractSpanHour)

    const validReserveSpans = hoursToMatch.map(h => spans.find(matchSpanHour(h)))

    console.log('valid reserve spans'.validReserveSpans)
    selectSpanReservation(validReserveSpans[0])
    document.querySelector('#dnn_ctr2372_View_SelectTimeView_btnCreateBooking').click()

    return validReserveSpans[0].innerText;

}


const reserveCourt = ({
        dateBegin,
        dateEnd,
        page
    }) => injectLibraries(page)
    .then(_ => page.evaluate(selectCourt, dateBegin, dateEnd)) //this loads the verification page, hence the reinjection
    .then(_ => page.waitForSelector('#selectTimeGroup span')) //wait for verification page dom to load
    .then(_ => injectLibraries(page))
    .then(_ => page.evaluate(verifyReservation, dateBegin, dateEnd))


module.exports = reserveCourt