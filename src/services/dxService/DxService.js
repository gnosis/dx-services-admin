const BOTS_API_BASE_URL = '-bots/api'
const DX_API_BASE_URL = '-dx/api'

// const MAINNET_BOTS_API_AUTH = process.env.REACT_APP_MAINNET_DX_BOTS_API_AUTH
// const RINKEBY_BOTS_API_AUTH = process.env.REACT_APP_RINKEBY_DX_BOTS_API_AUTH

class DxService {
  constructor({ network, web3 }) {
    // it should be injected the repos, for now we don't implement the repo layer
    this.network = network
    this.web3 = web3

    // Network specific API URLs
    const useMockApi = process.env.REACT_APP_MOCK === 'true'
    console.log('process.env.MOCK', process.env.REACT_APP_MOCK)
    console.log('useMockApi', useMockApi)
    let networkName
    if (useMockApi) {
      networkName = 'local'
    } else if (network === 1) {
      networkName = 'mainnet'
    } else if (network === 4) {
      networkName = 'rinkeby'
    }

    if (networkName) {
      this.botsApiURL = networkName + BOTS_API_BASE_URL
      this.dxApiURL = networkName + DX_API_BASE_URL
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
  async getAbout() {
    const apiURL = `${this.botsApiURL}/about`

    return (await fetch(apiURL, this.botsAuthorizationHeader)).json()
  }

  async getBots() {
    const apiURL = `${this.botsApiURL}/about`

    const { bots } = await (await fetch(apiURL, this.botsAuthorizationHeader)).json()

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
    const { data } = await (await fetch(apiURL)).json()

    return data
  }

  async getTokenBalanceDx({ account, token }) {
    const { address: tokenParam } = token

    const res = await (await fetch(`${this.dxApiURL}/v1/accounts/${account}/tokens/${tokenParam}`)).json()

    return res
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
    const markets = await (await fetch(apiURL)).json()

    return markets.data
  }

  async getMarketSellVolume(stAddress, btAddress) {
    const res = await (await fetch(`${this.dxApiURL}/v1/markets/${stAddress.toLowerCase()}-${btAddress.toLowerCase()}/sell-volume`)).json()

    return res
  }

  async getMarketBuyVolume(stAddress, btAddress) {
    const res = await (await fetch(`${this.dxApiURL}/v1/markets/${stAddress.toLowerCase()}-${btAddress.toLowerCase()}/buy-volume`)).json()

    return res
  }

  async getMarketState(stAddress, btAddress) {
    const res = await (await fetch(`${this.dxApiURL}/v1/markets/${stAddress.toLowerCase()}-${btAddress.toLowerCase()}/state`)).json()

    return res
  }

  async getMarketStartTime(stAddress, btAddress) {
    const res = await (await fetch(`${this.dxApiURL}/v1/markets/${stAddress.toLowerCase()}-${btAddress.toLowerCase()}/auction-start`)).json()

    return res
  }

  /*
   * LIQUIDITY CONTRIBUTION 
   */
  async getLiquidityContribution(accountAddress) {
    const res = await (await fetch(`${this.dxApiURL}/v1/accounts/${accountAddress}/current-liquidity-contribution-ratio`)).json()

    return res
  }

  /* 
   * SAFE MODULES
   */
  async getSafeModules() {
    const { default: res } = await new Promise(acc => {
      return setTimeout(() => acc(require('../../data/mock/safes')), 3000)
    })

    return res
  }
}


export default DxService
