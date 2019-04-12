import React, { Component } from 'react';

import { Col, Table, Badge, FormGroup, Form } from 'reactstrap';

import { PageWrapper, PageFilter } from '../../../containers'

import Web3HOC from '../../../HOCs/Web3HOC'

import getDxService from '../../../services/dxService'

import moment from 'moment'

const STATES = [
  { label: 'Waiting for funding', value: 'WAITING_FOR_FUNDING', color: 'secondary' },
  { label: 'Waiting for auction to start', value: 'WAITING_FOR_AUCTION_TO_START', color: 'warning' },
  { label: 'Pending close theoretical', value: 'PENDING_CLOSE_THEORETICAL', color: 'danger' },
  { label: 'One auction has closed', value: 'ONE_AUCTION_HAS_CLOSED', color: 'primary' },
  { label: 'Running', value: 'RUNNING', color: 'success' },
  { label: 'Not currently running', value: false, color: 'warning' },
]
const HIGH_RUNNING_TIME = 1000 * 60 * 60 * 6.5
const NEAR_CLOSING_TIME = 1000 * 60 * 60 * 5

class MarketList extends Component {
  state = {
    // Filters
    token: '',
    state: '',

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
      // TODO: Get sell volume, buyVolume, etc.. (use dxService)      
      const [state, sellVolume, buyVolume, startTime] = await Promise.all([
        dxService.getMarketState(tokenA.address, tokenB.address),
        dxService.getMarketSellVolume(tokenA.address, tokenB.address),
        dxService.getMarketBuyVolume(tokenA.address, tokenB.address),
        dxService.getMarketStartTime(tokenA.address, tokenB.address)
      ])

      // if response is API error object, return false. Else value
      const checkApiRes = val => (val && typeof val === 'object' && val.status) ? false : val

      return {
        id: index,
        sellVolume: checkApiRes(sellVolume),
        buyVolume: checkApiRes(buyVolume),
        state: checkApiRes(state),
        startTime: checkApiRes(startTime),

        ...{tokenA, tokenB}
      }
    }))
    markets = markets.sort((marketA, marketB) => {
      if (!marketA.startTime) {
        return 1
      }

      if (!marketB.startTime) {
        return -1
      }

      return marketA.startTime - marketB.startTime
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
      tokenA,
      tokenB,
      startTime,
      state,
      sellVolume,
      buyVolume
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
          <Badge color="primary" className="p-2" pill>
            {tokenA.symbol + '-' + tokenB.symbol}
          </Badge>
        </td>
        <td>
          {this.renderEtherscanLink(tokenA)}
        </td>
        <td>
          {this.renderEtherscanLink(tokenB)}
        </td>
        <td>
          <Badge color={stateColor} pill>
            {stateInfo.label}
          </Badge>
          <ul>
            {this.renderDateRow('Start time', startTime)}
            {sellVolume && this.renderAmontRow('Sell volume', Number(sellVolume / (10**tokenA.decimals)).toFixed(2), tokenA.symbol)}
            {buyVolume > 0 && this.renderAmontRow('Buy volume', Number(buyVolume / (10**tokenB.decimals)).toFixed(2), tokenB.symbol)}
            {buyVolume > 0 && this.renderAmontRow('Oustanding volume', Number(buyVolume / (10**tokenB.decimals)).toFixed(2), tokenB.symbol)}
          </ul>
        </td>
      </tr>
    )
  }

  renderEtherscanLink({ name, address }) {
    return (
      // eslint-disable-next-line eqeqeq
      <a href={`https://${this.state.network == '4' ? 'rinkeby.etherscan' : 'etherscan'}.io/address/${address}`} target="_blank" rel="noopener noreferrer">{name}</a>
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

  renderAmontRow(label, amount, currency) {
    return amount && (
      <li>
        <strong>{label}</strong>:&nbsp;{amount + ' ' + currency}
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

    // Filter by type
    let filteredMarkets = markets
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
              <th>State</th>
              <th></th>
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


export default Web3HOC(MarketList)

