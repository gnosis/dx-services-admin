const DEFAULT_API_PORT = 8080

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
app.get('/dx/cleared', (req, res) => {
  res.send(require('./data/mock/cleared'));
})

app.get('/dx/markets', (req, res) => {
  res.send(require('./data/mock/markets'));
})

app.get('/dx/tokens', (req, res) => {
  res.send(require('./data/mock/tokens'));
})


const port = process.env.API_PORT || DEFAULT_API_PORT
app.listen(port)

console.log('Local Mock API listening on port ' + port)
console.log('    Try http://localhost:' + port + '/dx/markets')
console.log('    Try http://localhost:' + port + '/bots/about')