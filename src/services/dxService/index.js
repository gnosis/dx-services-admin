import DxService from './DxService'
let instance, instancePromise

async function _getInstance() {
  return new DxService({})
}

export default async () => {
  if (!instance) {
    if (!instancePromise) {
      instancePromise = _getInstance()
    }

    instance = await instancePromise
  }

  return instance
}
