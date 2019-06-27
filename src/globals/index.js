export const FIXED_DECIMALS = 4
export const OWL_ALLOWANCE_THRESHOLD = 100000
export const MGN_PROXY_ADDRESSES = {
    1: '0x80f222a749a2e18eb7f676d371f19ad7efeee3b7',
    4: '0x4ed5e1ec6bdbecf5967fe257f60e05237db9d583',
    42: '0x2b3a76ed4edb76e8fcd261fd978e78efb313d5a2',
}
export const OWL_PROXY_ADDRESSES = {
    1: '0x1a5f9352af8af974bfc03399e3767df6370d82e4',
    4: '0xa7d1c04faf998f9161fc9f800a99a809b84cfc9d',
    42: '0xb6f77a34ff81dd13fa68b5774d74541a61047fe8',
}
export const DUTCHX_PROXY_ADDRESSES = {
    1: '0xb9812e2fa995ec53b5b6df34d21f9304762c5497',
    4: '0xaaeb2035ff394fdb2c879190f95e7676f1a9444b',
    42: '0x775ea749a82a87f12199019e5166980f305f4c8f',
}

export const DX_GRAPHS_URL = 'https://explore.duneanalytics.com/public/dashboards/nigajDs8cp1lkmoXYNgdo3jMh2XCzUIiLk0J5Fst'

// GraphQL DutchX Query
export const GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/gnosis/dutchx'
export const MAINNET_WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
export const MAINNET_GNO_ADDRESS = '0x6810e776880c02933d47db1b9fc05908e5386b96'

/* export const MGN_PROXY_ADDRESSES = new Proxy(
    {
        1: '0x80f222a749a2e18eb7f676d371f19ad7efeee3b7',
        4: '0x4ed5e1ec6bdbecf5967fe257f60e05237db9d583',
    }, 
    { 
        get: (object, property) => object[property] ? object[property] : 'UNKNOWN ADDRESS - CHECK PROVIDER NETWORK'
}) */
