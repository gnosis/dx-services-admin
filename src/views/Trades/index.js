/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react'
import axios from 'axios'

import { Col, Table, Badge, FormGroup, Form } from 'reactstrap'
import { PageFilter, PageFilterSubmit, FilterLabel, PageWrapper } from '../../containers'

import ErrorHOC from '../../HOCs/ErrorHOC'
import Web3HOC from '../../HOCs/Web3HOC'

import AttentionBanner from '../../components/AttentionBanner'
import ErrorPre from '../../components/Error'
import Loading from '../../components/Loading'
import Pagination from '../../components/Pagination'
import PrimaryButton from '../../components/PrimaryButton';
import RotateButton from '../../components/RotateButton'

import { getTokensAndNetwork } from '../../api'

import { queryLineMaker, shortenHash, tokenListToName, setURLFilterParams, formatTime, rZC } from '../../utils'
import { FIXED_DECIMALS, GRAPH_URL } from '../../globals'

import { from } from 'rxjs'

function Trades({ web3 }) {
  // DefaultState
  const defaultState = {
    // Tokens
    sellTokenFilter: tokenFromURL(window.location.href) && tokenFromURL(window.location.href).sellToken ? tokenFromURL(window.location.href).sellToken : '',
    buyTokenFilter: tokenFromURL(window.location.href) && tokenFromURL(window.location.href).buyToken ? tokenFromURL(window.location.href).buyToken : '',
    specificAuction: tokenFromURL(window.location.href) && tokenFromURL(window.location.href).auctionIndex,
    paginationSize: 50,
    canPaginate: false,
    orderType: 'All',
    timeSort: { order: false, focused: true },
    amountSort: { order: false, focused: false }
  }

  // State + Setters
  const [trades, setTrades]                         = useState({ buyOrders: [], sellOrders: [], tradesCombined: [] })
  const [network, setNetwork]                       = useState(undefined)
  const [availableTokens, setAvailableTokens]       = useState([])
  // App
  const [error, setError]                           = useState(undefined)
  const [loading, setLoading]                       = useState(false)
  
  // Pagination
  const [paginationSize]                            = useState(defaultState.paginationSize)
  const [canPaginate, setCanPaginate]               = useState(defaultState.canPaginate)
  const [skipAmount, setSkipAmount]                 = useState(0)
  
  // Data Filters
  const [orderType, setOrderType]                   = useState(defaultState.orderType)
  const [buyTokenFilter, setBuyTokenFilter]         = useState(defaultState.buyTokenFilter)
  const [sellTokenFilter, setSellTokenFilter]       = useState(defaultState.sellTokenFilter)
  const [specificAuction, setSpecificAuction]       = useState(defaultState.specificAuction)
  const [timeSort, setTimeSort]                     = useState(defaultState.timeSort)
  const [amountSort, setAmountSort]                 = useState(defaultState.amountSort)
  
  /* MOUNT ONLY */
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

  // Main Query and business logic effect
  // 1. load endpoint Trades dataed
  // 2. set to state
  useEffect(() => {
    setError(undefined)
    // load data
    async function graphQLDataFetch() {
      try {
        const query = `{
          sellOrders(
            first: ${paginationSize + 1},
            skip: ${skipAmount}, 
            orderBy: timestamp, 
            orderDirection: desc
            where: {
              ${queryLineMaker(sellTokenFilter, 'auction_starts_with')}
              ${queryLineMaker(buyTokenFilter, 'auction_contains')}
              ${queryLineMaker(specificAuction, 'auction_ends_with')}
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
            first: ${paginationSize + 1},
            skip: ${skipAmount},
            orderBy: timestamp, 
            orderDirection: desc
            where: {
              ${queryLineMaker(sellTokenFilter, 'auction_starts_with')}
              ${queryLineMaker(buyTokenFilter, 'auction_contains')}
              ${queryLineMaker(specificAuction, 'auction_ends_with')}
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
        const pagination = tradesCombined.length > (paginationSize * 2)
        
        // Auto sort new choices DESC
        // auctions.sort((a, b) => b.auctionIndex - a.auctionIndex)

        return { buyOrders, sellOrders, tradesCombined, pagination }
      } catch (error) {
        const err = new Error(error.message)
        console.error(err)
        throw err
      }
    }

    setLoading(true)

    const tradesSub = from(graphQLDataFetch())
    .subscribe({
      next: ({ buyOrders, sellOrders, tradesCombined, pagination }) => {
        setTrades({ buyOrders, sellOrders, tradesCombined })
        setCanPaginate(pagination)
        
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
  }, [sellTokenFilter, buyTokenFilter, paginationSize, skipAmount, specificAuction])

  /* Sort Effects */

  // Sort by Amount
  useEffect(() => {
    setTrades(prev => ({ ...prev.buyOrders, ...prev.sellOrders, tradesCombined: trades.tradesCombined.sort((a, b) => amountSort.order ? a.amount - b.amount : b.amount - a.amount) }))
  }, [amountSort.order])

  // Sort by Timestamp
  useEffect(() => {
    setTrades(prev => ({ ...prev.buyOrders, ...prev.sellOrders, tradesCombined: trades.tradesCombined.sort((a, b) => timeSort.order ? a.timestamp - b.timestamp : b.timestamp - a.timestamp) }))
  }, [timeSort.order])

  /* Renders anchor tag to Etherscan based on address type */
  const renderEtherscanLink = (address, section, text, type = 'address', style) => <a href={`https://${network == '4' ? 'rinkeby.etherscan' : 'etherscan'}.io/${type}/${address}${section ? '#' + section : ''}`} target="_blank" rel="noopener noreferrer" style={style}>{text || address}</a>

  /* Main table row render for GraphQL data */
  const renderTrades = ({
    amount,
    id: tradeID,
    auction: { id: auctionID },
    trader: { id: traderID },
    timestamp,
    transactionHash,
    type,
  }) => {
    const [sellToken, buyToken, auctionIndex] = auctionID.split('-')
    const { sellSymbol, buySymbol, sellDecimal, buyDecimal } = tokenListToName(availableTokens, sellToken, buyToken)

    return (
      <tr key={tradeID} style={{ backgroundColor: type === 'Sell Order' ? "#f0f8ff" : "#fff0fc" }}>
        {/* Trader Acct */}
        <td><code title={traderID} style={{cursor: 'pointer'}}>{renderEtherscanLink(traderID, null, shortenHash(traderID, 37), 'address')}</code></td>
        {/* Amount */}
        <td>{rZC((amount/10**(type === 'Sell Order' ? sellDecimal : buyDecimal)), FIXED_DECIMALS)}</td>
        {/* Sell or Buy Order */}
        <td><code>{type}</code></td>
        {/* Market */}
        <td>
          <Badge color="success" pill>{sellSymbol}-{buySymbol}-{auctionIndex}</Badge>
        </td>
        {/* Tx Hash */}
        <td><code title={transactionHash} style={{cursor: 'pointer'}}>{renderEtherscanLink(transactionHash, null, shortenHash(transactionHash), 'tx')}</code></td>
        {/* When */}
        <td>{formatTime(timestamp)}</td>
      </tr>
    )
  }
    
  // Filters current data stream
  let filteredTrades = trades.tradesCombined
  filteredTrades = filteredTrades.filter((trade) => {
    if (orderType === 'All') return trade
    
    return trade.type === orderType
  })

  /* RENDER */
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
                changeFunction={event => {
                  setSkipAmount(0)
                  setSellTokenFilter(event.target.value)
                }}
                inputName="trades"
                render={availableTokens.map(({ name, address, symbol }) => <option key={address + Math.random()} value={address}>{name} {symbol && [symbol]}</option>)}
              />
              {/* Filter BuyToken */}
              <PageFilter
                type="select"
                title="Buy Token"
                showWhat={buyTokenFilter}
                changeFunction={event => {
                  setSkipAmount(0)
                  setBuyTokenFilter(event.target.value)
                }}
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
              {/* <PageFilter
                type="select"
                title="Number of orders to show"
                showWhat={paginationSize}
                filterWhat={[50, 100, 150, 200]}
                changeFunction={(e) => setPaginationSize(e.target.value / 2)}
                inputName="trades"
              /> */}
              {/* Order Type */}
              <PageFilter
                type="select"
                title="Type of orders to show"
                showWhat={orderType}
                filterWhat={['Sell Order', 'Buy Order', 'All']}
                changeFunction={(e) => setOrderType(e.target.value)}
                inputName="trades"
              />
            </Col>
        </FormGroup>
      </Form>

      {error 
        ?
      <ErrorPre error={error} errorTitle=""/>
        :
      loading
        ?
      <Loading />
        :
      <>
        {/* FILTER LABELS */}
        <>
          {/* Pagination Control */}
          <Pagination
            canPaginate={canPaginate}
            skipAmount={skipAmount}
            nextPageHandler={() => setSkipAmount(prev => prev + paginationSize)}
            previousPageHandler={() => setSkipAmount(prev => prev - paginationSize)}
          />
          {/* Fiter Labels */}
          {sellTokenFilter && 
            <FilterLabel 
              onClickHandler={() => setSellTokenFilter('')}
              filterData={getTokenInfo(sellTokenFilter, 'symbol') || shortenHash(sellTokenFilter)}
              filterTitle = "Sell Token"
            />
          }
          {buyTokenFilter && 
            <FilterLabel 
              onClickHandler={() => setBuyTokenFilter('')}
              filterData={getTokenInfo(buyTokenFilter, 'symbol') || shortenHash(buyTokenFilter)}
              filterTitle = "Buy Token"
            />
          }
          {specificAuction && 
            <FilterLabel 
              onClickHandler={() => setSpecificAuction('')}
              filterData={specificAuction}
              filterTitle = "Selected Auction"
            />
          }
          {/* {paginationSize && 
            <FilterLabel 
              onClickHandler={() => setPaginationSize(defaultState.paginationSize)}
              filterData={paginationSize}
              filterTitle = "Number of Orders"
            />
          } */}
          {(sellTokenFilter || buyTokenFilter || specificAuction) 
            && 
          <PrimaryButton 
            onClickHandler={handleResetButton} 
            text="RESET" 
            customStyle={{
              backgroundColor: '#2f353a',
              fontSize: 'smaller',
              marginLeft: 10
            }}
          />}
        </>
        <Table responsive hover>
          <thead>
            <tr>
              <th>Trader</th>
              <th onClick={() => handleColumnSort('Amount')} style={{ cursor: 'pointer' }}>Amount {amountSort.focused ? amountSort.order ? '[ASC]' : '[DSC]' : null}</th>
              <th>Type</th>
              <th>Market</th>
              <th>TX Hash</th>
              <th onClick={() => handleColumnSort('Timestamp')} style={{ cursor: 'pointer' }}>Timestamp {timeSort.focused ? timeSort.order ? '[ASC]' : '[DSC]' : null}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades && filteredTrades.map(trade => renderTrades(trade))}
          </tbody>
        </Table>
      </>}
    </PageWrapper>
  )

  function handleRotateButton() {
    setSellTokenFilter(buyTokenFilter)
    setBuyTokenFilter(sellTokenFilter)
  }

  function handleResetButton () {
    setSellTokenFilter('')
    setBuyTokenFilter('')
    setSpecificAuction('')
    setAmountSort(defaultState.amountSort)
    setTimeSort(defaultState.timeSort)
  }

  function handleColumnSort(type) {
    if (type === 'Amount')    {
      setTimeSort({ focused: false }) 
      return setAmountSort({ order: !amountSort.order, focused: true })
    }
    
    setAmountSort({ focused: false }) 
    return setTimeSort({ order: !timeSort.order, focused: true })
  }
  
  // Grabs token name from availableTokens
  function getTokenInfo(type = sellTokenFilter, prop = 'symbol') {
    const token = availableTokens.find(token => token.address === type)

    return token && token[prop]
  }
}

function combineAndSortOrders(sOrders, bOrders, sortOptions = { prop: 'timestamp', order: 'dsc' }) {
	return (
    bOrders.map(orders => ({ ...orders, type: 'Buy Order' }))
      .concat(sOrders.map(orders => ({ ...orders, type: 'Sell Order' })))
      .sort((a,b) => sortOptions.order === 'dsc' ? b[sortOptions.prop] - a[sortOptions.prop] : a[sortOptions.prop] - b[sortOptions.prop]))
}

function tokenFromURL(url) {
	if (!url || (url.search('sellToken') === -1 || url.search('buyToken') === -1 || url.search('auctionIndex') === -1)) return false 

	const [[, sellToken], [, buyToken], [, auctionIndex]] = url
		.split('?')[1]
		.split('&')
		.map(item => item.split('='))	

	return { sellToken, buyToken, auctionIndex }
}

export default ErrorHOC(Web3HOC(Trades))
