import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Col, Table, Badge, FormGroup, Form } from 'reactstrap';
import { PageWrapper, PageFilter } from '../../../containers'

import ErrorHOC from '../../../HOCs/ErrorHOC'
import Web3HOC from '../../../HOCs/Web3HOC'

import Loading from '../../Loading'
import ErrorPre from '../../Error'

import moment from 'moment'

import getBotMasters from '../../../utils/getBotMasters'
import getDxService from '../../../services/dxService'

import { from } from 'rxjs'

function BotList({
  web3,
}) {
  const [state, setState] = useState({
    // Data
    bots: [],
    tokens: [],
    botTypes: [],
    botAddress: [],

    // Web3
    network: 'UNKNOWN NETWORK',
  })
  // FILTERS
  const [token, setToken] = useState('')
  const [botType, setBotType] = useState('')
  const [address, setAddress] = useState('')
  const [botName, setBotName] = useState('')

  // APP
  const [error, setError] = useState(undefined)
  const [loading, setLoading] = useState(false)

  // ComponentDidMount
  useEffect(() => {
    async function asyncMountLogic() {
      try {
        const network = await web3.getNetworkId()
        const dxService = await getDxService(network, web3)
        
        let bots = await dxService.getBots()
        const { botTypes, tokens, botAddress } = getBotMasters(bots)
    
        return {
          bots,
          botTypes,
          tokens,
          botAddress,
          network,
        }
      } catch (err) {
        console.error(err)
        throw new Error(err)
      }
    }

    setLoading(true)

    const botsListSubscription = from(asyncMountLogic())
    .subscribe({
      next: ({
        bots,
        botTypes,
        tokens,
        botAddress,
        network,
      }) => setState({
        bots,
        botTypes,
        tokens,
        botAddress,
        network,
      }),
      error: appError => {
        setError(appError)
        setLoading(false)
      },
      complete: () => setLoading(false)
    })

    return () => {
      botsListSubscription && botsListSubscription.unsubscribe()
    }
  }, [])

  const renderRow = ({
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
    minimumAmountInUsdForTokenBalance,
    minimumAmountForOwl,
    lastWarnNotification,
  }) =>
    <tr key={`bot-${id}`}>
      <td><Badge color={colorByBotType(type)} pill>{type}</Badge></td>
      <td><strong>{name}</strong></td>
      <td>
        <ul>
          {renderTokens(name, tokens)}
          {renderRules(name, rules)}
          {renderMarkets(name, markets)}
          {renderAddressRow('Bot address', botAddress)}
          {renderInactivityPeriods(name, inactivityPeriods)}

          {renderAmountRow('Minimum Ether', minimumAmountForEther / 10 ** 18, 'Ether')}
          {renderAmountRow('Minimum tokens (in DutchX)', minimumAmountInUsdForToken, '$')}
          {renderAmountRow('Minimum token (out of DutchX)', minimumAmountInUsdForTokenBalance, '$')}
          {renderAmountRow('Minimum OWL', minimumAmountForOwl, 'OWL')}

          {renderDateRow('Last error', lastError, 'danger')}
          {renderDateRow('Last warning notification', lastWarnNotification)}
          {renderDateRow('Last check', lastCheck)}
          {renderDateRow('Last buy', lastBuy)}
          {renderDateRow('Last sell', lastSell)}
          {renderDateRow('Last deposit', lastDeposit)}
          {renderDateRow('Running since', startTime)}
          {renderNotifications(name, notifications)}
          {checkTimeInMilliseconds && renderAmountRow('Check frequency', checkTimeInMilliseconds / 1000, 'seconds')}
        </ul>
      </td>
    </tr>

  const renderDateRow = (label, time, badgeColor) => 
    time &&
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

  /**
   * @name renderMarkets
   * @param { String } name
   * @param { Array } markets

   * @memberof BotList
   */
  const renderMarkets = (name, markets) =>
    markets && !!markets.length &&
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

  /**
   * @name renderTokens
   * @param { string } name
   * @param { Array } tokens

   * @memberof BotList
   */
  const renderTokens = (name, tokens) =>
    tokens && !!tokens.length &&
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

  /**
   * @name renderNotifications
   * @param { string } name
   * @param { Array } notifications
   
   * @memberof BotList
   */
  const renderNotifications = (name, notifications) =>
    notifications && !!notifications.length &&
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

  /** 
   * @name renderInactivityPeriods
   * @param { string } name
   * @param { Array } inactivityPeriods
   
   * @memberof BotList
   */
  const renderInactivityPeriods = (name, inactivityPeriods) =>
    inactivityPeriods && !!inactivityPeriods.length &&
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

  /**
   * @name renderAmountRow
   * @param { string } label
   * @param { number } amount
   * @param { string } currency

   * @memberof BotList
   */
  const renderAmountRow = (label, amount, currency) =>
    !!Number(amount) &&
      <li>
        <strong>{label}</strong>:&nbsp;{amount + ' ' + currency}
      </li>

  const renderAddressRow = (label, address) =>
    address &&
      <li>
        <strong>{label}</strong>: <Link to={'/accounts/' + address}>{address}</Link>
      </li>

  /**
   * @name renderRules
   * @param { string } name
   * @param { Array } rules
   
   * @memberof BotList
   */
  const renderRules = (name, rules) =>
    rules && !!rules.length &&
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

  const {
    // Data
    bots,
    botTypes,
    tokens,
    botAddress,
  } = state

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
  if (error) return <ErrorPre error={error} />
  // Data Loading
  if (loading) return <Loading />

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
              changeFunction={event => setBotType(event.target.value)}
              inputName="botType"
            />
          </Col>

          <Col lg={4} sm={6} className="py-2">
            <PageFilter
              type="select"
              title="Token"
              filterWhat={tokens}
              showWhat={token}
              changeFunction={event => setToken(event.target.value)}
              inputName="token"
            />
          </Col>

          <Col lg={4} sm={6} className="py-2">
            <PageFilter
              type="select"
              title="Address"
              filterWhat={botAddress}
              showWhat={address}
              changeFunction={event => setAddress(event.target.value)}
              inputName="address"
            />
          </Col>

          <Col lg={12} sm={6} className="py-2">
            <PageFilter
              title="Bot Name"
              showWhat={botName}
              changeFunction={event => setBotName(event.target.value)}
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
          {filteredBots.map(bot => renderRow(bot))}
        </tbody>
      </Table>
    </PageWrapper>
  )
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
