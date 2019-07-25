/* eslint-disable eqeqeq */
import React, { useState } from 'react'
import moment from 'moment'

import { Col, Table, Badge, FormGroup, Form } from 'reactstrap'
import { PageFilter, PageFilterSubmit, FilterLabel, PageWrapper } from '../../containers'

import ErrorHOC from '../../HOCs/ErrorHOC'
import Web3HOC from '../../HOCs/Web3HOC'

import AttentionBanner from '../../components/AttentionBanner'
import ColourKey from '../../components/ColourKey'
import ErrorPre from '../../components/Error'
import Loading from '../../components/Loading'
import Pagination from '../../components/Pagination'
import RotateButton from '../../components/RotateButton'

import { useGraphQuery, useTokenNetworkMount } from '../../hooks'

import { FIXED_DECIMALS } from '../../globals'
import { rZC, formatTime, tokenListToName, urlParams2Object } from '../../utils'

function PastAuctions({ web3 }) {
  const defaultState = {
    sellTokenFilter: (urlParams2Object(window.location.href).sellToken) || '',
    buyTokenFilter: (urlParams2Object(window.location.href).buyToken) || '',
    specificAuction: (urlParams2Object(window.location.href).auctionIndex) || '',
  }

  // Data Selection
  const [sellTokenFilter, setSellTokenFilter] = useState(defaultState.sellTokenFilter)
  const [buyTokenFilter, setBuyTokenFilter]   = useState(defaultState.buyTokenFilter)
  const [specificAuction, setSpecificAuction] = useState(defaultState.specificAuction)

  // Mount logic
  const { availableTokens, loading, error } = useTokenNetworkMount(web3)

  // Data Fetching Logic
  const { 
    graphData, 
    paginationData, 
    loading: graphLoading,
    error: graphQueryError, 
    // State setters
    nextPage, 
    prevPage, 
    resetPaginationSkip 
  } = useGraphQuery({
    rootQueries: ["auctions"],
    rootArguments: [
      { queryString: "orderBy", queryCondition: "startTime" },
      { queryString: "orderDirection", queryCondition: "desc" },
    ],
    whereQueries: [
      { queryString: "sellVolume_gt", queryCondition: "0" },
      { queryString: "sellToken", queryCondition: sellTokenFilter }, 
      { queryString: "buyToken", queryCondition: buyTokenFilter },
      { queryString: "auctionIndex", queryCondition: specificAuction },
    ],
    responseProperties: [
      "id", 
      "auctionIndex", 
      "sellVolume", "buyVolume", 
      "sellToken", "buyToken", 
      "cleared", 
      "startTime", "clearingTime", 
      "totalFeesPaid"
    ],
    paginationSize: 50,
    urlSearchParamsString: `?${sellTokenFilter ? `sellToken=${sellTokenFilter}&` : ''}${buyTokenFilter ? `buyToken=${buyTokenFilter}&` : ''}${specificAuction ? `auctionIndex=${specificAuction}&` : ''}`,
    effectChangeConditions: [sellTokenFilter, buyTokenFilter, specificAuction],
  })

  const handleRotateButton = () => {
    setSellTokenFilter(buyTokenFilter)
    setBuyTokenFilter(sellTokenFilter)
  }

  const renderTrades = ({
    auctionIndex,
    sellToken,
    buyToken,
    sellVolume,
    buyVolume,
    startTime,
    clearingTime,
    totalFeesPaid,
  }) => {
    const { sellSymbol, buySymbol } = tokenListToName(availableTokens, sellToken, buyToken, auctionIndex)
    const anomalyClass = checkTimeForAnomaly(startTime, clearingTime)

    return (
      <tr
        className={anomalyClass}
        key={auctionIndex * Math.random()}
        onClick={() => window.location.href = `${window.location.origin}/#/trades?sellToken=${sellToken}&buyToken=${buyToken}&auctionIndex=${auctionIndex}`}
        style={{ cursor: 'pointer' }}
      >
        {/* NAME */}
        <td>
          <Badge color="success" pill>{`${sellSymbol}-${buySymbol}-${auctionIndex}`}</Badge>
        </td>
        {/* Volumes */}
        <td>
          <p><strong>Sell volume:</strong> {rZC((sellVolume / 10 ** 18), FIXED_DECIMALS)} [{sellSymbol}]</p>
          <p><strong>Buy volume:</strong> {rZC((buyVolume / 10 ** 18), FIXED_DECIMALS)} [{buySymbol}]</p>
        </td>
        {/* PRICES */}
        <td>
          <p><strong>Closing price:</strong> {rZC((buyVolume / sellVolume), FIXED_DECIMALS)}</p>
        </td>
        {/* Times */}
        <td>
          <p><strong>Auction start:</strong> {formatTime(startTime)}</p>
          <p><strong>Auction end:</strong> {formatTime(clearingTime)}</p>
          <p><strong>Duration:</strong> {moment(clearingTime * 1000).from(startTime * 1000, true)}</p>
        </td>
        {/* L.C */}
        <td>
          <strong>{rZC((totalFeesPaid / 10 ** 18), FIXED_DECIMALS)}</strong>
        </td>
      </tr>
    )
  }

  return (
    <PageWrapper pageTitle="DutchX Past Auctions">
      <AttentionBanner
        title="MAINNET ONLY"
        subText="This feature is currently only available for Mainnet. Please check back later for data on other networks."
      />
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
                changeFunction={(event) => {
                  resetPaginationSkip()
                  setSellTokenFilter(event.target.value)
                }}
                inputName="trades"
                render={availableTokens.map(({ name, address, symbol }) => <option key={address} value={address}>{symbol} ({name})</option>)}
              />
              {/* Filter BuyToken */}
              <PageFilter
                type="select"
                title="Buy Token"
                showWhat={buyTokenFilter}
                changeFunction={(event) => {
                  resetPaginationSkip()
                  setBuyTokenFilter(event.target.value)
                }}
                inputName="trades"
                render={availableTokens.map(({ name, address, symbol }) => <option key={address} value={address}>{symbol} ({name})</option>)}
              />
            </Col>
            {/* Switch Tokens */}
            <RotateButton
              onClickHandler={handleRotateButton}
            />
          </div>
          {/* Filter AuctionIndex Range Type */}
          <Col sm={6} className="py-2">
            {/* Filter specific auction */}
            <PageFilterSubmit
              type="number"
              title="Specific auction to show"
              submitFunction={(value) => {
                resetPaginationSkip()
                setSpecificAuction(value)
              }}
              inputName="trades"
            />
          </Col>
        </FormGroup>
      </Form>

      {/* Colour Key */}
      <ColourKey
        colourMap={{
          "#fff1d0": "Auction run-time: Greater than 6.5 hours || Less than 5 hours"
        }}
      />
      {error || graphQueryError
        ?
        <ErrorPre error={error || graphQueryError} errorTitle="" />
        :
        loading || graphLoading
          ?
          // Data Loading
          <Loading />
          :
          <>
            {/* Pagination Control */}
            <Pagination
              canPaginate={paginationData.canPaginate}
              skipAmount={paginationData.paginationSkip}
              nextPageHandler={nextPage}
              prevPageHandler={prevPage}
            />

            {/* Filter labels */}
            <div>
              <FilterLabel
                onClickHandler={() => setSpecificAuction(undefined)}
                filterTitle="Selected Auction"
                filterData={specificAuction}
              />
            </div>

            <Table responsive hover>
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Volumes</th>
                  <th>Prices</th>
                  <th>Times</th>
                  <th>Liquidity Contribution</th>
                </tr>
              </thead>
              <tbody>
                {graphData && graphData.auctions && graphData.auctions.map(auction => renderTrades(auction))}
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
}

function checkTimeForAnomaly(time1, time2, classAnomaly = 'warningOrange') {
  const durationAbs = Math.abs(time1 - time2) / 60 / 60

  return ((durationAbs > 6.5 || durationAbs < 5) && classAnomaly) || null
}

export default ErrorHOC(Web3HOC(PastAuctions))
