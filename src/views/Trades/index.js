/* eslint-disable eqeqeq */
import React, { useState } from 'react'

import { Col, Table, Badge, FormGroup, Form } from 'reactstrap'
import { PageFilter, PageFilterSubmit, FilterLabel, PageWrapper } from '../../containers'

import ErrorHOC from '../../HOCs/ErrorHOC'
import Web3HOC from '../../HOCs/Web3HOC'

import AttentionBanner from '../../components/AttentionBanner'
import ErrorPre from '../../components/Error'
import Loading from '../../components/Loading'
import Pagination from '../../components/Pagination'
import PrimaryButton from '../../components/PrimaryButton'
import RotateButton from '../../components/RotateButton'

import { useDataSort, useGraphQuery, useTokenNetworkMount } from '../../hooks'

import { shortenHash, tokenListToName, formatTime, rZC, urlParams2Object } from '../../utils'
import { FIXED_DECIMALS } from '../../globals'


function Trades({ web3 }) {
  // DefaultState
  const defaultState = {
    // Tokens
    sellTokenFilter: urlParams2Object(window.location.href).sellToken || '',
    buyTokenFilter: urlParams2Object(window.location.href).buyToken || '',
    specificAuction: urlParams2Object(window.location.href).auctionIndex || '',
  }
  
  // Data Filters
  const [buyTokenFilter, setBuyTokenFilter]         = useState(defaultState.buyTokenFilter)
  const [sellTokenFilter, setSellTokenFilter]       = useState(defaultState.sellTokenFilter)
  const [specificAuction, setSpecificAuction]       = useState(defaultState.specificAuction)
  
  // MOUNT
  const { availableTokens, network, loading: mountLoading, error: mountError } = useTokenNetworkMount(web3)

  // GRAPH QUERY
  const { 
    // Graph State
    graphData, 
    paginationData, 
    // Pagination Actions
    nextPage, 
    prevPage, 
    resetPaginationSkip, 
    // Error/Loading
    error: graphQueryError, 
    loading: graphLoading 
  } = useGraphQuery({
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
    urlSearchParamsString: `?${sellTokenFilter ? `sellToken=${sellTokenFilter}&` : ''}${buyTokenFilter ? `buyToken=${buyTokenFilter}&` : ''}${specificAuction ? `auctionIndex=${specificAuction}&` : ''}`,
    effectChangeConditions: [sellTokenFilter, buyTokenFilter, specificAuction],
  })

  let combinedSellAndBuyOrders = React.useMemo(() => combineAndSortOrders(graphData, { prop: 'timestamp', order: 'dsc' }), [graphData])
  
  const { 
    sortedGQLData: sortedData, 
    dataSort, setDataSort, 
    orderType, setOrderType 
  } = useDataSort(combinedSellAndBuyOrders)

  /* Action handler */
  const handleColumnSort = type => setDataSort({ key: type, direction: dataSort.direction === 'asc' ? 'dsc' : 'asc' }) 

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
        <td>{rZC((amount/10**(type === 'Sell Order' ? sellDecimal : buyDecimal)), FIXED_DECIMALS)} <strong>{(type === 'Sell Order' ? sellSymbol : buySymbol)}</strong></td>
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
              submitFunction={setSpecificAuction}
              inputName="trades"
            />
          </Col>
          {/* Filter Sell/Buy Orders */}
          <Col sm={6} className="py-2">
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

      {mountError || graphQueryError
        ?
      <ErrorPre error={mountError || graphQueryError} errorTitle=""/>
        :
        mountLoading || graphLoading
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
              <th 
                onClick={() => handleColumnSort('amount')} style={{ cursor: 'pointer' }}
              >
                Amount {dataSort && dataSort.key === 'amount' ? dataSort && dataSort.direction === 'dsc' ? '[DSC]' : '[ASC]' : null}
              </th>
              <th>Type</th>
              <th>Market</th>
              <th>TX Hash</th>
              <th 
                onClick={() => handleColumnSort('timestamp')} style={{ cursor: 'pointer' }}
              >
                Timestamp {dataSort && dataSort.key === 'timestamp' ? dataSort && dataSort.direction === 'dsc' ? '[DSC]' : '[ASC]' : null}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData && sortedData.map(trade => renderTrades(trade))}
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
  }
  
  // Grabs token name from availableTokens
  function getTokenInfo(type = sellTokenFilter, prop = 'symbol') {
    const token = availableTokens.find(token => token.address === type)

    return token && token[prop]
  }
}

function combineAndSortOrders(inputData, sortOptions = { prop: 'timestamp', order: 'dsc' }) {
  if (!inputData || !Object.keys(inputData).length) return []

  const { sellOrders: sOrders, buyOrders: bOrders } = inputData
	return (
    bOrders.map(orders => ({ ...orders, type: 'Buy Order' }))
      .concat(sOrders.map(orders => ({ ...orders, type: 'Sell Order' })))
      .sort((a,b) => sortOptions.order === 'dsc' ? b[sortOptions.prop] - a[sortOptions.prop] : a[sortOptions.prop] - b[sortOptions.prop]))
}

export default ErrorHOC(Web3HOC(Trades))
