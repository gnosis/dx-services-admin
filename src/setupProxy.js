const proxy = require('http-proxy-middleware')
const assert = require('assert')

const BOTS_API_PROXY_AUTH_RINKEBY = process.env.BOTS_API_PROXY_AUTH_RINKEBY
const BOTS_API_PROXY_AUTH_MAINNET = process.env.BOTS_API_PROXY_AUTH_MAINNET
assert(BOTS_API_PROXY_AUTH_RINKEBY, 'Required env var: BOTS_API_PROXY_AUTH_RINKEBY')
assert(BOTS_API_PROXY_AUTH_MAINNET, 'Required env var: BOTS_API_PROXY_AUTH_MAINNET')


const DX_API = {
  mainnet: 'https://dutchx.d.exchange',
  rinkeby: 'https://dutchx-rinkeby.d.exchange'
}

const BOTS_API = {
  mainnet: 'https://dx-services-bots.gnosis.pm',
  rinkeby: 'https://dx-services-bots.staging.gnosisdev.com'
}

const BOTS_API_AUTH = {
  mainnet: BOTS_API_PROXY_AUTH_RINKEBY,
  rinkeby: BOTS_API_PROXY_AUTH_MAINNET
}

module.exports = function (app) {
  const localPort = process.env.API_PORT || 8080
  app.use(proxy('/local-bots/api', {
    target: `http://localhost:${localPort}`,
    pathRewrite: {
      '^/local-bots/api': '/bots'
    },
    logLevel: 'debug'
  }))

  app.use(proxy('/local-dx/api', {
    target: `http://localhost:${localPort}`,
    pathRewrite: {
      '^/local-dx/api': '/dx'
    },
    logLevel: 'debug'
  }))


  app.use(proxy('/rinkeby-bots/api', {
    target: BOTS_API.rinkeby,
    pathRewrite: {
      '^/rinkeby-bots/api': '/api'
    },
    changeOrigin: true,
    logLevel: 'debug',
    auth: BOTS_API_AUTH.rinkeby
  }))

  app.use(proxy('/rinkeby-dx/api', {
    target: DX_API.rinkeby,
    pathRewrite: {
      '^/rinkeby-dx/api': '/api'
    },
    logLevel: 'debug',
    changeOrigin: true
  }))

  app.use(proxy('/mainnet-bots/api', {
    target: BOTS_API.mainnet,
    pathRewrite: {
      '^/mainnet-bots/api': '/api'
    },
    changeOrigin: true,
    logLevel: 'debug',
    auth: BOTS_API_AUTH.mainnet
  }))

  app.use(proxy('/mainnet-dx/api', {
    target: DX_API.mainnet,
    pathRewrite: {
      '^/mainnet-dx/api': '/api'
    },
    logLevel: 'debug',
    changeOrigin: true
  }))



}