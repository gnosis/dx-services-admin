/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react'
import axios from 'axios'

import { Col, Table, Badge, FormGroup, Form } from 'reactstrap'
import { PageFilter, PageFilterSubmit, FilterLabel, PageWrapper } from '../../containers'

import ErrorHOC from '../../HOCs/ErrorHOC'
import Web3HOC from '../../HOCs/Web3HOC'

import AttentionBanner from '../../components/AttentionBanner'
import Loading from '../../components/Loading'
import ErrorPre from '../../components/Error'
import RotateButton from '../../components/RotateButton'

import { getTokensAndNetwork } from '../../api'

import { shortenHash, tokenListToName, setURLFilterParams, formatTime, queryLineMaker } from '../../utils'
import { FIXED_DECIMALS, GRAPH_URL } from '../../globals'

import { from } from 'rxjs'

function tokenFromURL(url) {
	if (!url || (url.search('sellToken') === -1 || url.search('buyToken') === -1 || url.search('auctionIndex') === -1)) return false 

	const [[, sellToken], [, buyToken], [, auctionIndex]] = url
		.split('?')[1]
		.split('&')
		.map(item => item.split('='))	

	return { sellToken, buyToken, auctionIndex }
}

function PastAuctionTrades({ web3 }) {
  // DefaultState
  const defaultState = {
    // Tokens
    sellTokenFilter: tokenFromURL(window.location.href) && tokenFromURL(window.location.href).sellToken ? tokenFromURL(window.location.href).sellToken : '',
    buyTokenFilter: tokenFromURL(window.location.href) && tokenFromURL(window.location.href).buyToken ? tokenFromURL(window.location.href).buyToken : '',
    specificAuction: tokenFromURL(window.location.href) && tokenFromURL(window.location.href).auctionIndex ? tokenFromURL(window.location.href).auctionIndex : '',
    // numberOfTraders: 50,
    numberOfBuyOrders: 20,
    numberOfSellOrders: 20,
  }

  // State + Setters
  const [trades, setTrades]                         = useState([])
  const [network, setNetwork]                       = useState(undefined)
  const [availableTokens, setAvailableTokens]       = useState([])
  // Data Filters
  const [buyTokenFilter, setBuyTokenFilter]         = useState(defaultState.buyTokenFilter)
  const [sellTokenFilter, setSellTokenFilter]       = useState(defaultState.sellTokenFilter)
  // const [numberOfTraders, setNumberOfTraders]       = useState(defaultState.numberOfTraders)
  const [specificAuction, setSpecificAuction]       = useState(defaultState.specificAuction)
  const [numberOfBuyOrders, setNumberOfBuyOrders]   = useState(defaultState.numberOfBuyOrders)
  const [numberOfSellOrders, setNumberOfSellOrders] = useState(defaultState.numberOfSellOrders)
  // App
  const [error, setError]                           = useState(undefined)
  const [loading, setLoading]                       = useState(false)

  useEffect(() => {
    setLoading(true)

    const mountSubscription = from(getTokensAndNetwork(web3, network))
      .subscribe({
        next: ({ tokens, bcNetwork }) => {
          setNetwork(bcNetwork)
          setAvailableTokens(tokens)
        },
        error: appError => setError(appError),
        complete: () => setLoading(false),
      })

    return () => {
      mountSubscription && mountSubscription.unsubscribe()
    }
  }, [])

  // mount logic
  // 1. load endpoint PastAuctionTrades data
  // 2. set to state
  useEffect(() => {
    setError(undefined)
    // load data
    async function graphQLDataFetch() {
      try {
        const query = `{
          auctions(
            where: {
              ${queryLineMaker(sellTokenFilter, 'sellToken')}
              ${queryLineMaker(buyTokenFilter, 'buyToken')}
              ${queryLineMaker(specificAuction, 'auctionIndex')}
            }
          ) {
            id
            sellOrders(
              first: ${numberOfSellOrders}, 
              orderBy: timestamp
            ) {
              trader {
                id
              }
              amount
              timestamp
              transactionHash
            }
            buyOrders(
              first: ${numberOfBuyOrders}, 
              orderBy: timestamp
            ) {
              trader {
                id
              }
              amount
              timestamp
              transactionHash
            }
          }
        }`

        const { data : { data } } = await axios.post(GRAPH_URL, { query })

        if (!data.auctions || !data.auctions.length) throw new Error('Range too large/small or no record of data at set params - please try a different filter combination')
 
        // Cache auctions
        const { auctions } = data
        console.log("TCL: graphQLDataFetch -> auctions", auctions)
        
        // Auto sort new choices DESC
        // auctions.sort((a, b) => b.auctionIndex - a.auctionIndex)

        return auctions
      } catch (error) {
        const err = new Error(error.message)
        console.error(err)
        throw err
      }
    }

    setLoading(true)

    const tradesSub = from(graphQLDataFetch())
    .subscribe({
      next: (auctions) => {
        setTrades(auctions)
        
        setURLFilterParams(`?${sellTokenFilter ? `sellToken=${sellTokenFilter}&` : ''}${buyTokenFilter ? `buyToken=${buyTokenFilter}&` : ''}${specificAuction ? `auctionIndex=${specificAuction}&` : ''}`)
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
  }, [sellTokenFilter, buyTokenFilter, numberOfBuyOrders, numberOfSellOrders, specificAuction])

  const handleRotateButton = () => {
    setSellTokenFilter(buyTokenFilter)
    setBuyTokenFilter(sellTokenFilter)
  }

  const renderEtherscanLink = (address, section, text, type = 'address', style) => <a href={`https://${network == '4' ? 'rinkeby.etherscan' : 'etherscan'}.io/${type}/${address}${section ? '#' + section : ''}`} target="_blank" rel="noopener noreferrer" style={style}>{text || address}</a>

  const renderTrades = ({
    id,
    buyOrders,
    sellOrders,
  }) => {
    const [sellToken, buyToken, auctionIndex] = id.split('-')
    const { sellSymbol, buySymbol } = tokenListToName(availableTokens, sellToken, buyToken)

    return (
      <tr key={id}>
        {/* Market */}
        <td>
          <Badge 
            color="success" pill
          >
            {sellSymbol}-{buySymbol}-{auctionIndex}
          </Badge>
        </td>
        {/* BUY SECTION */}
        <td>
          <Table>
            <thead>
              <tr>
                <th>Trader</th>
                <th>TX Hash</th>
                <th>Amount</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {(
                buyOrders.map(({ amount, trader: { id: trader }, transactionHash, timestamp }) => 
                  <tr key={transactionHash}>
                    <td><code title={trader} style={{cursor: 'pointer'}}>{renderEtherscanLink(trader, null, shortenHash(trader, 37), 'address')}</code></td>
                    <td><code title={transactionHash} style={{cursor: 'pointer'}}>{renderEtherscanLink(transactionHash, null, shortenHash(transactionHash), 'tx')}</code></td>
                    <td>{(amount/10**18).toFixed(FIXED_DECIMALS)}</td>
                    <td>{formatTime(timestamp)}</td>
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
                  <th>Trader</th>
                  <th>TX Hash</th>
                  <th>Amount</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {(
                  sellOrders.map(({ amount, trader: { id: trader }, transactionHash, timestamp }) => 
                    <tr key={transactionHash}>
                      <td><code title={trader} style={{cursor: 'pointer'}}>{renderEtherscanLink(trader, null, shortenHash(trader, 37), 'address')}</code></td>
                      <td><code title={transactionHash} style={{cursor: 'pointer'}}>{renderEtherscanLink(transactionHash, null, shortenHash(transactionHash), 'tx')}</code></td>
                      <td>{(amount/10**18).toFixed(4)}</td>
                      <td>{formatTime(timestamp)}</td>
                    </tr>
                ))}
              </tbody>
            </Table>
        </td>
      </tr>
    )
  }
  
  return (
    <PageWrapper pageTitle="DutchX Past Auctions">
      <AttentionBanner title="MAINNET ONLY" subText="This feature is currently only available for Mainnet. Please check back later for data on other networks."/>
      <Form>
        <FormGroup row>
          {/* Filter SellToken */}
          <div 
            style={{
              flexFlow: 'row nowrap',
              display: 'flex',
              justifyContent: 'stretch',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <Col sm={6} className="py-2" style={{ minWidth: '88%' }}>
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
            <RotateButton 
              onClickHandler={handleRotateButton}
            />
          </div>
          {/* Filter Number of Traders/Specific Auction Range Type */}
          <Col sm={6} className="py-2">
            {/* <PageFilterSubmit
              type="number"
              title="Number of traders to show"
              showWhat={numberOfTraders}
              submitFunction={setNumberOfTraders}
              inputName="trades"
            /> */}
            <PageFilterSubmit
              type="number"
              title="Specific auction to show"
              // showWhat={numberOfTraders}
              submitFunction={setSpecificAuction}
              inputName="trades"
            />
          </Col>
          {/* Filter Sell/Buy Orders */}
          <Col sm={6} className="py-2">
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
        {/* {numberOfTraders && 
          <FilterLabel 
            onClickHandler={() => setNumberOfTraders(defaultState.numberOfTraders)}
            filterData={numberOfTraders}
            filterTitle = "Number of Traders"
          />
        } */}
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
      loading
        ?
      <Loading />
        :
      <Table responsive hover>
        <thead>
          <tr>
            <th>Market</th>
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

export default ErrorHOC(Web3HOC(PastAuctionTrades))
