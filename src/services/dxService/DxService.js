// FIXME, this should be injected in the repo layer using env vars
const MAINNET_BASE_API_DX = process.env.REACT_APP_MAINNET_BASE_API_DX
const RINKEBY_BASE_API_DX = process.env.REACT_APP_RINKEBY_BASE_API_DX
const MAINNET_BASE_API_BOTS = process.env.REACT_APP_MAINNET_BASE_API_BOTS
const RINKEBY_BASE_API_BOTS = process.env.REACT_APP_RINKEBY_BASE_API_BOTS

const MAINNET_BOTS_API_AUTH = process.env.REACT_APP_MAINNET_DX_BOTS_API_AUTH
const RINKEBY_BOTS_API_AUTH = process.env.REACT_APP_RINKEBY_DX_BOTS_API_AUTH

class DxService {
  constructor({ network, web3 }) {
    // it should be injected the repos, for now we don't implement the repo layer
    this.network = network
    this.web3 = web3

    // Network specific API URLs
    this.botsApiURL = network === 1 ? MAINNET_BASE_API_BOTS : RINKEBY_BASE_API_BOTS
    this.dxApiURL = network === 1 ? MAINNET_BASE_API_DX : RINKEBY_BASE_API_DX

    // Auth Header (BOTS API)
    this.botsAuthorizationHeader = {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": network === 1 ? MAINNET_BOTS_API_AUTH : RINKEBY_BOTS_API_AUTH,
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

  async getMarketSellVolume(sellToken, buyToken) {
    const res = await (await fetch(`${this.dxApiURL}/v1/markets/${sellToken.toLowerCase()}-${buyToken.toLowerCase()}/sell-volume`)).json()
    
    return res
  }

  async getMarketBuyVolume(sellToken, buyToken) {
    const res = await (await fetch(`${this.dxApiURL}/v1/markets/${sellToken.toLowerCase()}-${buyToken.toLowerCase()}/buy-volume`)).json()
    
    return res
  }

  async getMarketState(sellToken, buyToken) {
    const res = await (await fetch(`${this.dxApiURL}/v1/markets/${sellToken.toLowerCase()}-${buyToken.toLowerCase()}/state`)).json()
    
    return res
  }

  async getMarketStartTime(sellToken, buyToken) {
    const res = await (await fetch(`${this.dxApiURL}/v1/markets/${sellToken.toLowerCase()}-${buyToken.toLowerCase()}/auction-start`)).json()
    
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
