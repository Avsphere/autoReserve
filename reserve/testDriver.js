//STATUS : Early testing
const moment = require('moment')
const initMakeReservation = require('./makeReservation')



//TESTING
const test = async () => {
    try {
        
        const makeReservation = initMakeReservation({username : 'avsphere', password : '...'})
        
        
        await makeReservation({
            dateBegin : moment('8/21/2019 5:00:00 PM'),
            dateEnd: moment('8/21/2019 7:00:00 PM'),
        })

    } catch (e) {
        console.log('Top level catch: ', e)
    }
}

test()

