

//this is executing within the context of a page, hence no executes as libraries should have been injected
const attemptReservation = (dateBegin, dateEnd) => {
    console.log("attempting reservation, datebegin", dateBegin, dateEnd)
    const moment = window.moment //from injection

    const isNotUndefined = item => item !== undefined && item !== null
    const spans = Array.from(document.querySelectorAll('#selectTimeGroup span')).filter(isNotUndefined) //each span contains the hour now in 24 hour format rather than 12 hour format like the previous page......

    const extractSpanMinutes = el => Number.parseFloat(el.getAttribute('data-bookingtime'))
    const selectSpanReservation = span => span.querySelector('input').checked = true

    const desiredTimeAsMinutes = moment(dateBegin).hours() * 60 + moment(dateBegin).minutes()
    const spanMinutesDifference = span => Math.abs(extractSpanMinutes(span) - desiredTimeAsMinutes)

    const lessThanAnHourDifference = span => spanMinutesDifference(span) < 91;
    
    const worthySpans = spans.filter(lessThanAnHourDifference).sort( (a, b) => spanMinutesDifference(a) - spanMinutesDifference(b) )
    

    if (worthySpans.length == 0) return false;

    selectSpanReservation(worthySpans[0])
    // const helpers = {
    //     moment,
    //     isNotUndefined,
    //     spans,
    //     extractSpanMinutes,
    //     selectSpanReservation,
    //     desiredTimeAsMinutes,
    //     spanMinutesDifference,
    //     lessThanAnHourDifference,
    //     worthySpans
    // }
    // console.log("helpers", helpers)
    return worthySpans[0].outerHTML;
}

module.exports = attemptReservation;