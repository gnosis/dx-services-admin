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

import { shortenHash, tokenListToName, setURLFilterParams, formatTime, rZC } from '../../utils'
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

function Trades({ web3 }) {
  // DefaultState
  const defaultState = {
    // Tokens
    sellTokenFilter: tokenFromURL(window.location.href) && tokenFromURL(window.location.href).sellToken ? tokenFromURL(window.location.href).sellToken : '',
    buyTokenFilter: tokenFromURL(window.location.href) && tokenFromURL(window.location.href).buyToken ? tokenFromURL(window.location.href).buyToken : '',
    specificAuction: tokenFromURL(window.location.href) && tokenFromURL(window.location.href).auctionIndex,
    // numberOfTraders: 50,
    numberOfBuyOrders: 20,
    numberOfSellOrders: 20,
    numberOfOrders: 50,
  }

  // State + Setters
  const [trades, setTrades]                         = useState({ buyOrders: [], sellOrders: [], tradesCombined: [] })
  const [network, setNetwork]                       = useState(undefined)
  const [availableTokens, setAvailableTokens]       = useState([])
  // App
  const [error, setError]                           = useState(undefined)
  const [loading, setLoading]                       = useState(false)
  
  // Data Filters
  const [buyTokenFilter, setBuyTokenFilter]         = useState(defaultState.buyTokenFilter)
  const [sellTokenFilter, setSellTokenFilter]       = useState(defaultState.sellTokenFilter)
  // const [numberOfTraders, setNumberOfTraders]       = useState(defaultState.numberOfTraders)
  const [specificAuction, setSpecificAuction]       = useState(defaultState.specificAuction)
  const [numberOfOrders, setNumberOfOrders] = useState(defaultState.numberOfOrders)

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
  // 1. load endpoint Trades dataed
  // 2. set to state
  useEffect(() => {
    setError(undefined)
    // load data
    async function graphQLDataFetch() {
      try {
        const query = `{
          sellOrders(
            first: ${numberOfOrders / 2}, 
            orderBy: timestamp, 
            orderDirection: desc
            where: {
              ${sellTokenFilter && buyTokenFilter ? `auction_contains: "${(sellTokenFilter)}-${(buyTokenFilter)}"` : ''}
            }
          ) {
            id
            transactionHash
            timestamp
            trader {
              id
            }
            amount
            auction {
              id
            }
          }
          buyOrders(
            first: ${numberOfOrders / 2},
            orderBy: timestamp, 
            orderDirection: desc
            where: {
              ${sellTokenFilter && buyTokenFilter ? `auction_contains: "${(sellTokenFilter)}-${(buyTokenFilter)}"` : ''}
            }
          ) {
            id
            transactionHash
            timestamp
            trader {
              id
            }
            amount
            auction {
              id
            }
          }
        }`

        const { data: { data } } = await axios.post(GRAPH_URL, { query })

        if (!data || (!data.buyOrders.length && !data.sellOrders.length)) throw new Error('Range too large/small or no record of data at set params - please try a different filter combination')
        
        // Cache auctions
        const { buyOrders, sellOrders } = data
        const tradesCombined = combineAndSortOrders(sellOrders, buyOrders, { prop: 'timestamp', order: 'dsc' })
        
        // Auto sort new choices DESC
        // auctions.sort((a, b) => b.auctionIndex - a.auctionIndex)

        return { buyOrders, sellOrders, tradesCombined }
      } catch (error) {
        const err = new Error(error.message)
        console.error(err)
        throw err
      }
    }

    setLoading(true)

    const tradesSub = from(graphQLDataFetch())
    .subscribe({
      next: ({ buyOrders, sellOrders, tradesCombined }) => {
        setTrades({ buyOrders, sellOrders, tradesCombined })
        
        sellTokenFilter && specificAuction && setURLFilterParams(`?sellToken=${sellTokenFilter}&buyToken=${buyTokenFilter}&auctionIndex=${specificAuction}`)
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
  }, [sellTokenFilter, buyTokenFilter, numberOfOrders, specificAuction])

  const handleRotateButton = () => {
    setSellTokenFilter(buyTokenFilter)
    setBuyTokenFilter(sellTokenFilter)
  }

  const renderEtherscanLink = (address, section, text, type = 'address', style) => <a href={`https://${network == '4' ? 'rinkeby.etherscan' : 'etherscan'}.io/${type}/${address}${section ? '#' + section : ''}`} target="_blank" rel="noopener noreferrer" style={style}>{text || address}</a>

  const renderTrades = ({
    amount,
    id: tradeID,
    /* tokenPair: {
      token1: sellToken,
      token2: buyToken,
    }, */
    auction: { id: auctionID },
    trader: { id: traderID },
    timestamp,
    transactionHash,
    type,
  }) => {
    const [sellToken, buyToken, auctionIndex] = auctionID.split('-')
    const { sellSymbol, buySymbol, sellDecimal, buyDecimal } = tokenListToName(availableTokens, sellToken, buyToken)

    return (
      <tr key={tradeID}>
        {/* Market */}
        <td>
          <Badge color="success" pill>{sellSymbol}-{buySymbol}-{auctionIndex}</Badge>
        </td>
        {/* Amount */}
        <td>{rZC((amount/10**(type === 'Sell Order' ? sellDecimal : buyDecimal)), FIXED_DECIMALS)}</td>
        {/* Sell or Buy Order */}
        <td><code>{type}</code></td>
        {/* Trader Acct */}
        <td><code title={traderID} style={{cursor: 'pointer'}}>{renderEtherscanLink(traderID, null, shortenHash(traderID, 37), 'address')}</code></td>
        {/* Tx Hash */}
        <td><code title={transactionHash} style={{cursor: 'pointer'}}>{renderEtherscanLink(transactionHash, null, shortenHash(transactionHash), 'tx')}</code></td>
        {/* When */}
        <td>{formatTime(timestamp)}</td>
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
                render={availableTokens.map(({ name, address, symbol }) => <option key={address + Math.random()} value={address}>{name} {symbol && [symbol]}</option>)}
              />
              {/* Filter BuyToken */}
              <PageFilter
                type="select"
                title="Buy Token"
                showWhat={buyTokenFilter}
                changeFunction={event => setBuyTokenFilter(event.target.value)}
                inputName="trades"
                render={availableTokens.map(({ name, address, symbol }) => <option key={address + Math.random()} value={address}>{name} {symbol && [symbol]}</option>)}
              />
            </Col>
            <RotateButton 
              onClickHandler={handleRotateButton}
            />
          </div>
          {/* Filter Number of Traders/Specific Auction Range Type */}
          <Col sm={6} className="py-2">
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
              {/* Orders */}
              <PageFilter
                type="select"
                title="Number of orders to show"
                showWhat={numberOfOrders}
                filterWhat={[50, 100, 150, 200]}
                changeFunction={(e) => setNumberOfOrders(e.target.value)}
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
        {numberOfOrders && 
          <FilterLabel 
            onClickHandler={() => setNumberOfOrders(defaultState.numberOfOrders)}
            filterData={numberOfOrders}
            filterTitle = "Number of Orders"
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
            <th>Amount</th>
            <th>Type</th>
            <th>Trader</th>
            <th>TX Hash</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {trades.tradesCombined && trades.tradesCombined.map(trade => renderTrades(trade))}
        </tbody>
      </Table>}
    </PageWrapper>
  )
}

function combineAndSortOrders(sOrders, bOrders, sortOptions = { prop: 'timestamp', order: 'dsc' }) {
	return (
    bOrders.map(orders => ({ ...orders, type: 'Buy Order' }))
      .concat(sOrders.map(orders => ({ ...orders, type: 'Sell Order' })))
      .sort((a,b) => sortOptions.order === 'dsc' ? a[sortOptions.prop] - b[sortOptions.prop] : b[sortOptions.prop] - a[sortOptions.prop]))
}

export default ErrorHOC(Web3HOC(Trades))
