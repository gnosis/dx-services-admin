require('dotenv').config()

const express = require('express');
// const bodyParser = require('body-parser')
// const path = require('path');
const app = express();

// app.use(express.static(path.join(__dirname, 'build')));

// ******* Bots *******
app.get('/bots/about', (req, res) => {
  res.send(require('./data/mock/botsAbout'));
})

app.get('/bots/safes', (req, res) => {
  res.send(require('./data/mock/safes'));
})



// ******* Api *******
app.get('/dx/v1/cleared', (req, res) => {
  res.send(require('./data/mock/cleared'));
})

app.get('/dx/v1/markets', (req, res) => {
  res.send(require('./data/mock/markets'));
})

app.get('/dx/v1/markets/:tokenA-:tokenB/state', (req, res) => {
  const { tokenA, tokenB } = req.params
  console.log('Asking state for %s and %s...', tokenA, tokenB)

  res.send('RUNNING');
})

app.get('/dx/v1/tokens', (req, res) => {
  res.send(require('./data/mock/tokens'));
})

const port = process.env.REACT_APP_API_PORT || 8080
app.listen(port)

console.log('Local Mock API listening on port ' + port)
console.log('    Try http://localhost:' + port + '/dx/v1/markets')
console.log('    Try http://localhost:' + port + '/bots/about')