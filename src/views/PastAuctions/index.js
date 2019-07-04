/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react'
import axios from 'axios'
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

import { getTokensAndNetwork } from '../../api'

import { FIXED_DECIMALS, GRAPH_URL } from '../../globals'
import { setURLFilterParams, rZC, formatTime } from '../../utils'

import { from } from 'rxjs'

function PastAuctions({ web3 }) {
  const defaultState = {
    canPaginate: false,
    numberOfAuctions: 50,
    sellTokenFilter: (tokenFromURL(window.location.href).sellToken) || '',
    buyTokenFilter: (tokenFromURL(window.location.href).buyToken) || '',
  }

  const [paginationSize, setPaginationSize] = useState(50)
  const [pastAuctions, setPastAuctions] = useState([])
  const [availableTokens, setAvailableTokens] = useState([])
  const [canPaginate, setCanPaginate] = useState(defaultState.canPaginate)
  const [network, setNetwork] = useState(undefined)
  // Data Selection
  const [sellTokenFilter, setSellTokenFilter] = useState(defaultState.sellTokenFilter)
  const [buyTokenFilter, setBuyTokenFilter] = useState(defaultState.buyTokenFilter)
  const [specificAuction, setSpecificAuction] = useState(undefined)
  // App
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(undefined)

  const [skipAmount, setSkipAmount] = useState(0)

  useEffect(() => {
    setLoading(true)

    const mountSubscription = from(getTokensAndNetwork(web3, network))
      .subscribe({
        next: ({ bcNetwork, tokens }) => {
          sellTokenFilter && setURLFilterParams(`?sellToken=${sellTokenFilter}&buyToken=${buyTokenFilter}`)
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
  // 1. load endpoint Past Auctions data
  // 2. set to state
  useEffect(() => {
    setError(undefined)
    // load data
    async function graphQLDataFetch() {
      try {
        const bcNetwork = network || await web3.getNetworkId()

        const { data: { data } } = await axios.post(GRAPH_URL, {
          query: `{
            auctions(
              ${!specificAuction ? `first: ${paginationSize + 1}, skip: ${skipAmount}` : ''}
                
                orderBy: startTime
                orderDirection: desc
                
                where: { 
                  sellVolume_gt: 0
                  ${sellTokenFilter ? `sellToken: ${JSON.stringify(sellTokenFilter)}` : ''} 
                  ${buyTokenFilter ? `buyToken: ${JSON.stringify(buyTokenFilter)}` : ''}  
                  ${specificAuction ? `auctionIndex: ${specificAuction}` : ''}
                },                
            ) {
              id
              auctionIndex
              sellVolume
              buyVolume
              sellToken
              buyToken
              cleared
              startTime
              clearingTime
              totalFeesPaid
            }
          }`
        })

        // console.group()
        // console.debug('Checking sellToken: ', sellTokenFilter)
        // console.debug('Checking buyToken: ', buyTokenFilter)
        // console.debug('DATA = ', data)
        // console.groupEnd()

        if (!data.auctions || !data.auctions.length > 0) throw new Error('Range too large/small or no record of data at set params - please try a different range')

        // Cache auctions
        let { auctions } = data
        const pagination = auctions.length > 50
        
        return {
          bcNetwork,
          auctions,
          pagination
        }
      } catch (error) {
        const err = new Error(error.message)
        console.error(err)
        throw err
      }
    }

    setLoading(true)

    const pastAuctionsSub = from(graphQLDataFetch())
      .subscribe({
        next: ({
          auctions,
          pagination
        }) => {
          setPastAuctions(auctions)
          setCanPaginate(pagination)

          sellTokenFilter && setURLFilterParams(`?sellToken=${sellTokenFilter}&buyToken=${buyTokenFilter}`)
        },
        error: appError => {
          setError(appError)
          setLoading(false)
        },
        complete: () => setLoading(false),
      })

    return () => {
      pastAuctionsSub && pastAuctionsSub.unsubscribe()
    }
  }, [sellTokenFilter, buyTokenFilter, skipAmount, specificAuction])

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
        onClick={() => window.location.href = `${window.location.origin}/#/past-auctions-trades?sellToken=${sellToken}&buyToken=${buyToken}&auctionIndex=${auctionIndex}`}
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
                  setSkipAmount(0)
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
                  setSkipAmount(0)
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
              submitFunction={setSpecificAuction}
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
      {error
        ?
        <ErrorPre error={error} errorTitle="" />
        :
        loading
          ?
          // Data Loading
          <Loading />
          :
          <>
            {/* Pagination Control */}
            <Pagination
              canPaginate={canPaginate}
              skipAmount={skipAmount}
              nextPageHandler={() => setSkipAmount(prev => prev + paginationSize)}
              previousPageHandler={() => setSkipAmount(prev => prev - paginationSize)}
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
                {pastAuctions && pastAuctions.map(auction => renderTrades(auction))}
              </tbody>
            </Table>

            {/* Pagination Control */}
            <Pagination
              canPaginate={canPaginate}
              skipAmount={skipAmount}
              nextPageHandler={() => setSkipAmount(prev => prev + paginationSize)}
              previousPageHandler={() => setSkipAmount(prev => prev - paginationSize)}
            />
          </>}

    </PageWrapper>
  )
}

function tokenFromURL(url) {
  if (!url || (url.search('sellToken') === -1 || url.search('buyToken') === -1)) return false

  const [[, sellToken], [, buyToken]] = url
    .split('?')[1]
    .split('&')
    .map(item => item.split('='))

  return { sellToken, buyToken }
}

function tokenListToName(tokenList, st, bt) {
  if (!tokenList.length) return { sellName: '...', buyName: '...', sellSymbol: '...', buySymbol: '...' }
  return {
    sellName: (tokenList.find(token => token.address === st)).name,
    buyName: (tokenList.find(token => token.address === bt)).name,
    sellSymbol: (tokenList.find(token => token.address === st)).symbol,
    buySymbol: (tokenList.find(token => token.address === bt)).symbol,
  }
}

function checkTimeForAnomaly(time1, time2, classAnomaly = 'warningOrange') {
  const durationAbs = Math.abs(time1 - time2) / 60 / 60

  return ((durationAbs > 6.5 || durationAbs < 5) && classAnomaly) || null
}

export default ErrorHOC(Web3HOC(PastAuctions))
