// FIXME, this should be injected in the repo layer using env vars
const MAINNET_BASE_API_DX = process.env.REACT_APP_MAINNET_BASE_API_DX
const RINKEBY_BASE_API_DX = process.env.REACT_APP_RINKEBY_BASE_API_DX
const MAINNET_BASE_API_BOTS = process.env.REACT_APP_MAINNET_BASE_API_BOTS
const RINKEBY_BASE_API_BOTS = process.env.REACT_APP_RINKEBY_BASE_API_BOTS

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
        "Authorization": network === 1 ? process.env.REACT_APP_MAINNET_DX_BOTS_API_AUTH : process.env.REACT_APP_RINKEBY_DX_BOTS_API_AUTH,
        "Content-Type": "application/json"
      }
    }
  }

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

  async getTokens() {
    const apiURL = `${this.dxApiURL}/v1/tokens`
    const { data } = await (await fetch(apiURL)).json()

    return data
  }

  async getMarkets() {
    const apiURL = `${this.dxApiURL}/v1/markets`
    const markets = await (await fetch(apiURL)).json()

    return markets.data
  }

  getTokenBalanceDx({ account, tokenAddress }) {
    if (Math.random() > 0.6) {
      return 0
    }

    return Math.random() * 40
  }

  async getTokenBalanceErc20({ account, tokenAddress }) {
    const erc20Token = await this.web3.getToken(tokenAddress)

    return erc20Token.methods.balanceOf(account).call()
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
}


export default DxService