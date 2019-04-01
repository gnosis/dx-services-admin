import DxService from './DxService'
let instance, instancePromise

async function _getInstance(network) {
  return new DxService({ network })
}

export default async (network) => {
  if (!instance) {
    if (!instancePromise) {
      instancePromise = _getInstance(network)
    }

    instance = await instancePromise
  }

  return instance
}
