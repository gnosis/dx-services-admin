/**
 * Web3 Provider API
 * Version: 1.0.0beta.xx
 * Will NOT work with Web3@0.20.xx
*/
import Web3 from 'web3'
import { netIdToName, windowLoaded } from '../../utils'

let appWeb3

export const getWeb3API = async () => {
    if (appWeb3) return (console.debug('CACHED WEB3'), appWeb3)
    
    console.debug('NEW WEB3')
    appWeb3 = await init()
    return appWeb3
}

// Grabs runtime provider - for now this is runtime only.
// if you wish to pass in your own provider on API setup,
// please add a parameter + necessary checks into getProvider
// and pass provider object during API init in src/api/index.js
const getProvider = async () => {
    if (typeof window !== 'undefined' && window.web3) {
        if (window.ethereum) {
            // TODO: be careful this doesn't override window.web3 @ 0.20.x
            // with a version 1.X.xx that breaks app...
            const providerWeb3 = window.ethereum
            try {
                // Request account access if needed
                await providerWeb3.enable()
                return providerWeb3
            } catch (error) {
                // User denied account access...
                console.error(error)
                throw new Error(error)
            }
        }
        // Legacy dapp browsers...
        return window.web3.currentProvider
    }
    // window.web3 or window doesnt exist
    return new Web3('http://localhost:8545')
}

const setupWeb3 = async () => {
    await windowLoaded

    const provider = await getProvider()
    return new Web3(provider)
}

/* const setupWeb3Watchdog = async (web3) => {
  const netId = await web3.eth.net.getId()
  const websocket = netIdToWebsocket(netId)

  return new Web3(websocket)
} */

async function init() {
    const web3 = await setupWeb3()

    // const web3WS = await setupWeb3Watchdog(web3)

    /* 
     * Web3 API Methods
     */

    const getAccounts = () => web3.eth.getAccounts()
    const getBalance = account => web3.eth.getBalance(account)

    /**
     * getCurrentAccount
     * @returns {string} currentAccount in Metamask || Provider web3.eth.accounts[0]
    */
    const getCurrentAccount = async () => {
        const [account] = await getAccounts()

        return account
    }

    /**
     * getCurrentBalance
     * @returns {string} ETH balance in GWEI
    */
    const getCurrentBalance = async (acct) => {
        const account = acct || (await getAccounts())[0]
		console.log("TCL: getCurrentBalance -> account", account)

        return getBalance(account)
    }

    const getNetwork = async () => {
        const network = await web3.eth.net.getId()

        return netIdToName(network)
    }

    const getNetworkId = async () => web3.eth.net.getId()

    const utils = web3.utils

    /**
     * toWei // fromWei
     * @type {BigNumber}
     * @param {BigNumber} amount
     * @param {string} x = format['ether', ... ]
     * @returns {string}
     */
    const toWei = (amount, x) => utils.toWei(amount, x)
    const fromWei = (amount, x) => utils.fromWei(amount, x)
    const toBN = amount => utils.toBN(amount)

    const getBlockInfo = async (blockNumber = "pending") => web3.eth.getBlock(blockNumber)

    if (process.env.NODE_ENV === 'development') window.web3 = web3

    const networkName = await getNetwork()

    return {
        web3,
        get currentProvider() {
            return web3.currentProvider
        },
        networkName,
        getBlockInfo,
        getCurrentAccount,
        getCurrentBalance,
        getNetwork,
        getNetworkId,
        utils,
        toBN,
        fromWei,
        toWei,
    }
}

export default getWeb3API