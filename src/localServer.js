require('dotenv').config()

const botAbout = require('./data/mock/botsAbout')
const bots = require('./data/mock/bots')
const safes = require('./data/mock/safes')
const cleared = require('./data/mock/cleared')
const markets = require('./data/mock/markets')
const marketStates = require('./data/mock/marketStates')
const tokens = require('./data/mock/tokens')
const tokenBalances = require('./data/mock/tokenBalances')

const express = require('express');
// const bodyParser = require('body-parser')
// const path = require('path');
const app = express();

// app.use(express.static(path.join(__dirname, 'build')));

// ******* Bots *******
app.get('/bots/about', (req, res) => {
  res.send(botAbout);
})

app.get('/bots/v1/bots', (req, res) => {
  res.send(bots);
})

app.get('/bots/v1/safes', (req, res) => {
  res.send(safes);
})

// ******* Api *******
app.get('/dx/v1/cleared', (req, res) => {
  res.send(cleared);
})

app.get('/dx/v1/markets', (req, res) => {
  res.send(markets);
})

app.get('/dx/v1/markets', (req, res) => {
  res.send(markets);
})

app.get('/dx/v1/markets/:token-:token/state-details', (req, res) => {
  const { token } = req.params
  console.log('State detail for ' + token)

  res.send(marketStates[token]);
})

app.get('/dx/v1/accounts/:account/current-liquidity-contribution-ratio', (req, res) => {
  res.send('0.005');
})

app.get('/dx/v1/accounts/:account/tokens/:token', (req, res) => {
  const { token } = req.params
  const balance = tokenBalances[token]
  res.send(balance ? balance : '0');
})

app.get('/dx/v1/tokens', (req, res) => {
  res.send(tokens);
})

const port = process.env.REACT_APP_API_PORT || 8081
app.listen(port)

console.log('Local Mock API listening on port ' + port)
console.log('    Try http://localhost:' + port + '/dx/v1/markets')
console.log('    Try http://localhost:' + port + '/bots/about')