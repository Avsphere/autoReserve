//It appears that this verify screen was a shitty hotfix, it appears that these are by the hour, thus I always search for dateBegin increment until dateEnd hour
const verifyReservation = (dateBegin, dateEnd) => {
    const moment = window.moment //from injection

    const isNotUndefined = item => item !== undefined && item !== null
    const spans = Array.from(document.querySelectorAll('#selectTimeGroup span')).filter(isNotUndefined) //each span contains the hour now in 24 hour format rather than 12 hour format like the previous page......

    const extractSpanMinutes = el => Number.parseFloat(el.getAttribute('data-bookingtime'))
    const selectSpanReservation = span => span.querySelector('input').checked = true

    const desiredTimeAsMinutes = moment(dateBegin).hours() * 60 + moment(dateBegin).minutes()
    const spanMinutesDifference = span => Math.abs(extractSpanMinutes(span) - desiredTimeAsMinutes)


    const minDistance = Math.min(...spans.map(spanMinutesDifference))
    const isMinDistanceAway = span => spanMinutesDifference(span) === minDistance
    const chosenSpan = spans.reverse().find(isMinDistanceAway) //reversed because I want to put precedence on the latest of the tied choices
    
    selectSpanReservation(chosenSpan)
    document.querySelector('#dnn_ctr2372_View_SelectTimeView_btnCreateBooking').click()

    return true;

}

module.exports = verifyReservation