import React, { useEffect, useState } from 'react'
import axios from 'axios'

import { Col, Table, Badge, FormGroup, Form } from 'reactstrap'
import { PageFilter, PageFilterSubmit, FilterLabel, PageWrapper } from '../../containers'

import ErrorHOC from '../../HOCs/ErrorHOC'
import Web3HOC from '../../HOCs/Web3HOC'

import AttentionBanner from '../AttentionBanner'
import Loading from '../Loading'
import ErrorPre from '../Error'

import getDxService from '../../services/dxService'

import { FIXED_DECIMALS } from '../../globals'

import { from } from 'rxjs'

function tokenFromURL(url) {
  if (!url || (url.search('sellToken') === -1 || url.search('buyToken') === -1)) return false

  const [[, sellToken], [, buyToken]] = url
    .split('?')[1]
    .split('&')
    .map(item => item.split('='))

  return { sellToken, buyToken }
}

const tokenListToName = (tokenList, st, bt) => {
  if (!tokenList.length) return { sellName: '...', buyName: '...', sellSymbol: '...', buySymbol: '...' }
  return {
    sellName: (tokenList.find(token => token.address === st)).name,
    buyName: (tokenList.find(token => token.address === bt)).name,
    sellSymbol: (tokenList.find(token => token.address === st)).symbol,
    buySymbol: (tokenList.find(token => token.address === bt)).symbol,
  }
}

// GraphQL DutchX Query
const URL = 'https://api.thegraph.com/subgraphs/name/gnosis/dutchx'
const MAINNET_WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const MAINNET_GNO_ADDRESS = '0x6810e776880c02933d47db1b9fc05908e5386b96'

function PastAuctions({ web3 }) {
  const defaultState = {
    auctionLimits: { max: 501, min: 1 },
    numberOfAuctions: 50,
    sellTokenFilter: (tokenFromURL(window.location.href) && tokenFromURL(window.location.href).sellToken) || MAINNET_WETH_ADDRESS,
    buyTokenFilter: (tokenFromURL(window.location.href) && tokenFromURL(window.location.href).buyToken) || MAINNET_GNO_ADDRESS,
  }

  const [pastAuctions, setPastAuctions] = useState([])
  const [availableTokens, setAvailableTokens] = useState([])
  const [auctionLimits, setAuctionLimits] = useState(defaultState.auctionLimits)
  // const [safeTypeFilter, setSafeTypeFilter] = useState('')
  const [network, setNetwork] = useState(undefined)
  // Data Selection
  const [sellTokenFilter, setSellTokenFilter] = useState(defaultState.sellTokenFilter)
  const [buyTokenFilter, setBuyTokenFilter] = useState(defaultState.buyTokenFilter)
  const [numberOfAuctions, setNumberOfAuctions] = useState(defaultState.numberOfAuctions)
  const [specificAuction, setSpecificAuction] = useState(undefined)
  // App
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(undefined)

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
  // 1. load endpoint Trades data
  // 2. set to state
  useEffect(() => {
    // load data
    async function graphQLDataFetch() {
      try {
        const bcNetwork = network || await web3.getNetworkId()
        const dxContract = await web3.getDutchX(bcNetwork)

        const currentAuctionIndex = (await dxContract.methods.getAuctionIndex(sellTokenFilter, buyTokenFilter).call()).toString()

        const { data: { data } } = await axios.post(URL, {
          query: `{
            auctions(
              ${!specificAuction ? `first: 50` : ''} 
              orderBy: auctionIndex
              where: { 
                sellToken: ${JSON.stringify(sellTokenFilter)}, 
                buyToken: ${JSON.stringify(buyTokenFilter)}, 
                sellVolume_gt: 0, 
                ${specificAuction ? `auctionIndex: ${specificAuction}` : `auctionIndex_gte: ${Math.max(currentAuctionIndex - numberOfAuctions)}`}
            }) {
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

        console.group()
        //  console.debug('Checking sellToken: ', sellTokenFilter)
        //  console.debug('Checking buyToken: ', buyTokenFilter)
        //  console.debug('Checking with currentAuctionIndex = ', currentAuctionIndex)
        //  console.debug('Checking with numberOfAuctions = ', numberOfAuctions)
        //  console.debug('Checking with auctionIndex_gt = ', currentAuctionIndex - numberOfAuctions)
        //  console.debug('DATA = ', data)
        console.groupEnd()

        if (!data.auctions) throw new Error('Range too large/small or no record of data at set params - please try a different range')

        // Cache auctions
        const { auctions } = data

        // Auto sort new choices DESC
        auctions.sort((a, b) => b.auctionIndex - a.auctionIndex)

        return {
          bcNetwork,
          auctions,
          currentAuctionIndex,
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
          bcNetwork,
          auctions,
          currentAuctionIndex,
        }) => {
          setNetwork(bcNetwork)
          setPastAuctions(auctions)
          setAuctionLimits({ max: currentAuctionIndex, min: Math.max(currentAuctionIndex - numberOfAuctions) })
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
  }, [sellTokenFilter, buyTokenFilter, numberOfAuctions, specificAuction])
  
  // eslint-disable-next-line eqeqeq
  // const renderEtherscanLink = (address, section) => <a href={`https://${network == '4' ? 'rinkeby.etherscan' : 'etherscan'}.io/address/${address}${section ? '#' + section : ''}`} target="_blank" rel="noopener noreferrer">{address}</a>
  // const renderAccountLink = address => address && <Link to={'/accounts/' + address}>{address}</Link>
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
    const { sellSymbol, buySymbol } = tokenListToName(availableTokens, sellTokenFilter, buyTokenFilter, auctionIndex)

    return (
      <tr 
        key={auctionIndex * Math.random()} 
        onClick={() => window.location.href=`${window.location.origin}/#/trades?sellToken=${sellToken}&buyToken=${buyToken}&auctionIndex=${auctionIndex}`}
        style={{ cursor: 'pointer' }}
      >
        {/* NAME */}
        <td>
          <Badge color="success" pill>{`${sellSymbol}-${buySymbol}-${auctionIndex}`}</Badge>
        </td>
        {/* Volumes */}
        <td>
          <p><strong>Sell volume:</strong> {(sellVolume / 10 ** 18).toFixed(FIXED_DECIMALS)} [{sellSymbol}]</p>
          <p><strong>Buy volume:</strong> {(buyVolume / 10 ** 18).toFixed(FIXED_DECIMALS)} [{buySymbol}]</p>
        </td>
        {/* Times */}
        <td>
          <p><strong>Starting time:</strong> {(new Date(startTime * 1000)).toUTCString()}</p>
          <p><strong>Clearing time:</strong> {(new Date(clearingTime * 1000)).toUTCString()}</p>
        </td>
        {/* L.C */}
        <td>
          <strong>{(totalFeesPaid / 10 ** 18).toFixed(FIXED_DECIMALS)}</strong> ETH
        </td>
      </tr>
    )
  }
  // Data Loading
  if (loading) return <Loading />
  
  return (
    <PageWrapper pageTitle="DutchX Past Auctions">
      <AttentionBanner title="MAINNET ONLY" subText="This feature is currently only available for Mainnet. Please check back later for data on other networks." />
      <Form>
        <FormGroup row>
          {/* Filter SellToken */}
          <Col sm={6} className="py-2">
            <PageFilter
              type="select"
              title="Sell Token"
              showWhat={sellTokenFilter}
              changeFunction={event => setSellTokenFilter(event.target.value)}
              inputName="trades"
              render={availableTokens.map(({ name, address, symbol }) => <option key={address + Math.random()} value={address}>{symbol} ({name})</option>)}
            />
            {/* Filter BuyToken */}
            <PageFilter
              type="select"
              title="Buy Token"
              showWhat={buyTokenFilter}
              changeFunction={event => setBuyTokenFilter(event.target.value)}
              inputName="trades"
              render={availableTokens.map(({ name, address, symbol }) => <option key={address + Math.random()} value={address}>{symbol} ({name})</option>)}
            />
          </Col>
          {/* Filter AuctionIndex Range Type */}
          <Col sm={6} className="py-2">
            {/* Filter specific auction */}
            <PageFilterSubmit
              type="number"
              title="Specific auction to show"
              showWhat={numberOfAuctions}
              submitFunction={setSpecificAuction}
              inputName="trades"
            />
          </Col>
        </FormGroup>
      </Form>

      {/* Pagination Control */}
      {(auctionLimits.min + defaultState.numberOfAuctions) >= auctionLimits.max ? <button className="btn btn-primary" style={{ margin: 3 }} onClick={() => setNumberOfAuctions(prevState => prevState + defaultState.numberOfAuctions)}>Next</button>
        :
        ((auctionLimits.min - defaultState.numberOfAuctions) <= 0 && auctionLimits.min <= 0) ? <button className="btn btn-primary" style={{ margin: 3 }} onClick={() => setNumberOfAuctions(prevState => prevState - defaultState.numberOfAuctions)}>Previous</button>
          :
          <>
            <button className="btn btn-primary" style={{ margin: 3 }} onClick={() => setNumberOfAuctions(prevState => prevState - defaultState.numberOfAuctions)}>Previous</button>
            <button className="btn btn-primary" style={{ margin: 3 }} onClick={() => setNumberOfAuctions(prevState => prevState + defaultState.numberOfAuctions)}>Next</button>
          </>}

      {/* Filter labels */}
      <>
        <FilterLabel
          onClickHandler={() => setSpecificAuction(undefined)}
          filterTitle="Selected Auction"
          filterData={specificAuction}
        />
      </>

      {error
        ?
        <ErrorPre error={error} errorTitle="" />
        :
        <Table responsive hover>
          <thead>
            <tr>
              <th>Market</th>
              <th>Volumes</th>
              <th>Times</th>
              <th>Liquidity Contribution</th>
            </tr>
          </thead>
          <tbody>
            {pastAuctions && pastAuctions.map(auction => renderTrades(auction))}
          </tbody>
        </Table>}

      {/* Pagination Control */}
      {(auctionLimits.min + defaultState.numberOfAuctions) >= auctionLimits.max ? <button className="btn btn-primary" style={{ margin: 3 }} onClick={() => setNumberOfAuctions(prevState => prevState + defaultState.numberOfAuctions)}>Next</button>
        :
        ((auctionLimits.min - defaultState.numberOfAuctions) <= 0 && auctionLimits.min <= 0) ? <button className="btn btn-primary" style={{ margin: 3 }} onClick={() => setNumberOfAuctions(prevState => prevState - defaultState.numberOfAuctions)}>Previous</button>
          :
          <>
            <button className="btn btn-primary" style={{ margin: 3 }} onClick={() => setNumberOfAuctions(prevState => prevState - defaultState.numberOfAuctions)}>Previous</button>
            <button className="btn btn-primary" style={{ margin: 3 }} onClick={() => setNumberOfAuctions(prevState => prevState + defaultState.numberOfAuctions)}>Next</button>
          </>}
    </PageWrapper>
  )
}

export default ErrorHOC(Web3HOC(PastAuctions))
