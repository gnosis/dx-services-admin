export const FIXED_DECIMALS = 4
export const MGN_PROXY_ADDRESSES = {
    1: '0x80f222a749a2e18eb7f676d371f19ad7efeee3b7',
    4: '0x4ed5e1ec6bdbecf5967fe257f60e05237db9d583',
}
export const OWL_PROXY_ADDRESSES = {
    1: '0x1a5f9352af8af974bfc03399e3767df6370d82e4',
    4: '0xa7d1c04faf998f9161fc9f800a99a809b84cfc9d',
}

/* export const MGN_PROXY_ADDRESSES = new Proxy(
    {
        1: '0x80f222a749a2e18eb7f676d371f19ad7efeee3b7',
        4: '0x4ed5e1ec6bdbecf5967fe257f60e05237db9d583',
    }, 
    { 
        get: (object, property) => object[property] ? object[property] : 'UNKNOWN ADDRESS - CHECK PROVIDER NETWORK'
}) */
