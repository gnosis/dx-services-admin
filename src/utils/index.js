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

export const network2Color = (networkName) => {
    switch(networkName) {
        case 'Mainnet':
            return 'linear-gradient(90deg, rgba(26,152,140,1) 49%, rgba(255,255,255,1) 93%)'
        case 'Rinkeby':
            return 'linear-gradient(90deg, #efc55b 49%, rgba(255,255,255,1) 93%)'
        case 'Kovan':
            return 'linear-gradient(90deg, #8568d7 49%, rgba(255,255,255,1) 93%)'
        case 'Ropsten':
            return 'linear-gradient(90deg, #d15480 49%, rgba(255,255,255,1) 93%)'
        case 'Mock Mode':
            return 'linear-gradient(90deg, #ff8989 49%, rgba(255,255,255,1) 93%)'
        default:
            return 'linear-gradient(90deg, #d5d5d5 49%, rgba(255,255,255,1) 93%)'
    }
}

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

/**
 * fetcher
 * @description returns JSON data from native JS fetch
 * @param { url: string }
 * @param { options: any{} }
 * @returns JSON
 */
export const fetcher = async (url, options) => 
    fetch(url, options)
    .then(res => res.json())
    .catch(e => { 
        console.error(e) 
        throw new Error(`Error occurred on fetch from ${url}`)
    })
