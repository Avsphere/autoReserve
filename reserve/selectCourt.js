//selectCourt searches for all available court cells that match the range and selects the time closest to dateBegin
//once the court is selected, the page is redirected to a verification page which must be awaited
//note that selectCourt is executed within the context of the puppeteer page

//this is actually a little tricky as their "verify court" bs prevents a gurantee that the court is open, ie it may say its open on the previous page but then NOT be truly open in verify
//the most important aspect is that there are x amount of vertical open cells to gurantee that the verify has at least one possible selection
const selectCourt = (dateBegin, dateEnd) => {
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

    const getNSiblings = direction => n => el => {
        const aux = []
        let curr = el;
        for (let i = 0; i < n; i++) {
            curr = curr[direction]
            aux.push(curr)
        }
        return aux;
    }
    //pro sport view is actually an improper table that deletes an i,j and expands the height of previous..... so having to compare style heights for a better count
    const extractCellHeight = cell => Number.parseFloat(cell.style.height);
    const rankHeight = height => height < 30 ? 1 : height < 50 ? -1 : height < 100 ? -2 : height > 100 ? -3 : 0 //their cells are constant regardless of screen size, these were decided based on min and max cell sizes that I saw
    const cellToScoreBasedOnSiblings = compose(rankHeight, extractCellHeight)

    const surroundingSiblings = cell => [...getNSiblings('previousElementSibling')(5)(cell), ...getNSiblings('nextElementSibling')(5)(cell)]

    // a score based on the amount of surrounding open courts
    const surroundingCourtScore = compose(
        reduce(add, 0), 
        map(cellToScoreBasedOnSiblings), 
        surroundingSiblings
    ) 


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
    const compareSurroundingOpenCourts = (a, b) => surroundingCourtScore(b) - surroundingCourtScore(a)

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
    const orderedCourts = validCourts.sort(compareCourtNumber).sort(compareSurroundingOpenCourts) // chain sort based on method priority ie having surrounding open courts is better
    
    if (validCourts.length === 0) throw new Error(`No valid courts on at time: ${moment(dateBegin).format()}`)
    
    orderedCourts[0].click()
}

module.exports = selectCourt 