import httpLib from '../../utils/httpLib'
import botsAbout from '../../data/mock/botsAbout.json'
import tokens from '../../data/mock/tokens.json'
import markets from '../../data/mock/markets.json'

// FIXME, this should be injected in the repo layer using env vars
const BASE_API_DX = 'https://dutchx.d.exchange/api'
const BASE_API_BOTS = 'https://dx-services.staging.gnosisdev.com/api'

class DxService {
  // constructor() {
  //   // it should be injected the repos, for now we don't implement the repo layer
  // }

  getAbout() {
    //httpLib.get(BASE_API + '/about')
    return botsAbout
  }

  getBots() {
    // TODO: Implement endpoint only for bot information
    //httpLib.get(BASE_API + '/about').then(about => )
    const bots = botsAbout.bots

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