import React, { Component } from 'react';

import { Card, CardBody, CardHeader, Col, Row, Table, Badge, FormGroup, Input, InputGroupAddon, InputGroup, Form } from 'reactstrap';
import Web3HOC from '../../../HOCs/Web3HOC'

import getDxService from '../../../services/dxService'

import moment from 'moment'

const STATES = [
  { label: 'Waiting for funding', value: 'WAITING_FOR_FUNDING', color: 'secondary' },
  { label: 'Waiting for auction to start', value: 'WAITING_FOR_AUCTION_TO_START', color: 'warning' },
  { label: 'Pending close theoretical', value: 'PENDING_CLOSE_THEORETICAL', color: 'danger' },
  { label: 'One auction has closed', value: 'ONE_AUCTION_HAS_CLOSED', color: 'primary' },
  { label: 'Running', value: 'RUNNING', color: 'success' },
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
    tokens: []
  }

  async componentDidMount() {
    const network = await this.props.web3.getNetworkId()
    const dxService = await getDxService(network)

    let markets = await dxService.getMarkets()
    markets = await Promise.all(markets.map(async (market, index) => {
      // TODO: Get sell volume, buyVolume, etc.. (use dxService)      
      let state, sellVolume, buyVolume, startTime
      if (Math.random() > 0.4) {
        state = 'RUNNING'
        sellVolume = Math.random() * 5000
        buyVolume = Math.random() * 5000
        startTime = new Date(new Date().getTime() - Math.random() * 500 * 60 * 1000)
      } else {
        state = 'WAITING_FOR_FUNDING'
        sellVolume = Math.random() * 100
        buyVolume = 0
        startTime = null
      }

      return {
        id: index,
        sellVolume,
        buyVolume,
        state,
        startTime,

        ...market
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
      tokens
    })
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
      <div className="animated fadeIn">
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader>
                <strong>DutchX Markets</strong>
              </CardHeader>
              <CardBody>
                <Form>
                  <FormGroup row>
                    <Col sm={6} className="py-2">
                      <InputGroup>
                        <InputGroupAddon addonType="prepend">Token</InputGroupAddon>
                        <Input
                          type="select"
                          value={this.state.token}
                          onChange={event => this.setState({ token: event.target.value })}
                          name="token"
                          id="token">
                          <option value=""></option>
                          {tokens.map(token => (
                            <option key={token} value={token}>{token}</option>
                          ))}
                        </Input>
                      </InputGroup>
                    </Col>

                    <Col sm={6} className="py-2">
                      <InputGroup>
                        <InputGroupAddon addonType="prepend">State</InputGroupAddon>
                        <Input
                          type="select"
                          value={this.state.state}
                          onChange={event => this.setState({ state: event.target.value })}
                          name="token"
                          id="token">
                          <option value=""></option>
                          {STATES.map(({ label, value }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </Input>
                      </InputGroup>
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
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
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
      const runningTime = now.getTime() - startTime.getTime()
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
            {sellVolume && this.renderAmontRow('Sell volume', sellVolume.toFixed(2), tokenA.symbol)}
            {buyVolume > 0 && this.renderAmontRow('Buy volume', buyVolume.toFixed(2), tokenB.symbol)}
            {buyVolume > 0 && this.renderAmontRow('Oustanding volume', buyVolume.toFixed(2), tokenB.symbol)}
          </ul>
        </td>
      </tr>
    )
  }

  renderEtherscanLink({ name, address }) {
    return (
      <a href={'https://etherscan.io/address/' + address} target="_blank" rel="noopener noreferrer">
        {name}
      </a>
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

  // renderAddressRow(label, address) {
  //   return address && (
  //     <li><strong>{label}</strong>:&nbsp;
  //     <Link to={'/accounts/' + address}>{address}</Link></li>
  //   )
  // }

  // renderRules(name, rules) {
  //   return rules && (
  //     <li>
  //       <strong>Rules</strong>:
  //       <ul>
  //         {rules.map(({ buyRatio, marketPriceRatio }, index) => (
  //           <li key={name + '-rules-' + index}>Buy&nbsp;
  //             <Badge color="success" pill>
  //               {Math.round(100 * buyRatio.numerator / buyRatio.denominator)}%
  //             </Badge>
  //             &nbsp;at price&nbsp;
  //             <Badge color="warning" pill>
  //               {Math.round(100 * marketPriceRatio.numerator / marketPriceRatio.denominator - 100)}%
  //             </Badge>
  //           </li>
  //         ))}
  //       </ul>
  //     </li>
  //   )
  // }
}


export default Web3HOC(MarketList)

