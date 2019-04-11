import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Badge, FormGroup, Label, Input } from 'reactstrap';
import Blockies from 'react-blockies'

import Web3HOC from '../../../HOCs/Web3HOC'

import getDxService from '../../../services/dxService'

import { MGN_PROXY_ADDRESSES, OWL_PROXY_ADDRESSES } from '../../../globals'
import PageWrapper from '../../../containers/PageWrapper';

const qrCodeUrl = 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&choe=UTF-8&chl='

class AccountDetails extends Component {
  state = {
    // Token Balances and hide
    balances: [],
    hideTokensWithoutBalance: false,
    // LC, MGN, OWL
    liquidityContribution: undefined,
    mgnLockedBalance: undefined,
    mgnUnlockedBalance: undefined,
    owlBalance: undefined,

    // WEb3
    network: 'UNKNOWN NETWORK',
  }

  async componentDidMount() {
    const { web3 } = this.props

    const network = await web3.getNetworkId()
    const dxService = await getDxService(network, web3)

    const account = this.props.match.params.address

    // LC, MGN, OWL
    const [
      liquidityContribution,
      { amountUnlocked: mgnUnlockedBalance },
      mgnLockedBalance,
      owlBalance,
    ] = await Promise.all([
      dxService.getLiquidityContribution(account),
      web3.getToken(MGN_PROXY_ADDRESSES[network], 'MGN', account).then(token => token.methods.unlockedTokens(account).call()),
      web3.getToken(MGN_PROXY_ADDRESSES[network], 'MGN', account).then(token => token.methods.lockedTokenBalances(account).call()),
      web3.getToken(OWL_PROXY_ADDRESSES[network], 'OWL', account).then(token => token.methods.balanceOf(account).call()),
    ])

    // Get tokenBalances
    let tokens = await dxService.getTokens()
    const balancePromises = tokens.map(async token => {
      const balance = await dxService.getTokenBalanceDx({
        account,
        token,
      })

      const balanceErc20 = await dxService.getTokenBalanceErc20({
        account,
        tokenAddress: token.address
      })

      return {
        balance,
        balanceErc20,
        ...token
      }
    })

    this.setState({
      balances: await Promise.all(balancePromises),
      liquidityContribution,
      mgnLockedBalance,
      mgnUnlockedBalance,
      owlBalance,
      network,
    })
  }

  render() {
    const {
      balances,
      hideTokensWithoutBalance,
      liquidityContribution,
      network,
      mgnLockedBalance,
      mgnUnlockedBalance,
      owlBalance,
    } = this.state

    if (!balances) {
      return null
    }

    const address = this.props.match.params.address
    return (
      <PageWrapper colSize={{ xs: "12" }} pageTitle="Account Information">
        <div className="d-flex flex-row bd-highlight mb-3">
          <div className="p-2 bd-highlight">
            <Blockies
              seed="Jeremy"
              size={11}
              scale={7}
              color="#a05800"
              bgColor="#003da0"
              spotColor="#abc"
              className="border m-3"
            />
          </div>
          <div className="p-2 bd-highlight">
            <img className="mt-1" src={qrCodeUrl + address} width="100" height="100" alt="QR Code" />
          </div>
          <div className="p-2 bd-highlight">
            <h3 className="mt-2"><small>{address}</small></h3>
            {/* eslint-disable-next-line eqeqeq */}
            <a href={`https://${network == '4' ? 'rinkeby.etherscan' : 'etherscan'}.io/address/${address}`} target="_blank" rel="noopener noreferrer">View on Etherscan</a>
          </div>
        </div>

        <h2>LC, MGN, OWL</h2>
        <ListGroup>

          {/* Liq. Contr. */}
          {liquidityContribution &&
          <ListGroupItem style={{ backgroundColor: '#eef8ff' }}>
            <Badge
              color="primary"
              className="p-2 mr-2"
              pill>
              L.C
            </Badge>
            <strong>{typeof liquidityContribution !== 'undefined' && (`${liquidityContribution * 100}%`)}</strong>
          </ListGroupItem>}

          {/* MGN */}
          {mgnLockedBalance &&
          <ListGroupItem style={{ backgroundColor: '#eef8ff' }}
            className='justify-content-between'>
            <Badge
              color="primary"
              className="p-2 mr-2"
              pill>
              MGN
            </Badge>
            &nbsp;<strong>Magnolia Token</strong>
            <ul>
              <li>Locked Balance: <Badge color={mgnLockedBalance > 0 ? 'success' : 'secondary'} pill>{Number(mgnLockedBalance / (10 ** 18)).toFixed(2)}</Badge></li>
              <li>Unlocked Balance: <Badge color={mgnUnlockedBalance > 0 ? 'warning' : 'secondary'} pill>{Number(mgnUnlockedBalance / (10 ** 18)).toFixed(2)}</Badge></li>
            </ul>
          </ListGroupItem>}

          {/* OWL */}
          {owlBalance &&
          <ListGroupItem style={{ backgroundColor: '#eef8ff' }}
            className='justify-content-between'>
            <Badge
              color="primary"
              className="p-2 mr-2"
              pill>
              OWL
            </Badge>
            &nbsp;<strong>OWL Token</strong>
            <ul>
              {/* <li>DutchX: <Badge color={owlBalance > 0 ? 'success' : 'secondary'} pill>{Number(balance / (10 ** decimals)).toFixed(2)}</Badge></li> */}
              <li>ERC20: <Badge color={owlBalance > 0 ? 'warning' : 'secondary'} pill>{Number(owlBalance / (10 ** 18)).toFixed(2)}</Badge></li>
            </ul>
          </ListGroupItem>}
        </ListGroup>
        <br />
        <h2>Balances</h2>
        <FormGroup check>
          <Label check>
            <Input
              type="checkbox"
              checked={hideTokensWithoutBalance}
              onChange={event => this.setState({ hideTokensWithoutBalance: event.target.checked })}
            />{' '}
            Hide tokens with no balance
          </Label>
        </FormGroup>
        {/* TOKEN STATS */}
        <ListGroup>
          {balances.map(balance => this.renderTokenBalance(balance))}
        </ListGroup>
      </PageWrapper>
    )
  }

  renderTokenBalance({ symbol, name, address, decimals, balance, balanceErc20 }, color = '#ffeeee') {
    const hasBalance = (balance + balanceErc20) > 0
    const showTokenBalance = !this.state.hideTokensWithoutBalance || hasBalance

    return showTokenBalance && (
      <ListGroupItem style={{ backgroundColor: hasBalance ? color : '#f9f9f9' }}
        key={'token-' + symbol}
        className={(hasBalance ? '' : 'secondary ') + 'justify-content-between'}>
        <Badge
          color="primary"
          className="p-2 mr-2"
          pill>
          {symbol}
        </Badge>
        &nbsp;<strong>{name}</strong>
        <ul>
          <li>DutchX: <Badge color={balance > 0 ? 'success' : 'secondary'} pill>{Number(balance / (10 ** decimals)).toFixed(2)}</Badge></li>
          <li>ERC20: <Badge color={balanceErc20 > 0 ? 'warning' : 'secondary'} pill>{Number(balanceErc20 / (10 ** decimals)).toFixed(2)}</Badge></li>
        </ul>
      </ListGroupItem>
    )
  }
}

export default Web3HOC(AccountDetails);
