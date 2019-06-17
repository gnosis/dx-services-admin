/* eslint-disable eqeqeq */
import React, { useEffect, useState } from 'react';

import { Col, Table, Badge, FormGroup, Form } from 'reactstrap';

import { PageWrapper, PageFilter } from '../../../containers'

import ErrorHOC from '../../../HOCs/ErrorHOC'
import Web3HOC from '../../../HOCs/Web3HOC'

import ErrorPre from '../../Error'
import Loading from '../../Loading'

import getDxService from '../../../services/dxService'

import moment from 'moment'
import { FIXED_DECIMALS } from '../../../globals'

import { from } from 'rxjs'

const STATES = [
  { label: 'Waiting for funding', value: 'WAITING_FOR_FUNDING', color: 'secondary' },
  { label: 'Waiting for auction to start', value: 'WAITING_FOR_AUCTION_TO_START', color: 'warning' },
  { label: 'Pending close theoretical', value: 'PENDING_CLOSE_THEORETICAL', color: 'danger' },
  { label: 'One auction has closed', value: 'ONE_AUCTION_HAS_CLOSED', color: 'primary' },
  { label: 'Running', value: 'RUNNING', color: 'success' },
  // { label: 'Not currently running', value: false, color: 'warning' },
]

const calculateState = (state, auc, { startTime }) => {
  if (!startTime) {
    // WAITING FOR THAT FUNDING
    return { state: 'Waiting for funding', color: 'secondary' }
  } else if (auc.sellVolume == 0) {
    // DIDN'T RUN
    return { state: 'Didn\'t run', color: 'secondary' }
  } else if (auc.isClosed) {
    // CLOSED
    return { state: 'Closed', color: 'primary' }
  } else if (auc.isTheoreticalClosed) {
    // THEORETICALLY CLOSED
    return { state: 'Theoretically closed', color: 'danger' }
  } else if (new Date(startTime) < new Date()) {
    // RUNNING
    return { state: 'Running', color: 'success' }
  } else {
    // ELSE USE TOTAL STATE
    const displayState = STATES.find(stateLabel => stateLabel.value === state)
    return { state: displayState.label, color: displayState.color }
  }
}

const calculatePercentage = (percentage, auctionTime) => {
  const relativePercentage = Math.abs(Number(100 - percentage))
  const sign = relativePercentage > 0 ? '+' : ''
  return sign + relativePercentage.toFixed(2) + '%'
}

const HIGH_RUNNING_TIME = 1000 * 60 * 60 * 6.5
const NEAR_CLOSING_TIME = 1000 * 60 * 60 * 5

function MarketList({
  web3,
}) {
  const [appState, setAppState] = useState({
    // Data
    markets: [],
    erroredMarkets: [],
    tokens: [],

    // Web3
    network: 'UNKNOWN NETWORK',
  })
  const [state, setState] = useState('')
  const [token, setToken] = useState('')
  const [sortOrder, setSortOrder] = useState(false)
  
  const [error, setError] = useState(undefined)
  const [loading, setLoading] = useState(false)

  // componentDidMount
  useEffect(() => {    
    async function asyncMountLogic() {
      try {
        const network = await web3.getNetworkId()
        const dxService = await getDxService(network, web3)

        let markets = await dxService.getMarkets()
        
        if (!Array.isArray(markets)) return setAppState(prevState => ({ ...prevState, error: markets }))

        markets = await Promise.all(markets.map(async (market, index) => {
          if (!market.tokenA || !market.tokenB) return { error: 'Error loading market - please try refreshing' }
          const { tokenA, tokenB } = market
          const stateDetails = await dxService.getMarketState(tokenA.address, tokenB.address)

          // check for any errored markets and proceed
          if (stateDetails.status) {
            return setAppState(prevState => ({
              ...prevState,
              erroredMarkets: [
                ...prevState.erroredMarkets,
                {
                  tokenA,
                  tokenB,
                  status: stateDetails.status,
                  message: stateDetails.message,
                  type: stateDetails.type,
                }
              ]
            }))
          }

          const {
            auctionIndex,
            state,
            auction: {
              sellVolume,
              buyVolume,
              fundingInUSD,
              outstandingVolume,
              price,
              priceRelationshipPercentage,
              boughtPercentage,
            },
            auctionOpp: {
              sellVolume: sellVolumeOpp,
              buyVolume: buyVolumeOpp,
              fundingInUSD: fundingInUSDOpp,
              outstandingVolume: outstandingVolumeOpp,
              price: priceOpp,
              priceRelationshipPercentage: priceRelationshipPercentageOpp,
              boughtPercentage: boughtPercentageOpp,
            },
            auctionStart: startTime
          } = stateDetails
          
          return {
            id: index,
            auctionIndex,
            state,
            startTime,

            directState: calculateState(state, stateDetails.auction, { startTime }),
            sellVolume,
            buyVolume,
            fundingInUSD,
            outstandingVolume,
            price,
            priceRelationshipPercentage,
            boughtPercentage,

            oppState: calculateState(state, stateDetails.auctionOpp, { startTime }),
            sellVolumeOpp,
            buyVolumeOpp,
            fundingInUSDOpp,
            outstandingVolumeOpp,
            priceOpp,
            priceRelationshipPercentageOpp,
            boughtPercentageOpp,

            ...{ tokenA, tokenB }
          }
        }))
        markets = markets.filter(item => item).sort((marketA, marketB) => {
          if (!marketA.startTime) return 1
          if (!marketB.startTime) return -1


          return new Date(marketA.startTime) - new Date(marketB.startTime)
        })

        const tokens = markets.reduce((acc, { tokenA, tokenB }) => {
          if (!acc.includes(tokenA.symbol)) {
            acc.push(tokenA.symbol)
          }
          if (!acc.includes(tokenB.symbol)) {
            acc.push(tokenB.symbol)
          }
          return acc
        }, [])

        return {
          markets,
          tokens,
          network,
        }
      } catch (error) {
        console.error(error)
        throw new Error(error)
      }
    }

    setLoading(true)

    const marketListSubscription = from(asyncMountLogic())
    .subscribe({
      next: ({
        markets,
        tokens,
        network,
      }) => {
        setAppState(prevState => ({
            ...prevState,
            markets,
            tokens,
            network,
          }))
      },
      error: (appError) => {
        setError(appError)
      },
      complete: () => setLoading(false),
    })

    return () => {
      marketListSubscription && marketListSubscription.unsubscribe()
    }
  }, [])

  function renderRow({
    id,
    auctionIndex,

    // state,
    tokenA,
    tokenB,
    startTime,

    directState,
    sellVolume,
    buyVolume,
    fundingInUSD,
    outstandingVolume,
    price,
    priceRelationshipPercentage,
    boughtPercentage,

    oppState,
    sellVolumeOpp,
    buyVolumeOpp,
    fundingInUSDOpp,
    outstandingVolumeOpp,
    priceOpp,
    priceRelationshipPercentageOpp,
    boughtPercentageOpp,
  }) {

    // const stateInfo = STATES.find(stateInfo => stateInfo.value === state)
    // const stateColor = stateInfo.color

    // TODO: color the markets depending on how long have they been running
    const now = new Date()
    let backgroundColor
    if (!startTime) {
      backgroundColor = '#f9f9f9'
    } else {
      const runningTime = now.getTime() - new Date(startTime).getTime()
      if (runningTime > HIGH_RUNNING_TIME) {
        backgroundColor = '#ffeeee'
      } else if (runningTime > NEAR_CLOSING_TIME) {
        backgroundColor = '#fff9c8'
      } else {
        backgroundColor = 'white'
      }
    }

    return (
      <tr key={`bot-${id}`} style={{ backgroundColor }}>
        <td>
            <a href={`${window.location.origin}/#/trades?sellToken=${tokenA.address}&buyToken=${tokenB.address}`}>
              <Badge color="primary" className="p-2" pill title={`${tokenA.address}-${tokenB.address}`}>
                {tokenA.symbol + '-' + tokenB.symbol + '-' + auctionIndex}
              </Badge>
            </a>
        </td>
        <td>
          {renderEtherscanLink(tokenA)}
        </td>
        <td>
          {renderEtherscanLink(tokenB)}
        </td>
        {/* DIRECT */}
        <td>
          <Badge color="warning" pill title={`${tokenA.address}-${tokenB.address}`}>
            {tokenA.symbol + '-' + tokenB.symbol}
          </Badge>:&nbsp;
          <Badge color={directState.color} pill>
            {directState.state}
          </Badge>
          {renderAuctionState({
            startTime,
            buyToken: tokenB,
            sellToken: tokenA,
            sellVolume,
            buyVolume,
            fundingInUSD,
            boughtPercentage,
            outstandingVolume,
            price,
            priceRelationshipPercentage
          })}
        </td>
        {/* OPPOSITE */}
        <td>
          <Badge color="warning" pill title={`${tokenA.address}-${tokenB.address}`}>
            {tokenB.symbol + '-' + tokenA.symbol}
          </Badge>:&nbsp;
          <Badge color={oppState.color} pill>
            {oppState.state}
          </Badge>
          {renderAuctionState({
            startTime,
            buyToken: tokenA,
            sellToken: tokenB,
            sellVolume: sellVolumeOpp,
            buyVolume: buyVolumeOpp,
            fundingInUSD: fundingInUSDOpp,
            boughtPercentage: boughtPercentageOpp,
            outstandingVolume: outstandingVolumeOpp,
            price: priceOpp,
            priceRelationshipPercentage: priceRelationshipPercentageOpp
          })}
        </td>
        <td></td>
      </tr>
    )
  }

  function renderEtherscanLink({ name, address }) {
    return (
      <a href={`https://${appState.network == '4' ? 'rinkeby.etherscan' : 'etherscan'}.io/address/${address}`} target="_blank" rel="noopener noreferrer" title={address}>{name}</a>
    )
  }

  function renderAuctionState({
    startTime,
    sellVolume,
    sellToken,
    fundingInUSD,
    buyVolume,
    buyToken,
    boughtPercentage,
    outstandingVolume,
    price,
    priceRelationshipPercentage
  }) {
    return (
      <ul>
        {renderDateRow('Start time', startTime)}
        {/* Sell Volume */}
        {sellVolume && renderAmountRow('Sell volume', Number(sellVolume / (10 ** sellToken.decimals)).toFixed(2), sellToken.symbol, Number(fundingInUSD).toFixed(2))}
        {startTime && (
          <React.Fragment>
            {/* Buy Volume */}
            {buyVolume > 0 && renderAmountRow('Buy volume', Number(buyVolume / (10 ** buyToken.decimals)).toFixed(2), buyToken.symbol, null, Number(boughtPercentage).toFixed(2))}
            {/* Outstanding Vol */}
            {outstandingVolume > 0 && renderAmountRow('Oustanding volume', Number(outstandingVolume / (10 ** buyToken.decimals)).toFixed(2), buyToken.symbol)}
            {/* Price */}
            {price && renderAmountRow('Price', Number(price.numerator / price.denominator).toFixed(FIXED_DECIMALS), buyToken.symbol)}
            {/* Closing Price Increment */}
            {priceRelationshipPercentage && renderAmountRow('Previous closing price increment', calculatePercentage(priceRelationshipPercentage, startTime), '')}
          </React.Fragment>
        )}
      </ul>
    )
  }

  function renderDateRow(label, time, badgeColor) {
    return time && (
      <li>
        {!badgeColor && (
          <strong>{label}</strong>
        )}
        {badgeColor && (
          <Badge color={badgeColor}>{label}</Badge>
        )}
        :&nbsp;
        {moment(time).fromNow()}
      </li>
    )
  }

  function renderAmountRow(label, amount, currency, usd, percentageBought) {
    return amount && (
      <li>
        <strong>{label}</strong>:&nbsp;{amount + ' ' + currency} {usd && <code>[${usd}]</code>} {percentageBought && <code>[{percentageBought}% bought]</code>}
      </li>
    )
  }

  const {
    // Data
    markets,
    erroredMarkets,
    tokens,
  } = appState

  if (error) return <ErrorPre error={error} errorTitle="An initialisation error during market fetching - please try refreshing!" />
  // Data Loading
  if (loading) return <Loading />

  // TODO: convert to hooks (no class) and use memo
  const sortedMarkets = markets.sort((marketA, marketB) => {
    if (!marketA.startTime || !marketB.startTime) return -1

    return !sortOrder ? new Date(marketA.startTime) - new Date(marketB.startTime) : new Date(marketB.startTime) - new Date(marketA.startTime)
  })

  // Filter by type
  let filteredMarkets = sortedMarkets
  if (state) {
    filteredMarkets = filteredMarkets.filter(market => market.state && market.state === state)
  }

  // Filter by token
  if (token) {
    filteredMarkets = filteredMarkets.filter(({ tokenA, tokenB }) => {
      return tokenA.symbol === token || tokenB.symbol === token
    })
  }

  return (
    <PageWrapper pageTitle="DutchX Markets">
      <Form>
        <FormGroup row>
          <Col sm={6} className="py-2">
            <PageFilter
              type="select"
              title="Token"
              filterWhat={tokens}
              showWhat={token}
              changeFunction={event => setToken(event.target.value)}
              inputName="token"
            />
          </Col>

          <Col sm={6} className="py-2">
            <PageFilter
              type="select"
              title="State"
              showWhat={state}
              changeFunction={event => setState(event.target.value)}
              inputName="state"
              render={STATES.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
            />
          </Col>
        </FormGroup>
      </Form>

      {erroredMarkets.length > 0 && <ErrorTable erroredMarkets={erroredMarkets}/>}

      <Table responsive hover>
        <thead>
          <tr>
            <th>Market</th>
            <th>Token A</th>
            <th>Token B</th>
            <th>State: Direct</th>
            <th>State: Opposite</th>
            <th style={{ cursor: 'pointer' }} onClick={() => setSortOrder(!sortOrder)}>Sort by Time: {sortOrder ? '[ASC]' : '[DSC]'}</th>
          </tr>
        </thead>
        <tbody>
          {filteredMarkets.map(market => renderRow(market))}
        </tbody>
      </Table>
    </PageWrapper>
  )
}

function ErrorTable({
  erroredMarkets,
}) {
  return (
    <>
      <Badge pill style={{ backgroundColor: '#f4f59a' }}>An error occurred during load!</Badge>
      <Table style={{ backgroundColor: '#f4f59a' }} responsive hover>
        <thead>
          <tr>
            <th>Market</th>
            <th>Status Code</th>
            <th>Error Type</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {erroredMarkets.map(({ status, message, type, tokenA, tokenB }) => 
            <tr key={message} style={{ backgroundColor: '#f9c4c4' }}>
              <td>
                <Badge color="primary" className="p-2" pill title={`${tokenA.address}-${tokenB.address}`}>
                  {tokenA.symbol + '-' + tokenB.symbol}
                </Badge>
              </td>
              <td><Badge pill>{status}</Badge></td>
              <td><strong>{type}</strong></td>
              <td>{message}</td>
            </tr>
          )}
        </tbody>
      </ Table>
  </>
)}

export default ErrorHOC(Web3HOC(MarketList))
