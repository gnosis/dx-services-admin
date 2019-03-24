function getBotMasters(bots) {
  const _addIfNotInArray = (tokens, token) => {
    if (!tokens.includes(token)) {
      tokens.push(token)
    }
  }

  return bots.reduce((acc, bot) => {
    const { type, tokens, markets, botAddress } = bot
    if (type) {
      _addIfNotInArray(acc.botTypes, type)
    }

    if (tokens) {
      tokens.forEach(token => _addIfNotInArray(acc.tokens, token))
    }

    if (botAddress) {
      _addIfNotInArray(acc.botAddress, botAddress)
    }

    if (markets) {
      markets.forEach(({ tokenA, tokenB }) => {
        _addIfNotInArray(acc.tokens, tokenA)
        _addIfNotInArray(acc.tokens, tokenB)
      })
    }

    return acc
  }, {
      tokens: [],
      botTypes: [],
      botAddress: []
    })
}

export default getBotMasters