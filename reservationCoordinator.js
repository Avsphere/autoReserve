//Given the config file { username, password, days : [{ day : 'friday', hour : '16' }]} paritally apply and set to execute
const moment = require('moment')

//moment().day('friday').hour(5).minute(0).format() 


/*
Given config file
initialize make reservation with username and password
then for each day create a timeout and an interval

the timeout is used to wait until the proper reserve time. ie if you want to reserve on friday, it should make the reservation on tuesday
the interval is simply a weekly interval

But what if one wants to make multiples? Ie friday and saturday? Then you would need to change the timeout to make on reservation on tuesday and the next on friday after the original reservation is complete??


Hmmm need to think this over


*/