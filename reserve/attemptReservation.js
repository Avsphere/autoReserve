

//this is executing within the context of a page, hence no executes as libraries should have been injected
const attemptReservation = (dateBegin, dateEnd) => {
    const moment = window.moment //from injection

    const isNotUndefined = item => item !== undefined && item !== null
    const spans = Array.from(document.querySelectorAll('#selectTimeGroup span')).filter(isNotUndefined) //each span contains the hour now in 24 hour format rather than 12 hour format like the previous page......

    const extractSpanMinutes = el => Number.parseFloat(el.getAttribute('data-bookingtime'))
    const selectSpanReservation = span => span.querySelector('input').checked = true

    const desiredTimeAsMinutes = moment(dateBegin).hours() * 60 + moment(dateBegin).minutes()
    const spanMinutesDifference = span => Math.abs(extractSpanMinutes(span) - desiredTimeAsMinutes)


    const minDistance = Math.min(...spans.map(spanMinutesDifference))
    const isMinDistanceAway = span => spanMinutesDifference(span) === minDistance && minDistance < 61; //as in we are not an hour over
    const chosenSpan = spans.reverse().find(isMinDistanceAway) //reversed because I want to put precedence on the latest of the tied choices
    
    if ( !chosenSpan ) return false;

    selectSpanReservation(chosenSpan)
    document.querySelector('#dnn_ctr2372_View_SelectTimeView_btnCreateBooking').click() //this will navigate to a new page but may not succeed

    return true;
}

module.exports = attemptReservation;