import React, { useEffect, useState } from 'react'
import axios from 'axios'

import { Col, Table, Badge, FormGroup, Form } from 'reactstrap'
import { PageFilter, PageFilterSubmit, PageWrapper } from '../../containers'

import ErrorHOC from '../../HOCs/ErrorHOC'
import Web3HOC from '../../HOCs/Web3HOC'

import AttentionBanner from '../AttentionBanner'
import Loading from '../Loading'
import ErrorPre from '../Error'

import getDxService from '../../services/dxService'

import { from } from 'rxjs'

function tokenFromURL(url) {
	if (!url || (url.search('sellToken') === -1 || url.search('buyToken') === -1)) return false 

	const [[, sellToken], [, buyToken]] = url
		.split('?')[1]
		.split('&')
		.map(item => item.split('='))	

	return { sellToken, buyToken }
}

// GraphQL DutchX Query
const URL = 'https://api.thegraph.com/subgraphs/name/gnosis/dutchx'
const MAINNET_WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const MAINNET_GNO_ADDRESS = '0x6810e776880c02933d47db1b9fc05908e5386b96'

function PastAuctions({ web3 }) {
  const [pastAuctions, setPastAuctions] = useState([])
  const [availableTokens, setAvailableTokens] = useState([])
  const [maxAuctions, setMaxAuctions] = useState(501)
  // const [safeTypeFilter, setSafeTypeFilter] = useState('')
  const [network, setNetwork] = useState(undefined)
  // Data Selection
  const [sellTokenFilter, setSellTokenFilter] = useState((tokenFromURL(window.location.href) && tokenFromURL(window.location.href).sellToken) || MAINNET_WETH_ADDRESS)
  const [buyTokenFilter, setBuyTokenFilter] = useState((tokenFromURL(window.location.href) && tokenFromURL(window.location.href).buyToken) || MAINNET_GNO_ADDRESS)
  const [numberOfAuctions, setNumberOfAuctions] = useState(50)
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
        
        const { data : { data } } = await axios.post(URL, { 
          query: `{
            auctions(
              ${!specificAuction ? `first: ${numberOfAuctions},` : ''} 
              where: { 
                sellToken_contains: ${JSON.stringify(sellTokenFilter)}, 
                buyToken_contains: ${JSON.stringify(buyTokenFilter)}, 
                sellVolume_gt: 0, 
                ${specificAuction ? `auctionIndex: ${specificAuction}` : `auctionIndex_gte: ${currentAuctionIndex - numberOfAuctions}`}
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

        // console.group()
        //   console.debug('Checking sellToken: ', sellTokenFilter)
        //   console.debug('Checking buyToken: ', buyTokenFilter)
        //   console.debug('Checking with currentAuctionIndex = ', currentAuctionIndex)
        //   console.debug('Checking with numberOfAuctions = ', numberOfAuctions)
        //   console.debug('Checking with auctionIndex_gt = ', currentAuctionIndex - numberOfAuctions)
        //   console.debug('DATA = ', data)
        // console.groupEnd()

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
        setMaxAuctions(currentAuctionIndex)
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
  }) =>
    <tr key={auctionIndex * Math.random()}>
      {/* NAME */}
      <td>
        <a href={`${window.location.origin}/#/trades?sellToken=${sellToken}&buyToken=${buyToken}&auctionIndex=${auctionIndex}`}>
          <Badge color="success" pill>{auctionIndex}</Badge>
        </a>
      </td>
      {/* SECTION */}
      <td>
        <Badge pill color="warning">VOLUMES</Badge>
        <ul>
          <li><strong>Sell volume:</strong> {(sellVolume / 10**18).toFixed(4)}</li>
          <li><strong>Buy volume:</strong> {(buyVolume / 10**18).toFixed(4)}</li>
        </ul>
      </td>
      <td>
        <Badge pill color="warning">TIMES</Badge>
        <ul>
          <li><strong>Starting time:</strong> {(new Date(startTime * 1000)).toUTCString()}</li>
          <li><strong>Clearing time:</strong> {(new Date(clearingTime * 1000)).toUTCString()}</li>
        </ul>
      </td>
      <td>
        <strong>{(totalFeesPaid / 10**18).toFixed(4)}</strong> ETH
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
          {/* Filter AuctionIndex Range Type */}
          <Col sm={6} className="py-2">
            <PageFilter
              type="select"
              title="Number of auctions to show"
              showWhat={numberOfAuctions}
              changeFunction={event => setNumberOfAuctions(event.target.value)}
              inputName="trades"
              render={Array.from({length: maxAuctions}, (_, i) => <option key={i + Math.random()} value={i}>{i}</option>)}
            />
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
      {specificAuction && 
        <div onClick={() => setSpecificAuction(undefined)} style={{ backgroundColor: '#d9ffd0', display: 'inline-block', padding: 10, cursor: 'pointer' }}>
          <strong style={{ marginRight: 13 }}>Selected Auction:</strong>
          <Badge color="success" pill>{specificAuction}</Badge> <strong style={{ cursor: 'pointer' }} onClick={() => setSpecificAuction(undefined)}>x</strong>
        </div>
      }
      {error 
        ?
      <ErrorPre error={error} errorTitle=""/>
        :
      <Table responsive hover>
        <thead>
          <tr>
            <th>Auction Index</th>
            <th>Volumes</th>
            <th>Times</th>
            <th>Fees</th>
          </tr>
        </thead>
        <tbody>
          {pastAuctions && pastAuctions.map(trade => renderTrades(trade))}
        </tbody>
      </Table>}
    </PageWrapper>
  )
}

export default ErrorHOC(Web3HOC(PastAuctions))
