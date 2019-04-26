module.exports = [
  // GNO Safe
  {
    name: 'GNO',
    markets: [
      { tokenA: 'WETH', tokenB: 'GNO' },
      { tokenA: 'OMG', tokenB: 'GNO' }
    ],
    operatorAddressIndex: 3, // 0x2dd2afa618f497efdb3a8c1707b06dc00b31fa19
    operatorAddress: '0x2dd2afa618f497efdb3a8c1707b06dc00b31fa19',
    safeAddress: '0xdb5dfe548e79441e709edd46f21d80cbd245b1be',
    safeModuleType: 'seller',
    safeModuleAddress: '0xa8fe9237c9b40d8b245d4df6050a51ecf5f878a0',
    uniswapArbitrageAddress: '0xcd398d14bf8cc9695bf6a5fda75b468dd0ee7cb9',
    minimumAmountInUsdForToken: 3000
  },

  // OMG Safe
  {
    name: 'OMG',
    markets: [{ tokenA: 'WETH', tokenB: 'OMG' }],
    operatorAddressIndex: 1, // 0xdc102852b2bc57b860d4a47ab112374f2bf0c944
    operatorAddress: '0xdc102852b2bc57b860d4a47ab112374f2bf0c944',
    safeAddress: '0x9a6dd72f073e66ab5b1890e1643771669ab08ed1',
    safeModuleType: 'complete',
    safeModuleAddress: '0xc483ef562ebca8f9b7b0bd8164d30d42e3876b24',
    uniswapArbitrageAddress: '0x28707055b3c3f6b02eE5c3b02c805F230955B46E'
  },

  // RDN Safe
  {
    name: 'RDN',
    markets: [
      { tokenA: 'WETH', tokenB: 'RDN' }
    ],
    operatorAddressIndex: 2, // 0xd954adf06a47e2577a382657e83bf8780435e7d6
    operatorAddress: '0xd954adf06a47e2577a382657e83bf8780435e7d6',
    safeAddress: '0x2f41a93b59acb94ca8cfd91178a2a537aed02bed',
    safeModuleType: 'complete',
    safeModuleAddress: '0xc9c197a4b2b69cc73cc3ad52f498fc1192bf61c0',
    uniswapArbitrageAddress: '0x9e24526EDb9dbc2872234935Ed92EF8c4bd79cc1'
  }
]