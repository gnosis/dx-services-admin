import moment from 'moment'

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
    if (isNaN(num) || isNaN(fixAmt)) return num// throw new Error('Parameters MUST be numbers or numbers in string form')
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

export function tokenListToName(tokenList, st, bt) {
    if (!tokenList.length) return { sellName: '...', buyName: '...', sellSymbol: '...', buySymbol: '...', sellDecimal: 18, buyDecimal: 18 }
    return {
        sellName: (tokenList.find(token => token.address === st)).name,
        sellSymbol: (tokenList.find(token => token.address === st)).symbol,
        sellDecimal: (tokenList.find(token => token.address === st)).decimals,
        buyName: (tokenList.find(token => token.address === bt)).name,
        buySymbol: (tokenList.find(token => token.address === bt)).symbol,
        buyDecimal: (tokenList.find(token => token.address === bt)).decimals,
    }
}

export const formatTime = (time) => moment(time * 1000).format("LLL")

export const queryLineMaker = (dataCheck, queryString) => `${dataCheck ? `${queryString.toString()}: "${dataCheck}"` : ''}`

export function setURLFilterParams(filterString, moveNow) {
    if (!window) return false
    const defaultLocation = window.location.href.split('?')[0]
    return moveNow ? window.location.href = `${defaultLocation}${filterString}` : window.location.replace(`${defaultLocation}${filterString}`)
}

export function urlParams2Array(url) {
    if (!url) return []

    const URL_PARAMS = url.split('?')

    return URL_PARAMS[1]
        ?
        URL_PARAMS[1].split('&')
            .map(item => item.split('='))
        :
        []
}

export const urlParams2Object = url =>
    urlParams2Array(url)
        .reduce((acc, curr) => {
            acc[curr[0]] = curr[1]
            return acc
        }, {})
        