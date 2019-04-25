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
  if (!startTime) return 'Waiting for auction to start'
  else if (!auc.isClosed && auc.sellVolume == 0) return 'Didn\'t run'
  else if (auc.isClosed) return 'Closed'
  else if (auc.isTheoreticalClosed) return 'Theoretically closed'
  else {
    const displayState = STATES.find(stateLabel => stateLabel.value === state)
    return displayState ? displayState.label : 'Unknown State'
  }
}

const calculatePercentage = (percentage, auctionTime) => {
  const now = new Date()
  const localAuctionStart = new Date(auctionTime)
  const hoursPassed = ((now - localAuctionStart) / 1000 / 60 / 60).toFixed()
  
  // use absolute value of 100 - val as auction below 6 hours
  if (hoursPassed < 6) return `+${Math.abs(Number(100 - percentage).toFixed(2))}%`

  // Above 6 hours, negative number
  return `-${Number(100 - percentage).toFixed(2)}%`
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
    
    markets = await Promise.all(markets.map(async ({tokenA, tokenB}, index) => {
      const stateDetails = await dxService.getMarketState(tokenA.symbol.toUpperCase(), tokenB.address)
      
      const { 
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

        ...{tokenA, tokenB}
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
      state,
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

    const stateInfo = STATES.find(stateInfo => stateInfo.value === state)
    const stateColor = stateInfo.color

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
            {tokenA.symbol + '-' + tokenB.symbol}
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
          <Badge color={stateColor} pill>
            {directState}
          </Badge>
          <ul>
            {this.renderDateRow('Start time', startTime)}
            {/* Sell Volume */}
            {sellVolume && this.renderAmountRow('Sell volume', Number(sellVolume / (10**tokenA.decimals)).toFixed(2), tokenA.symbol, Number(fundingInUSD).toFixed(2))}
            {/* Buy Volume */}
            {buyVolume > 0 && this.renderAmountRow('Buy volume', Number(buyVolume / (10**tokenB.decimals)).toFixed(2), tokenB.symbol, null, Number(boughtPercentage).toFixed(2))}
            {/* Outstanding Volume */}
            {buyVolume > 0 && this.renderAmountRow('Oustanding volume', Number(buyVolume / (10**tokenB.decimals)).toFixed(2), tokenB.symbol)}
            {/* Price */}
            {price && this.renderAmountRow('Price', Number(price.numerator/price.denominator).toFixed(FIXED_DECIMALS), tokenB.symbol)}
            {/* Closing Price Increment */}
            {priceRelationshipPercentage && this.renderAmountRow('Previous closing price increment', calculatePercentage(priceRelationshipPercentage, startTime), '')}
          </ul>
        </td>
        {/* OPPOSITE */}
        <td>
          <Badge color={stateColor} pill>
            {oppState}
          </Badge>
          <ul>
            {this.renderDateRow('Start time', startTime)}
            {/* Sell Volume */}
            {sellVolumeOpp && this.renderAmountRow('Sell volume', Number(sellVolumeOpp / (10**tokenB.decimals)).toFixed(2), tokenB.symbol, Number(fundingInUSDOpp).toFixed(2))}
            {/* Buy Volume */}
            {buyVolumeOpp > 0 && this.renderAmountRow('Buy volume', Number(buyVolumeOpp / (10**tokenA.decimals)).toFixed(2), tokenA.symbol, null, Number(boughtPercentageOpp).toFixed(2))}
            {/* Outstanding Vol */}
            {buyVolumeOpp > 0 && this.renderAmountRow('Oustanding volume', Number(buyVolumeOpp / (10**tokenA.decimals)).toFixed(2), tokenA.symbol)}
            {/* Price */}
            {priceOpp && this.renderAmountRow('Price', Number(priceOpp.numerator/priceOpp.denominator).toFixed(FIXED_DECIMALS), tokenA.symbol)}
            {/* Closing Price Increment */}
            {priceRelationshipPercentageOpp && this.renderAmountRow('Previous closing price increment', calculatePercentage(priceRelationshipPercentageOpp, startTime), '')}
          </ul>
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
              <th style={{ cursor: 'pointer' }} onClick={() => this.setState({ sortOrder: !this.state.sortOrder })}>Sort by Time: {this.state.sortOrder ? '[ASC]' : '[DSC]' }</th>
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

