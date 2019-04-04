import DxService from './DxService'
let instance, instancePromise

async function _getInstance(network, web3) {
  return new DxService({ network, web3 })
}

export default async (network, web3) => {
  if (!instance) {
    if (!instancePromise) {
      instancePromise = _getInstance(network, web3)
    }

    instance = await instancePromise
  }

  return instance
}
