//It appears that this verify screen was a shitty hotfix, it appears that these are by the hour, thus I always search for dateBegin increment until dateEnd hour
const verifyReservation = (dateBegin, dateEnd) => {
    const moment = window.moment //from injection

    const isNotUndefined = item => item !== undefined && item !== null
    const spans = Array.from(document.querySelectorAll('#selectTimeGroup span')).filter(isNotUndefined) //each span contains the hour now in 24 hour format rather than 12 hour format like the previous page......

    const extractSpanMinutes = el => Number.parseFloat(el.getAttribute('data-bookingtime'))
    const selectSpanReservation = span => span.querySelector('input').checked = true

    const desiredTimeAsMinutes = moment(dateBegin).hours() * 60
    const spanMinutesDifference = span => Math.abs(extractSpanMinutes(span) - desiredTimeAsMinutes)


    const compareSpanTimes = (a, b) => spanMinutesDifference(b) - spanMinutesDifference(a)
    const minDistance = Math.min(...spans.map(spanMinutesDifference))
    const isMinDistanceAway = span => spanMinutesDifference(span) === minDistance
    const chosenSpan = spans.reverse().find(isMinDistanceAway) //reversed because I want to put precedence on the latest of the tied choices
    
    console.log('minDistance', minDistance)
    console.log('chosenSpan', chosenSpan)

    //if there is no valid span then it selects the first one, if this is not available then it attempts to select the only one, the other option here would be to go back
    //and try to find another court, but the ordering should have picked the best one
    // const chosenSpan = sortedSpans.length === 1 ? spans[0] : sortedSpans[0]
    selectSpanReservation(chosenSpan)
    console.log('chosenSpan', chosenSpan)
    // document.querySelector('#dnn_ctr2372_View_SelectTimeView_btnCreateBooking').click()

    // return chosenSpan[0].innerText;

}

module.exports = verifyReservation