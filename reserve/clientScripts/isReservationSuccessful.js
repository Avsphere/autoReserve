

const isReservationSuccessful = () => {
    const extractText = el => el.innerText //as their code stores the cell date in the onClick
    const isReservedByMe = str => str.includes("Reserved For You");
    const cells = Array.from(document.querySelectorAll('.calendar-table .col-court .cell'))
    
    return cells.map(extractText).find(isReservedByMe) ? true : false;
}

module.exports = isReservationSuccessful;