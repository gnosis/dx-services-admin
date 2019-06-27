import React, { useEffect, useState } from 'react'
import axios from 'axios'

import { Col, Table, Badge, FormGroup, Form } from 'reactstrap'
import { PageFilter, PageFilterSubmit, FilterLabel, PageWrapper } from '../../containers'

import ErrorHOC from '../../HOCs/ErrorHOC'
import Web3HOC from '../../HOCs/Web3HOC'

import AttentionBanner from '../../components/AttentionBanner'
import Loading from '../../components/Loading'
import ErrorPre from '../../components/Error'

import getDxService from '../../services/dxService'

import { shortenHash } from '../../utils'
import { FIXED_DECIMALS } from '../../globals'

import { from } from 'rxjs'

function tokenFromURL(url) {
	if (!url || (url.search('sellToken') === -1 || url.search('buyToken') === -1 || url.search('auctionIndex') === -1)) return false 

	const [[, sellToken], [, buyToken], [, auctionIndex]] = url
		.split('?')[1]
		.split('&')
		.map(item => item.split('='))	

	return { sellToken, buyToken, auctionIndex }
}

// GraphQL DutchX Query
const URL = 'https://api.thegraph.com/subgraphs/name/gnosis/dutchx'
const MAINNET_WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const MAINNET_GNO_ADDRESS = '0x6810e776880c02933d47db1b9fc05908e5386b96'

function Traders({ web3 }) {
  // DefaultState
  const defaultState = {
    // Tokens
    sellTokenFilter: tokenFromURL(window.location.href) ? tokenFromURL(window.location.href).sellToken : MAINNET_WETH_ADDRESS,
    buyTokenFilter: tokenFromURL(window.location.href) ? tokenFromURL(window.location.href).buyToken : MAINNET_GNO_ADDRESS,
    specificAuction: tokenFromURL(window.location.href) ? tokenFromURL(window.location.href).auctionIndex : 1,
    numberOfTraders: 50,
    numberOfBuyOrders: 10,
    numberOfSellOrders: 10,
  }

  // State + Setters
  const [trades, setTrades]                         = useState([])
  const [network, setNetwork]                       = useState(undefined)
  const [availableTokens, setAvailableTokens]       = useState([])
  // Data Filters
  const [buyTokenFilter, setBuyTokenFilter]         = useState(defaultState.buyTokenFilter)
  const [sellTokenFilter, setSellTokenFilter]       = useState(defaultState.sellTokenFilter)
  const [numberOfTraders, setNumberOfTraders]       = useState(defaultState.numberOfTraders)
  const [specificAuction, setSpecificAuction]       = useState(defaultState.specificAuction)
  const [numberOfBuyOrders, setNumberOfBuyOrders]   = useState(defaultState.numberOfBuyOrders)
  const [numberOfSellOrders, setNumberOfSellOrders] = useState(defaultState.numberOfSellOrders)
  // App
  const [error, setError]                           = useState(undefined)
  const [loading, setLoading]                       = useState(false)

  useEffect(() => {
    setLoading(true)

    async function mountLogic() {
      try {
        const bcNetwork = network || await web3.getNetworkId()
        const dxService = await getDxService(bcNetwork, web3)

        // get all available tokens on DutchX Protocol
        const tokens = await dxService.getTokens()

        return tokens
      } catch (mountError) {
        console.error(mountError)
        throw new Error(mountError)
      }
    }

    const mountSubscription = from(mountLogic())
      .subscribe({
        next: tokens => setAvailableTokens(tokens),
        error: appError => setError(appError),
        complete: () => setLoading(false),
      })

    return () => {
      mountSubscription && mountSubscription.unsubscribe()
    }
  }, [])

  // mount logic
  // 1. load endpoint Traders data
  // 2. set to state
  useEffect(() => {
    // load data
    async function graphQLDataFetch() {
      try {
        const bcNetwork = network || await web3.getNetworkId()
        
        const { data : { data } } = await axios.post(URL, { 
          query: `{
            auctions(where: { id: "${sellTokenFilter}-${buyTokenFilter}-${specificAuction}" }) {
              traders (first: ${numberOfTraders}) {
                id
                buyOrders(first: ${numberOfBuyOrders}) {
                  amount
                  timestamp
                  transactionHash
                }
                sellOrders(first: ${numberOfSellOrders}) {
                  amount
                  timestamp
                  transactionHash
                }
              }
            }
          }`
        })

        if (!data.auctions || !data.auctions.length) throw new Error('Range too large/small or no record of data at set params - please try a different filter combination')
 
        // Cache auctions
        const { auctions: [{ traders }] } = data
        
        // Auto sort new choices DESC
        // auctions.sort((a, b) => b.auctionIndex - a.auctionIndex)

        return {
          bcNetwork, 
          traders,
        }
      } catch (error) {
        const err = new Error(error.message)
        console.error(err)
        throw err
      }
    }

    setLoading(true)

    const tradesSub = from(graphQLDataFetch())
    .subscribe({
      next: ({
        bcNetwork,
        traders,
      }) => {
        setNetwork(bcNetwork)
        setTrades(traders)
      },
      error: appError => {
        setError(appError)
        setLoading(false)
      },
      complete: () => {
        setError(undefined)
        setLoading(false)
      },
    })

    return () => {
      tradesSub && tradesSub.unsubscribe()
    }
  }, [sellTokenFilter, buyTokenFilter, numberOfTraders, numberOfBuyOrders, numberOfSellOrders, specificAuction])

  // eslint-disable-next-line eqeqeq
  const renderEtherscanLink = (address, section, text, type = 'address', style) => <a href={`https://${network == '4' ? 'rinkeby.etherscan' : 'etherscan'}.io/${type}/${address}${section ? '#' + section : ''}`} target="_blank" rel="noopener noreferrer" style={style}>{text || address}</a>
  // const renderAccountLink = address => address && <Link to={'/accounts/' + address}>{address}</Link>

  const renderTrades = ({
    id,
    buyOrders,
    sellOrders,
  }) =>
    <tr key={id}>
      {/* ID */}
      <td>
        <Badge 
          color="success" pill
        >
          {renderEtherscanLink(id, null, shortenHash(id, 38), 'address', { color: 'white', fontSize: '1.2em' })}
        </Badge>
      </td>
      {/* BUY SECTION */}
      <td>
        <Table>
          <thead>
            <tr>
              <th>Hash</th>
              <th>Amount</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {(
              buyOrders.map(({ amount, transactionHash, timestamp }) => 
                <tr key={transactionHash}>
                  <td><code title={transactionHash} style={{cursor: 'pointer'}}>{renderEtherscanLink(transactionHash, null, shortenHash(transactionHash), 'tx')}</code></td>
                  <td>{(amount/10**18).toFixed(FIXED_DECIMALS)}</td>
                  <td>{(new Date(timestamp * 1000)).toUTCString()}</td>
                </tr>
            ))}
          </tbody>
        </Table>
      </td>
      {/* SELL SECTION */}
      <td>
        <Table>
            <thead>
              <tr>
                <th>Hash</th>
                <th>Amount</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {(
                sellOrders.map(({ amount, transactionHash, timestamp }) => 
                  <tr key={transactionHash}>
                    <td><code title={transactionHash} style={{cursor: 'pointer'}}>{renderEtherscanLink(transactionHash, null, shortenHash(transactionHash), 'tx')}</code></td>
                    <td>{(amount/10**18).toFixed(FIXED_DECIMALS)}</td>
                    <td>{(new Date(timestamp * 1000)).toUTCString()}</td>
                  </tr>
              ))}
            </tbody>
          </Table>
      </td>
    </tr>

  // Data Loading
  if (loading) return <Loading />
  
  return (
    <PageWrapper pageTitle="DutchX Past Auctions">
      <AttentionBanner title="MAINNET ONLY" subText="This feature is currently only available for Mainnet. Please check back later for data on other networks."/>
      <Form>
        <FormGroup row>
          {/* Filter SellToken */}
          <Col sm={6} className="py-2">
            <p>Token Filters</p>
            <PageFilter
              type="select"
              title="Sell Token"
              showWhat={sellTokenFilter}
              changeFunction={event => setSellTokenFilter(event.target.value)}
              inputName="trades"
              render={availableTokens.map(({ name, address, symbol }) => <option key={address + Math.random()} value={address}>{name} [{symbol}]</option>)}
            />
            {/* Filter BuyToken */}
            <PageFilter
              type="select"
              title="Buy Token"
              showWhat={buyTokenFilter}
              changeFunction={event => setBuyTokenFilter(event.target.value)}
              inputName="trades"
              render={availableTokens.map(({ name, address, symbol }) => <option key={address + Math.random()} value={address}>{name} [{symbol}]</option>)}
            />
          </Col>
          {/* Filter Number of Traders/Specific Auction Range Type */}
          <Col sm={6} className="py-2">
            <p>Trade / Auction Filters</p>
            <PageFilterSubmit
              type="number"
              title="Number of traders to show"
              showWhat={numberOfTraders}
              submitFunction={setNumberOfTraders}
              inputName="trades"
            />
            {/* Filter specific auction index to show */}
            <PageFilterSubmit
              type="number"
              title="Specific auction to show"
              showWhat={numberOfTraders}
              submitFunction={setSpecificAuction}
              inputName="trades"
            />
          </Col>
          {/* Filter Sell/Buy Orders */}
          <Col sm={6} className="py-2">
              <p>Order Filters</p>
              {/* Sell Orders */}
              <PageFilterSubmit
                type="number"
                title="Number of sell orders to show"
                showWhat={numberOfSellOrders}
                submitFunction={setNumberOfSellOrders}
                inputName="trades"
              />
              {/* Buy Orders */}
              <PageFilterSubmit
                type="number"
                title="Number of buy orders to show"
                showWhat={numberOfBuyOrders}
                submitFunction={setNumberOfBuyOrders}
                inputName="trades"
              />
            </Col>
        </FormGroup>
      </Form>
       
      {/* FILTER LABELS */}
      <>
        {specificAuction && 
          <FilterLabel 
            onClickHandler={() => setSpecificAuction(defaultState.specificAuction)}
            filterData={specificAuction}
            filterTitle = "Selected Auction"
          />
        }
        {numberOfTraders && 
          <FilterLabel 
            onClickHandler={() => setNumberOfTraders(defaultState.numberOfTraders)}
            filterData={numberOfTraders}
            filterTitle = "Number of Traders"
          />
        }
        {numberOfBuyOrders && 
          <FilterLabel 
            onClickHandler={() => setNumberOfBuyOrders(defaultState.numberOfBuyOrders)}
            filterData={numberOfBuyOrders}
            filterTitle = "Number of Buy Orders"
          />
        }
        {numberOfSellOrders && 
          <FilterLabel 
            onClickHandler={() => setNumberOfSellOrders(defaultState.numberOfSellOrders)}
            filterData={numberOfSellOrders}
            filterTitle = "Number of Sell Orders"
          />
        }
      </>

      {error 
        ?
      <ErrorPre error={error} errorTitle=""/>
        :
      <Table responsive hover>
        <thead>
          <tr>
            <th>Trader Account</th>
            <th>Buy Order</th>
            <th>Sell Orders</th>
          </tr>
        </thead>
        <tbody>
          {trades && trades.map(trade => renderTrades(trade))}
        </tbody>
      </Table>}
    </PageWrapper>
  )
}

export default ErrorHOC(Web3HOC(Traders))
