/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react'

import { Col, Table, Badge, FormGroup, Form } from 'reactstrap'
import { PageFilter, PageFilterSubmit, FilterLabel, PageWrapper } from '../../containers'

import { from } from 'rxjs'

import ErrorHOC from '../../HOCs/ErrorHOC'
import Web3HOC from '../../HOCs/Web3HOC'

import AttentionBanner from '../../components/AttentionBanner'
import ErrorPre from '../../components/Error'
import Loading from '../../components/Loading'
import Pagination from '../../components/Pagination'
import PrimaryButton from '../../components/PrimaryButton';
import RotateButton from '../../components/RotateButton'

import { getTokensAndNetwork } from '../../api'
import { useGraphQuery } from '../../hooks'

import { shortenHash, tokenListToName, formatTime, rZC, urlParams2Object } from '../../utils'
import { FIXED_DECIMALS } from '../../globals'


function Trades({ web3 }) {
  // DefaultState
  const defaultState = {
    // Tokens
    sellTokenFilter: urlParams2Object(window.location.href).sellToken || '',
    buyTokenFilter: urlParams2Object(window.location.href).buyToken || '',
    specificAuction: urlParams2Object(window.location.href).auctionIndex || '',
    orderType: 'All',
    timeSort: { order: false, focused: true },
    amountSort: { order: false, focused: false }
  }

  // State + Setters
  const [network, setNetwork]                       = useState(undefined)
  const [availableTokens, setAvailableTokens]       = useState([])
  // App
  const [error, setError]                           = useState(undefined)
  const [loading, setLoading]                       = useState(false)
  
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
  const { graphData, paginationData, error: graphQueryError, nextPage, prevPage, resetPaginationSkip } = useGraphQuery({
    rootQueries: ['sellOrders', 'buyOrders'],
    rootArguments: [
      { queryString: "orderBy", queryCondition: "timestamp" },
      { queryString: "orderDirection", queryCondition: "desc" },
    ],
    whereQueries: [
      { queryString: "auction_starts_with", queryCondition: sellTokenFilter }, 
      { queryString: "auction_contains", queryCondition: buyTokenFilter },
      { queryString: "auction_ends_with", queryCondition: specificAuction },
    ],
    responseProperties: [
      `id
      transactionHash
      timestamp
      trader {
        id
      }
      amount
      auction {
        id
      }`
    ],
    effectChangeConditions: [sellTokenFilter, buyTokenFilter, specificAuction]
  })

  /* Sort Effects */

  // Sort by Amount
  /* useEffect(() => {
    setTrades(prev => ({ ...prev.buyOrders, ...prev.sellOrders, tradesCombined: trades.tradesCombined.sort((a, b) => amountSort.order ? a.amount - b.amount : b.amount - a.amount) }))
  }, [amountSort.order])

  // Sort by Timestamp
  useEffect(() => {
    setTrades(prev => ({ ...prev.buyOrders, ...prev.sellOrders, tradesCombined: trades.tradesCombined.sort((a, b) => timeSort.order ? a.timestamp - b.timestamp : b.timestamp - a.timestamp) }))
  }, [timeSort.order]) */

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

  let filteredTrades
  if (graphData) {
    const { buyOrders, sellOrders } = graphData
    const tradesCombined = combineAndSortOrders(sellOrders, buyOrders, { prop: 'timestamp', order: 'dsc' })

    // Filters current data
    filteredTrades = tradesCombined.slice().filter((trade) => {
      if (orderType === 'All') return trade
      
      return trade.type === orderType
    })
  }

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
                  resetPaginationSkip()
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
                  resetPaginationSkip()
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

      {error || graphQueryError
        ?
      <ErrorPre error={error || graphQueryError} errorTitle=""/>
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
            canPaginate={paginationData.canPaginate}
            skipAmount={paginationData.paginationSkip}
            nextPageHandler={nextPage}
            prevPageHandler={prevPage}
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
        {/* Pagination Control */}
        <Pagination
          canPaginate={paginationData.canPaginate}
          skipAmount={paginationData.paginationSkip}
          nextPageHandler={nextPage}
          prevPageHandler={prevPage}
        />
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

export default ErrorHOC(Web3HOC(Trades))
