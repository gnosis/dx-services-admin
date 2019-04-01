import httpLib from '../../utils/httpLib'
import botsAbout from '../../data/mock/botsAbout.json'
import tokens from '../../data/mock/tokens.json'
import markets from '../../data/mock/markets.json'

// FIXME, this should be injected in the repo layer using env vars
const BASE_API_DX = 'https://dutchx.d.exchange/api'
const MAINNET_BASE_API_BOTS = 'https://dx-services-bots.gnosis.pm/api/'
const RINKEBY_BASE_API_BOTS = 'https://dx-services-bots.staging.gnosisdev.com/api/'

class DxService {
  constructor({ network }) {
    // it should be injected the repos, for now we don't implement the repo layer
    console.debug('DX_SERVICES CONSTRUCTOR = ', network)
    this.network = network
  }

  getAbout() {
    //httpLib.get(BASE_API + '/about')
    return botsAbout
  }

  async getBots() {
    // TODO: Implement endpoint only for bot information
    //httpLib.get(BASE_API + '/about').then(about => )
    console.debug(`${(this.network === 1 ? MAINNET_BASE_API_BOTS : RINKEBY_BASE_API_BOTS)}/about`)
    const { bots } = await httpLib.get(`${(this.network === '1' ? MAINNET_BASE_API_BOTS : RINKEBY_BASE_API_BOTS)}/about`)
		console.log("TCL: getBots -> bots", bots)

    // Add an artificial id to the bots
    return bots.map((bot, index) => ({
      id: index,
      ...bot
    }))
  }

  getTokens() {
    return tokens.data
  }

  getMarkets() {
    return markets.data
  }

  getTokenBalanceDx({ account, tokenAddress }) {
    // https://dutchx.d.exchange/api/v1/accounts/0x2dd2afa618f497efdb3a8c1707b06dc00b31fa19/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
    if (Math.random() > 0.6) {
      return 0
    }

    return Math.random() * 40
  }

  getTokenBalanceErc20({ account, tokenAddress }) {
    if (Math.random() > 0.3) {
      return 0
    }
    // https://dutchx.d.exchange/api/v1/accounts/0x2dd2afa618f497efdb3a8c1707b06dc00b31fa19/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
    return Math.random() * 40
  }
}


export default DxService