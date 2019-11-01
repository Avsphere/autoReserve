//The reason this is very similar to getAvailable courts is that they must operate within different contexts, but running headlessly means maximum components for debugging is nice
const selectCourt = (dateBegin, dateEnd, selectionIndex) => {
    if ( !dateBegin || !dateEnd || !Number.isSafeInteger(selectionIndex) )
    {
        throw new Error('select courts requires all arguments')
    }
    const {
        compose,
        match,
        head,
        split,
        reduce,
        add,
        map
    } = window.R //from injection 
    const moment = window.moment //from injection


    //matchDate :: RegExp -> String -> [String]
    const matchDate = match(/(?:\d+\/+\d+\/\d+) (\d+:\d\d:\d\d \w\w)/g)

    //extractOnClick :: domElement -> String
    const extractOnClick = el => el.getAttribute('onClick') //as their code stores the cell date in the onClick

    
    const last = arr => arr[arr.length - 1]


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


    //compareCourtNumber :: Date -> Date -> Integer { -, 0, + }
    const compareCourtNumber = (a, b) => cellElementToCourtNumber(b) - cellElementToCourtNumber(a)

    //isEmpty :: domElement -> Boolean
    const isEmpty = cell => Array.from(cell.classList).includes('empty')

    //isBetweenDates :: Date -> Boolean
    const isBetweenDates = date => moment(date).isBetween(moment(dateBegin).subtract(1, 'minute'), dateEnd) //the subtraction is so that it is not inclusive

    //isGoodTime :: domElement -> Boolean
    const isWithinTime = compose(isBetweenDates, cellElementToDate)

    const isNotALessonCourt = cell => [1, 2].includes(cellElementToCourtNumber(cell)) === false

    //courtIsValidPick :: domElement -> Boolean
    const courtIsValidPick = cell => isWithinTime(cell) && isNotALessonCourt(cell) && isEmpty(cell)

    const cells = Array.from(document.querySelectorAll('.calendar-table .col-court .cell.empty'))
    const validCourts = cells.filter(courtIsValidPick)
    const orderedCourts = validCourts.sort(compareCourtNumber) //priority on higher number courts
    
    orderedCourts[selectionIndex].click();
}

module.exports = selectCourt;