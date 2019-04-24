import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Col, Table, Badge, FormGroup, Form } from 'reactstrap';
import { PageWrapper, PageFilter } from '../../../containers'

import ErrorHOC from '../../../HOCs/ErrorHOC'
import Web3HOC from '../../../HOCs/Web3HOC'

import moment from 'moment'

import getBotMasters from '../../../utils/getBotMasters'
import getDxService from '../../../services/dxService'

class BotList extends Component {
  state = {
    // Filters
    botType: '',
    token: '',
    address: '',
    botName: '',

    // Data
    bots: [],
    botTypes: [],
    tokens: [],
    botAddress: [],

    // Web3
    network: 'UNKNOWN NETWORK',
  }

  async componentDidMount() {
    const network = await this.props.web3.getNetworkId()
    const dxService = await getDxService(network, this.props.web3)

    let bots = await dxService.getBots()
    const { botTypes, tokens, botAddress } = getBotMasters(bots)

    this.setState({
      bots,
      botTypes,
      tokens,
      botAddress,
      network,
    })
  }

  render() {
    const {
      // Data
      bots,
      botTypes,
      tokens,
      botAddress,

      // Filters
      botType,
      token,
      address,
      botName,
    } = this.state

    // Filter by type
    let filteredBots = bots
    if (botType) {
      filteredBots = filteredBots.filter(bot => bot.type && bot.type === botType)
    }

    // Filter by address
    if (address) {
      filteredBots = filteredBots.filter(bot => bot.botAddress && bot.botAddress === address)
    }

    // Filter by name
    if (botName) {
      const botNameLowerCase = botName.toLowerCase()
      filteredBots = filteredBots.filter(bot => bot.name && bot.name.toLowerCase().includes(botNameLowerCase))
    }

    // Filter by token
    if (token) {
      filteredBots = filteredBots.filter(({ markets, tokens }) => {
        if (!tokens && !markets) {
          return false
        }

        if (tokens && tokens.includes(token)) {
          return true
        }

        if (markets) {
          const marketContainsToken = markets.some(({ tokenA, tokenB }) => {
            return tokenA === token || tokenB === token
          })

          if (marketContainsToken) {
            return true
          }
        }

        return false
      })
    }

    return (
      <PageWrapper pageTitle="DutchX Bots">
        <Form>
          <FormGroup row>
            <Col lg={4} sm={6} className="py-2">
              <PageFilter 
                type="select"
                title="Bot Type"
                filterWhat={botTypes}
                showWhat={botType}
                changeFunction={event => this.setState({ botType: event.target.value })}
                inputName="botType"
              />
            </Col>

            <Col lg={4} sm={6} className="py-2">
              <PageFilter 
                type="select"
                title="Token"
                filterWhat={tokens}
                showWhat={token}
                changeFunction={event => this.setState({ token: event.target.value })}
                inputName="token"
              />
            </Col>

            <Col lg={4} sm={6} className="py-2">
              <PageFilter
                type="select"
                title="Address"
                filterWhat={botAddress}
                showWhat={address}
                changeFunction={event => this.setState({ address: event.target.value })}
                inputName="address"
              />
            </Col>

            <Col lg={12} sm={6} className="py-2">
              <PageFilter
                title="Bot Name"
                showWhat={botName}
                changeFunction={event => this.setState({ botName: event.target.value })}
                placeholder="Filter by bot name"
                inputName="token"
              />
            </Col>
          </FormGroup>
        </Form>

        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {filteredBots.map(bot => this.renderRow(bot))}
          </tbody>
        </Table>
      </PageWrapper>
    )
  }

  renderRow(bot) {
    const {
      id,
      type,
      name,
      startTime,
      botAddress,
      lastCheck,
      lastBuy,
      lastSell,
      lastError,
      markets,
      inactivityPeriods,
      rules,
      tokens,
      notifications,
      lastDeposit,
      checkTimeInMilliseconds,
      minimumAmountForEther,
      minimumAmountInUsdForToken,
      lastWarnNotification
    } = bot


    return (
      <tr key={`bot-${id}`}>
        <td><Badge color={colorByBotType(type)} pill>{type}</Badge></td>
        <td><strong>{name}</strong></td>
        <td>
          <ul>
            {this.renderTokens(name, tokens)}
            {this.renderRules(name, rules)}
            {this.renderMarkets(name, markets)}
            {this.renderInactivityPeriods(name, inactivityPeriods)}
            {this.renderAddressRow('Bot address', botAddress)}

            {this.renderDateRow('Last error', lastError, 'danger')}
            {this.renderDateRow('Last warning notification', lastWarnNotification)}
            {this.renderDateRow('Last check', lastCheck)}
            {this.renderDateRow('Last buy', lastBuy)}
            {this.renderDateRow('Last sell', lastSell)}
            {this.renderDateRow('Last deposit', lastDeposit)}
            {this.renderDateRow('Running since', startTime)}
            {this.renderAmontRow('Minimum amount for Ether', minimumAmountForEther && minimumAmountForEther / 10**18, 'Ether')}
            {this.renderAmontRow('Minimum USD amount for tokens', minimumAmountInUsdForToken, '$')}
            {this.renderNotifications(name, notifications)}
            {checkTimeInMilliseconds && this.renderAmontRow('Check frecuency', checkTimeInMilliseconds / 1000, 'seconds')}
          </ul>
        </td>
      </tr>
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

  renderMarkets(name, markets) {
    return markets && (
      <li>
        <strong>Markets</strong>:&nbsp;
        {markets.map(({ tokenA, tokenB }) => (
          <React.Fragment key={`${name}-market-${tokenA}-${tokenB}`}>
            <Badge color="primary" pill>
              {tokenA + '-' + tokenB}
            </Badge>
            &nbsp;
          </React.Fragment>
        ))}
      </li>
    )
  }

  renderTokens(name, tokens) {
    return tokens && (
      <li>
        <strong>Tokens</strong>:&nbsp;
        {tokens.map(token => (
          <React.Fragment key={`${name}-tokens-${token}`}>
            <Badge color="primary" pill>
              {token}
            </Badge>
            &nbsp;
          </React.Fragment>
        ))}
      </li>
    )
  }

  renderNotifications(name, notifications) {
    return notifications && (
      <li>
        <strong>Notifications</strong>:&nbsp;
        {notifications.map(({ type, channel }, index) => (
          <React.Fragment key={`${name}-notifications-${index}`}>
            <Badge color="secondary" pill>
              {type}
              {type === 'slack' && (
                ': ' + channel
              )}
            </Badge>
            &nbsp;
          </React.Fragment>
        ))}
      </li>
    )
  }

  renderInactivityPeriods(name, inactivityPeriods) {
    return inactivityPeriods && (
      <li>
        <strong>Inactivity periods</strong>:&nbsp;
        {inactivityPeriods.map(({ from, to }, index) => (
          <React.Fragment key={`${name}-inactivities-${index}`}>
            <Badge color="secondary" pill>
              {from + '-' + to}
            </Badge>
            &nbsp;

          </React.Fragment>
        ))}
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

  renderAddressRow(label, address) {
    return address && (
      <li><strong>{label}</strong>:&nbsp;
      <Link to={'/accounts/' + address}>{address}</Link></li>
    )
  }

  renderRules(name, rules) {
    return rules && (
      <li>
        <strong>Rules</strong>:
        <ul>
          {rules.map(({ buyRatio, marketPriceRatio }, index) => (
            <li key={name + '-rules-' + index}>Buy&nbsp;
              <Badge color="success" pill>
                {Math.round(100 * buyRatio.numerator / buyRatio.denominator)}%
              </Badge>
              &nbsp;at price&nbsp;
              <Badge color="warning" pill>
                {Math.round(100 * marketPriceRatio.numerator / marketPriceRatio.denominator - 100)}%
              </Badge>
            </li>
          ))}
        </ul>
      </li>
    )
  }
}

function colorByBotType(botType) {
  switch (botType) {
    case 'BuyLiquidityBot':
      return 'warning'
    case 'SellLiquidityBot':
      return 'success'
    case 'DepositBot':
      return 'warning'
    case 'HiSellVolumeBot':
      return 'info'
    case 'BalanceCheckBot':
      return 'primary'
    default:
      return 'secondary'
  }
}

export default ErrorHOC(Web3HOC(BotList))
