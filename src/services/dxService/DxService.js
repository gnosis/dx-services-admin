/* eslint-disable eqeqeq */

import { fetcher } from '../../utils'

const BOTS_API_BASE_URL = '-bots/api'
const DX_API_BASE_URL = '-dx/api'

class DxService {
  constructor({ network, web3 }) {
    // it should be injected the repos, for now we don't implement the repo layer
    this.network = network
    this.web3 = web3

    // Network specific API URLs
    const useMockApi = process.env.REACT_APP_MOCK === 'true'   
    
    console.debug('process.env.MOCK?', process.env.REACT_APP_MOCK)
    console.debug('useMockApi?', useMockApi)
    
    let networkName
    
    if (useMockApi) {
      networkName = 'local'
    } else if (network == 1) {
      networkName = 'mainnet'
    } else if (network == 4) {
      networkName = 'rinkeby'
    } else if (network == 42) {
      networkName = 'kovan'
    }
    
    const mainnetBaseUrl = process.env.REACT_APP_MAINNET_API_BASE_URL
    if (network == 1 && mainnetBaseUrl) {
      // Use absolute path for mainnet (if provided)
      this.botsApiURL = mainnetBaseUrl + '/' + networkName + BOTS_API_BASE_URL
      this.dxApiURL = mainnetBaseUrl + '/' + networkName + DX_API_BASE_URL
    } else if (networkName) {
      this.botsApiURL = '/' + networkName + BOTS_API_BASE_URL
      this.dxApiURL = '/' + networkName + DX_API_BASE_URL
    } else {
      console.error('Unknown network: ' + network)
    }

    // Auth Header (BOTS API)
    this.botsAuthorizationHeader = {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        // "Authorization": network === 1 ? MAINNET_BOTS_API_AUTH : RINKEBY_BOTS_API_AUTH,
      }
    }
  }

  /**
   * GENERAL API GRAB
   */
  getAbout = async () => fetcher(`${this.botsApiURL}/about`, this.botsAuthorizationHeader)

  async getBots() {
    const apiURL = `${this.botsApiURL}/v1/bots`
    const bots = await fetcher(apiURL, this.botsAuthorizationHeader)

    // Add an artificial id to the bots
    return bots.map((bot, index) => ({
      id: index,
      ...bot
    }))
  }

  /**
   * TOKEN BALANCES - DX & ERC20 & MGN
   */
  async getTokens() {
    const apiURL = `${this.dxApiURL}/v1/tokens`
    const res = await fetcher(apiURL)

    return res.data
  }

  async getTokenBalanceDx({ account, token }) {
    const { address: tokenParam } = token

    return fetcher(`${this.dxApiURL}/v1/accounts/${account}/tokens/${tokenParam}`)
  }

  async getTokenBalanceErc20({ account, tokenAddress }) {
    const erc20Token = await this.web3.getToken(tokenAddress)

    return erc20Token.methods.balanceOf(account).call()
  }

  /**
   * MARKET INFORMATION -  SELL, BUY VOLUMES, START TIMES, STATE
   */
  async getMarkets() {
    const apiURL = `${this.dxApiURL}/v1/markets`
    const res = await fetcher(apiURL)

    return res.data || res
  }

  getMarketSellVolume = async (stAddress, btAddress) => fetcher(`${this.dxApiURL}/v1/markets/${stAddress.toLowerCase()}-${btAddress.toLowerCase()}/sell-volume`)

  getMarketBuyVolume = async (stAddress, btAddress) => fetcher(`${this.dxApiURL}/v1/markets/${stAddress.toLowerCase()}-${btAddress.toLowerCase()}/buy-volume`)

  getMarketState = async (stAddress, btAddress) => fetcher(`${this.dxApiURL}/v1/markets/${stAddress.toLowerCase()}-${btAddress.toLowerCase()}/state-details`)

  getMarketStartTime = async (stAddress, btAddress) => fetcher(`${this.dxApiURL}/v1/markets/${stAddress.toLowerCase()}-${btAddress.toLowerCase()}/auction-start`)

  /*
   * LIQUIDITY CONTRIBUTION 
   */
  getLiquidityContribution = async (accountAddress) => fetcher(`${this.dxApiURL}/v1/accounts/${accountAddress}/current-liquidity-contribution-ratio`)

  /* 
   * SAFE MODULES
   */
  getSafeModules = async () => fetcher(`${this.botsApiURL}/v1/safes`)
}


export default DxService
