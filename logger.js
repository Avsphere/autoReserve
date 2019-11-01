const jsonfile = require('jsonfile')
const fs = require('fs')
const path = require('path')
const DEBUG = true;
const SAVE_TO_FILE = true;
const LOG_DIR__PATH = "./logs";
const logFile = ( new Date() ).toDateString().split(' ').join('_');

const LOG_FILE_PATH = path.join(LOG_DIR__PATH, logFile)


if ( !fs.existsSync(LOG_DIR__PATH) ) {
    fs.mkdirSync(LOG_DIR__PATH);
}



const log = label => msg => {
    const output = { label, msg, timestamp : Date.now() }
    if ( DEBUG ) {
        console.log(output);
    }
    if ( SAVE_TO_FILE ) {
        jsonfile.writeFileSync(LOG_FILE_PATH + label, output, { flag : 'a' })
    }
}

module.exports = log;