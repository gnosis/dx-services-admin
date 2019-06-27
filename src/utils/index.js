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
    switch (networkName) {
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

export const shortenHash = (hash, endHash = 61) => `${(hash).slice(0, 6)}...${(hash).slice(endHash)}`

export function recursiveZeroCheck(num, fixAmt = 4) {
    if (num === 0) return num
    if (isNaN(num) || isNaN(fixAmt)) throw new Error('Parameters MUST be numbers or numbers in string form')
    // Explicitly convert params to Number type
    num = Number(num)
    fixAmt = Number(fixAmt)
    // if param is indeed above 0 @ fixAmt then return
    if (num.toFixed(fixAmt).toString() > 0) return num.toFixed(fixAmt)
    // else increase fixAmt by 1
    ++fixAmt
    return recursiveZeroCheck(num, fixAmt)
}

export const rZC = recursiveZeroCheck

export function setURLFilterParams(filterString) {
    if (!window) return false
    const defaultLocation = window.location.href.split('?')[0]
    return window.location.replace(`${defaultLocation}${filterString}`)
}

export function tokenListToName(tokenList, st, bt) {
    if (!tokenList.length) return { sellName: '...', buyName: '...', sellSymbol: '...', buySymbol: '...' }
    return {
        sellName: (tokenList.find(token => token.address === st)).name,
        buyName: (tokenList.find(token => token.address === bt)).name,
        sellSymbol: (tokenList.find(token => token.address === st)).symbol,
        buySymbol: (tokenList.find(token => token.address === bt)).symbol,
    }
}
