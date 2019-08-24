const injectLibraries = require('./injectLibraries')

//selectCourt searches for all available court cells that match the range and selects the time closest to dateBegin
//once the court is selected, the page is redirected to a verification page which must be awaited
//note that selectCourt is executed within the context of the puppeteer page

//this is actually a little tricky as their "verify court" bs prevents rational thinking -- thus working around by a modified "open"
//the most important aspect is that there are x amount of vertical open cells to gurantee that the verify has at least one possible selection
const selectCourt = (dateBegin, dateEnd) => {
    const { compose, match, head, split } = window.R //from injection 
    const moment = window.moment //from injection

    //matchDate :: RegExp -> String -> [String]
    const matchDate = match(/(?:\d+\/+\d+\/\d+) (\d+:\d\d:\d\d \w\w)/g)

    //extractOnClick :: domElement -> String
    const extractOnClick = el => el.getAttribute('onClick') //as their code stores the cell date in the onClick

    const last = arr => arr[arr.length-1]

    //cellElementToDate :: domElement -> Date
    const cellElementToDate = compose(
        moment,
        head,
        matchDate,
        extractOnClick
    )
    const cellElementToCourtNumber = compose(
        Number.parseFloat,
        head,
        match(/[0-9]/g),
        last,
        split(','),
        extractOnClick
    )
    //LOOK AT ME --- fix this ugly function
    const getNSiblings = direction => n => el => {
        const aux = []
        let curr = el;
        for (let i = 0; i < n; i++) {
            curr = curr[direction]
            aux.push(curr)
        }
        return aux;
    }
    const getPrevSibling = compose( last, getNSiblings('previousElementSibling')(1) )
    const getNextSibling = compose( last, getNSiblings('nextElementSibling')(1) )

    //compareCourtNumber :: Date -> Date -> Integer { -, 0, + }
    const compareCourtNumber = (a,b) => cellElementToCourtNumber(b) - cellElementToCourtNumber(a)

    //isEmpty :: domElement -> Boolean
    const isEmpty = cell => Array.from(cell.classList).includes('empty')

    //isBetweenDates :: Date -> Boolean
    const isBetweenDates = date => moment(date).isBetween( moment(dateBegin).subtract(1, 'minute'), dateEnd) //the subtraction is so that it is not inclusive

    //isGoodTime :: domElement -> Boolean
    const isGoodTime = compose(isBetweenDates, cellElementToDate)

    const surroundingCourtsAreEmpty = cell => isEmpty(getPrevSibling(cell)) && isEmpty(getNextSibling(cell)) 
    const isNotALessonCourt = cell => [1,2].includes( cellElementToCourtNumber(cell) ) === false

    //courtIsPrime :: domElement -> Boolean
    const courtIsPrime = cell => isGoodTime(cell) && surroundingCourtsAreEmpty(cell) && isNotALessonCourt(cell)

    const cells = Array.from(document.querySelectorAll('.calendar-table .col-court .cell.empty'))
    const primeCourts = cells.filter(courtIsPrime)
    const orderedCourts = primeCourts.sort(compareCourtNumber)

    orderedCourts[0].click()
}


//It appears that this verify screen was a shitty hotfix, it appears that these are by the hour, thus I always search for dateBegin increment until dateEnd hour
const verifyReservation = (dateBegin, dateEnd) => {
    const moment = window.moment

    const isNotUndefined = item => item !== undefined && item !== null
    const spans = Array.from(document.querySelectorAll('#selectTimeGroup span')).filter(isNotUndefined) //each span contains the hour now in 24 hour format rather than 12 hour format like the previous page......
    
    const extractSpanHour = el => Number.parseFloat(el.getAttribute('data-bookingtime')) / 60 //stored as minutes ie 60 -> 1 am
    const selectSpanReservation = span => span.querySelector('input').checked = true

    const dateToHour = date => moment(date).hours()

    const spanHourDifference = span => dateToHour(dateBegin) - extractSpanHour(span)
    const compareHourDifference = (a,b) => spanHourDifference(a) - spanHourDifference(b)

    const sortedSpans = spans.sort(compareHourDifference)

    //if there is no valid span then it selects the first one, if this is not available then it attempts to select the only one, the other option here would be to go back
    //and try to find another court, but the ordering should have picked the best one
    sortedSpans.length === 0 ? selectSpanReservation(spans[0]) : selectSpanReservation(sortedSpans[0])
    document.querySelector('#dnn_ctr2372_View_SelectTimeView_btnCreateBooking').click()

    return validReserveSpans[0].innerText;

}

const reserveCourt = async ({ dateBegin, dateEnd, page }) => {
    try {
        await injectLibraries(page)
        await page.evaluate(selectCourt, dateBegin, dateEnd)
        await page.waitForSelector('#selectTimeGroup span')
        await injectLibraries(page) //prosport bad view setup, poor reload inside page thus need to reinject scripts
        await page.waitForSelector('#dnn_ctr2372_View_SelectTimeView_btnCreateBooking') //make sure that the verify view dom is ready
        await page.evaluate(verifyReservation, dateBegin, dateEnd)
    } catch (e) {
        //LOOK AT ME : worth it for better handling? 8/19 -- 8/24 still not sure if this will ever be worth since the court reserver should grab all courts initially
        console.error('reserveCourt: ', e)
    }
}


module.exports = reserveCourt