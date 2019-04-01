export const windowLoaded = new Promise((resolve) => {
    if (typeof window === 'undefined') {
        resolve()
        return
    }

    if (typeof window.addEventListener !== 'function') {
        throw new Error('Expected to use event listener')
    }

    window.addEventListener('load', function loadHandler(event) {
        window.removeEventListener('load', loadHandler, false)

        return resolve(event)
    })
})

export const netIdToName = (id) => {
    switch (id) {
        case 1:
            return 'Mainnet'

        case 2:
            return 'Morden'

        case 3:
            return 'Ropsten'

        case 4:
            return 'Rinkeby'

        case 42:
            return 'Kovan'

        case null:
        case undefined:
            return 'No network detected'

        default:
            return 'Local Network'
    }
}