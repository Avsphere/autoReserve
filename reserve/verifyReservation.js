

//It appears that this verify screen was a shitty hotfix, it appears that these are by the hour, thus I always search for dateBegin increment until dateEnd hour
const verifyReservation = (dateBegin, dateEnd) => {
    const extractText = el => el.innerText //as their code stores the cell date in the onClick
    const isReservedByMe = str => str.includes("Reserved For You");
    const cells = Array.from(document.querySelectorAll('.calendar-table .col-court .cell'))
    cells.map(extractText).find(isReservedByMe) ? true : false;
}

module.exports = verifyReservation