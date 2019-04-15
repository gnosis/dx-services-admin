# DutchX service admin
Web administration that shows information about the DutchX including:
* Markets listed in the DutchX
* Running bots and their config
* Info about accounts balances
* Trades for every market

## Run locally

Create a file called `.env` file. Use [.env.example](.env.example) as an example.

```
# Install dependencies
yarn install

# Run app
yarn start
```

Check out:
* **Web admin**: [http://localhost:3000](http://localhost:3000)
* **DutchX API**:
  * `Rinkeby`: i.e. Markets: [http://localhost:3000/rinkeby-dx/api/v1/markets](http://localhost:3000/rinkeby-dx/api/v1/markets)
  * `Mainnet`: i.e. Markets: [http://localhost:3000/mainnet-dx/api/v1/markets](http://localhost:3000/mainnet-dx/api/v1/markets)
* **Bots API**: 
  * `Rinkeby`: i.e. About: [http://localhost:3000/rinkeby-bots/api/about](http://localhost:3000/rinkeby-bots/api/about)
  * `Mainnet`: i.e. About: [http://localhost:3000/mainnet-bots/api/about](http://localhost:3000/mainnet-bots/api/about)

## Run using local mock endpoints
```
# Install dependencies
yarn install

# Run the local mock API server (in one tab)
yarn server

# Run in mock mode (in another tab)
REACT_APP_MOCK=true yarn start
```

Check out:
* **Web admin**: [http://localhost:3000](http://localhost:3000)
* **DutchX API**:
  * `Local Mock API`: i.e. Markets: [http://localhost:3000/local-dx/api/v1/markets](http://localhost:3000/local-dx/api/v1/markets)
* **Bots API**: 
  * `Local Mock API`: i.e. Markets: [http://localhost:3000/local-bots/api/about](http://localhost:3000/local-bots/api/about)


## Build
```
yarn build
```