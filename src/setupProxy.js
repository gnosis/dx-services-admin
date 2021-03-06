require('dotenv').config()

const proxy = require('http-proxy-middleware')
const assert = require('assert')
const LOG_LEVEL = 'debug'
const LOCAL_API_PORT = process.env.REACT_APP_API_PORT || 8081

const BOTS_AUTH_RINKEBY = process.env.REACT_APP_BOTS_API_PROXY_AUTH_RINKEBY
const BOTS_AUTH_KOVAN = process.env.REACT_APP_BOTS_API_PROXY_AUTH_KOVAN
const BOTS_AUTH_MAINNET = process.env.REACT_APP_BOTS_API_PROXY_AUTH_MAINNET
assert(BOTS_AUTH_RINKEBY, 'Required env var: REACT_APP_BOTS_API_PROXY_AUTH_RINKEBY')
assert(BOTS_AUTH_KOVAN, 'Required env var: REACT_APP_BOTS_API_PROXY_AUTH_KOVAN')
assert(BOTS_AUTH_MAINNET, 'Required env var: REACT_APP_BOTS_API_PROXY_AUTH_MAINNET')

const networks = [
  // LOCAL: Api
  {
    source: '/local-dx/api',
    target: `http://localhost:${LOCAL_API_PORT}`,
    pathRewrite: '/dx',
    changeOrigin: false
  },

  // LOCAL: Bots
  {
    source: '/local-bots/api',
    target: `http://localhost:${LOCAL_API_PORT}`,
    pathRewrite: '/bots',
    changeOrigin: false
  },

  // RINKEBY: Api
  {
    source: '/rinkeby-dx/api',
    target: 'https://dutchx-rinkeby.d.exchange'
  },

  // RINKEBY: Bots
  {
    source: '/rinkeby-bots/api',
    target: 'https://dx-services-bots.staging.gnosisdev.com',
    auth: BOTS_AUTH_RINKEBY
  },

  // KOVAN: Api
  {
    source: '/kovan-dx/api',
    target: 'https://dx-services.kovan.staging.gnosisdev.com'
  },

  // KOVAN: Bots
  {
    source: '/kovan-bots/api',
    target: 'https://dx-services-bots.kovan.staging.gnosisdev.com',
    auth: BOTS_AUTH_KOVAN
  },

  // MAINNET: Api
  {
    source: '/mainnet-dx/api',
    target: 'https://dutchx.d.exchange'
  },

  // MAINNET: Bots
  {
    source: '/mainnet-bots/api',
    target: 'https://dx-services-bots.gnosis.pm',
    auth: BOTS_AUTH_MAINNET
  }
]

module.exports = function (app) {
  networks.forEach(({
    source,
    target,
    secure = false,
    pathRewrite = '/api',
    changeOrigin = true,
    auth
  }) => {
    // const path = `/${networkName}-bots/api`
    console.log(
      'Create %s: %s --> %s%s',
      auth ? 'Authenticated Proxy' : 'Proxy',
      source,
      target,
      pathRewrite
    )

    app.use(proxy(source, {
      target,
      pathRewrite: {
        ['^' + source]: pathRewrite
      },
      logLevel: LOG_LEVEL,
      changeOrigin,
      auth,
      secure
    }))
  })

  // throw new Error('a!')

}