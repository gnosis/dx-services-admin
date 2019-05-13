/* eslint-disable eqeqeq */
import React, { Component } from 'react';

import { Col, Table, Badge, FormGroup, Form } from 'reactstrap';

import { PageWrapper, PageFilter } from '../../../containers'

import ErrorHOC from '../../../HOCs/ErrorHOC'
import Web3HOC from '../../../HOCs/Web3HOC'

import getDxService from '../../../services/dxService'

import moment from 'moment'
import { FIXED_DECIMALS } from '../../../globals';

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

class MarketList extends Component {
  state = {
    // Filters
    token: '',
    state: '',

    // Sort
    sortOrder: false,

    // Data
    markets: [],
    tokens: [],

    // Web3
    network: 'UNKNOWN NETWORK',
  }

  async componentDidMount() {
    const network = await this.props.web3.getNetworkId()
    const dxService = await getDxService(network, this.props.web3)

    let markets = await dxService.getMarkets()

    markets = await Promise.all(markets.map(async ({ tokenA, tokenB }, index) => {
      const stateDetails = await dxService.getMarketState(tokenA.symbol.toUpperCase(), tokenB.address)

      const {
        auctionIndex,
        state,
        auction: {
          sellVolume,
          buyVolume,
          fundingInUSD,
          price,
          priceRelationshipPercentage,
          boughtPercentage,
        },
        auctionOpp: {
          sellVolume: sellVolumeOpp,
          buyVolume: buyVolumeOpp,
          fundingInUSD: fundingInUSDOpp,
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
        price,
        priceRelationshipPercentage,
        boughtPercentage,

        oppState: calculateState(state, stateDetails.auctionOpp, { startTime }),
        sellVolumeOpp,
        buyVolumeOpp,
        fundingInUSDOpp,
        priceOpp,
        priceRelationshipPercentageOpp,
        boughtPercentageOpp,

        ...{ tokenA, tokenB }
      }
    }))
    markets = markets.sort((marketA, marketB) => {
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

    this.setState({
      markets,
      tokens,
      network
    })
  }

  renderRow(market) {
    const {
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
      price,
      priceRelationshipPercentage,
      boughtPercentage,

      oppState,
      sellVolumeOpp,
      buyVolumeOpp,
      fundingInUSDOpp,
      priceOpp,
      priceRelationshipPercentageOpp,
      boughtPercentageOpp,
    } = market

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
          <Badge color="primary" className="p-2" pill title={`${tokenA.address}-${tokenB.address}`}>
            {tokenA.symbol + '-' + tokenB.symbol + '-' + auctionIndex}
          </Badge>
        </td>
        <td>
          {this.renderEtherscanLink(tokenA)}
        </td>
        <td>
          {this.renderEtherscanLink(tokenB)}
        </td>
        {/* DIRECT */}
        <td>
          <Badge color="warning" pill title={`${tokenA.address}-${tokenB.address}`}>
            {tokenA.symbol + '-' + tokenB.symbol}
          </Badge>:&nbsp;
          <Badge color={directState.color} pill>
            {directState.state}
          </Badge>
          {this.renderAuctionState({
            startTime,
            buyToken: tokenB,
            sellToken: tokenA,
            sellVolume,
            buyVolume,
            fundingInUSD,
            boughtPercentage,
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
          {this.renderAuctionState({
            startTime,
            buyToken: tokenA,
            sellToken: tokenB,
            sellVolume: sellVolumeOpp,
            buyVolume: buyVolumeOpp,
            fundingInUSD: fundingInUSDOpp,
            boughtPercentage: boughtPercentageOpp,
            price: priceOpp,
            priceRelationshipPercentage: priceRelationshipPercentageOpp
          })}
        </td>
        <td></td>
      </tr>
    )
  }

  renderEtherscanLink({ name, address }) {
    return (
      <a href={`https://${this.state.network == '4' ? 'rinkeby.etherscan' : 'etherscan'}.io/address/${address}`} target="_blank" rel="noopener noreferrer" title={address}>{name}</a>
    )
  }

  renderAuctionState({
    startTime,
    sellVolume,
    sellToken,
    fundingInUSD,
    buyVolume,
    buyToken,
    boughtPercentage,
    price,
    priceRelationshipPercentage
  }) {
    return (
      <ul>
        {this.renderDateRow('Start time', startTime)}
        {/* Sell Volume */}
        {sellVolume && this.renderAmountRow('Sell volume', Number(sellVolume / (10 ** sellToken.decimals)).toFixed(2), sellToken.symbol, Number(fundingInUSD).toFixed(2))}
        {startTime && (
          <React.Fragment>
            {/* Buy Volume */}
            {buyVolume > 0 && this.renderAmountRow('Buy volume', Number(buyVolume / (10 ** buyToken.decimals)).toFixed(2), buyToken.symbol, null, Number(boughtPercentage).toFixed(2))}
            {/* Outstanding Vol */}
            {buyVolume > 0 && this.renderAmountRow('Oustanding volume', Number(buyVolume / (10 ** buyToken.decimals)).toFixed(2), buyToken.symbol)}
            {/* Price */}
            {price && this.renderAmountRow('Price', Number(price.numerator / price.denominator).toFixed(FIXED_DECIMALS), buyToken.symbol)}
            {/* Closing Price Increment */}
            {priceRelationshipPercentage && this.renderAmountRow('Previous closing price increment', calculatePercentage(priceRelationshipPercentage, startTime), '')}
          </React.Fragment>
        )}
      </ul>
    )
  }

  renderDateRow(label, time, badgeColor) {
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

  renderAmountRow(label, amount, currency, usd, percentageBought) {
    return amount && (
      <li>
        <strong>{label}</strong>:&nbsp;{amount + ' ' + currency} {usd && <code>[${usd}]</code>} {percentageBought && <code>[{percentageBought}% bought]</code>}
      </li>
    )
  }

  render() {
    const {
      // Data
      markets,
      tokens,

      // Filters
      token,
      state
    } = this.state

    // TODO: convert to hooks (no class) and use memo
    const sortedMarkets = markets.sort((marketA, marketB) => {
      if (!marketA.startTime || !marketB.startTime) return -1

      return !this.state.sortOrder ? new Date(marketA.startTime) - new Date(marketB.startTime) : new Date(marketB.startTime) - new Date(marketA.startTime)
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
                changeFunction={event => this.setState({ token: event.target.value })}
                inputName="token"
              />
            </Col>

            <Col sm={6} className="py-2">
              <PageFilter
                type="select"
                title="State"
                showWhat={state}
                changeFunction={event => this.setState({ state: event.target.value })}
                inputName="state"
                render={STATES.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
              />
            </Col>
          </FormGroup>
        </Form>

        <Table responsive hover>
          <thead>
            <tr>
              <th>Market</th>
              <th>Token A</th>
              <th>Token B</th>
              <th>State: Direct</th>
              <th>State: Opposite</th>
              <th style={{ cursor: 'pointer' }} onClick={() => this.setState({ sortOrder: !this.state.sortOrder })}>Sort by Time: {this.state.sortOrder ? '[ASC]' : '[DSC]'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredMarkets.map(market => this.renderRow(market))}
          </tbody>
        </Table>
      </PageWrapper>
    )
  }
}


export default ErrorHOC(Web3HOC(MarketList))

