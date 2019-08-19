//STATUS : Early testing

//note that this is executed within the context of the puppeteer evaluate function, it is seperated to avoid namespace confusion
const { curry } = require('ramda')


//execution context is the puppet page, thus the scoped function build
const selectCell = (rangeBegin, rangeEnd) => {
    const { compose, match, head } = window.R //from addLibraries 
    const moment = window.moment //from addLibraries

    //matchDate :: RegExp -> String -> [String]
    const matchDate = match(/(?:\d+\/+\d+\/\d+) (\d+:\d\d:\d\d \w\w)/g)

    //isBetweenDates :: Date -> Boolean
    const isBetweenDates = date => moment(date).isBetween(rangeBegin, rangeEnd)

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
    const compareCellDates = (a, b) => cellElementToDate(a).diff( cellElementToDate(b) )

    //courtIsOpen :: domElement -> Boolean
    const courtIsOpen = compose( isBetweenDates, cellElementToDate)
    
    const cells = Array.from(document.querySelectorAll('.calendar-table .col-court .cell.empty'))
    
    const openCourts = cells.filter(courtIsOpen)
    
    const orderedCourts = openCourts.sort(compareCellDates)

    console.log(`Ordered Courts : ${orderedCourts}`)
}


const addRamda = page => page.addScriptTag({url: 'https://cdnjs.cloudflare.com/ajax/libs/ramda/0.26.1/ramda.js'})
const addMoment = page => page.addScriptTag({url: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js'})
const addLibraries = page => Promise.all([ addRamda(page), addMoment(page) ])


const selectDateCell = ({
        rangeBegin,
        rangeEnd,
        page
    }) => addLibraries(page)
    .then(_ => page.evaluate(selectCell, rangeBegin, rangeEnd))


module.exports = selectDateCell