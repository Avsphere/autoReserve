//since the evaluate is executed within the context of the puppet page, libraries must be injected

const injectRamda = page => page.addScriptTag({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/ramda/0.26.1/ramda.js'
})
const injectMoment = page => page.addScriptTag({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js'
})

const injectLibraries = page => Promise.all([injectRamda(page), injectMoment(page)])


module.exports = injectLibraries;