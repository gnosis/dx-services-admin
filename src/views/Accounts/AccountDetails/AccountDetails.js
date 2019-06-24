import React, { useState, useEffect } from 'react';
import { ListGroup, ListGroupItem, Badge, FormGroup, Label, Input } from 'reactstrap';
import Blockies from 'react-blockies'

import ErrorHOC from '../../../HOCs/ErrorHOC'
import Web3HOC from '../../../HOCs/Web3HOC'

import PageWrapper from '../../../containers/PageWrapper';
import Loading from '../../Loading'
import ErrorPre from '../../Error'

import getDxService from '../../../services/dxService'

import { MGN_PROXY_ADDRESSES, OWL_PROXY_ADDRESSES, DUTCHX_PROXY_ADDRESSES, FIXED_DECIMALS, OWL_ALLOWANCE_THRESHOLD } from '../../../globals'

import { from } from 'rxjs'

const qrCodeUrl = 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&choe=UTF-8&chl='

function AccountDetails({
  match,
  web3,
}) {
  const [state, setState] = useState({
    // Token Balances and hide
    balances: [],
    hideTokensWithoutBalance: true,
    // LC, MGN, OWL
    liquidityContribution: undefined,
    mgnLockedBalance: undefined,
    mgnUnlockedBalance: undefined,
    owlBalance: undefined,

    // WEb3
    network: 'UNKNOWN NETWORK',
    ethBalance: undefined,

    // App
    error: undefined,
    loading: false,
  })

  // componentDidMount
  useEffect(() => {    
    setState(prevState => ({ ...prevState, loading: true }))

    async function mountLogic(){
      try {
        const network = await web3.getNetworkId()
        const dxService = await getDxService(network, web3)

        const account = match.params.address

        // LC, MGN, OWL
        const [
          liquidityContribution,
          { amountUnlocked: mgnUnlockedBalance },
          mgnLockedBalance,
          owlBalance,
          owlAllowance,
          ethBalance,
        ] = await Promise.all([
          dxService.getLiquidityContribution(account),
          web3.getToken(MGN_PROXY_ADDRESSES[network], 'MGN', account).then(token => token.methods.unlockedTokens(account).call()).catch(() => false),
          web3.getToken(MGN_PROXY_ADDRESSES[network], 'MGN', account).then(token => token.methods.lockedTokenBalances(account).call()).catch(() => false),
          web3.getToken(OWL_PROXY_ADDRESSES[network], 'OWL', account).then(token => token.methods.balanceOf(account).call()).catch(() => false),
          web3.getToken(OWL_PROXY_ADDRESSES[network], 'OWL', account).then(token => token.methods.allowance(account, DUTCHX_PROXY_ADDRESSES[network]).call()).catch(() => false),
          web3.getCurrentBalance(account),
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
        const balances = await Promise.all(balancePromises)

        return {
          balances,
          liquidityContribution,
          mgnLockedBalance,
          mgnUnlockedBalance,
          owlAllowance,
          owlBalance,
          network,
          ethBalance,
          loading: false,
        }
      } catch(err) {
        console.error(err)
        throw new Error(err)
      }
    }
    const accountDetailsSubscription = from(mountLogic())
    .subscribe({
      next: ({
        balances,
        liquidityContribution,
        mgnLockedBalance,
        mgnUnlockedBalance,
        owlAllowance,
        owlBalance,
        network,
        ethBalance,
      }) => setState(prevState => ({
        ...prevState,
        balances,
        liquidityContribution,
        mgnLockedBalance,
        mgnUnlockedBalance,
        owlAllowance,
        owlBalance,
        network,
        ethBalance,
        loading: false,
      })),
      error: (loadError) => {
        console.error(loadError)
        return setState(prevState => ({
          ...prevState,
          error: loadError,
          loading: false,
        }))
      }
    })

    return () => {
      accountDetailsSubscription && accountDetailsSubscription.unsubscribe()
    }
  }, [])

  const {
    balances,
    hideTokensWithoutBalance,
    liquidityContribution,
    network,
    mgnLockedBalance,
    mgnUnlockedBalance,
    owlBalance,
    owlAllowance,
    ethBalance,

    // App
    error,
    loading,
  } = state

  if (!balances) {
    return null
  }

  const owlAllowanceEnabled = Number(owlAllowance) >= (OWL_ALLOWANCE_THRESHOLD * (10**18))

  const address = match.params.address

  if (error) return <ErrorPre error={error} />
  // Data Loading
  if (loading) return <Loading />

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

      <h2>Ether Balance</h2>
      <ListGroup>
        {/* Liq. Contr. */}
        {liquidityContribution &&
          <ListGroupItem style={{ backgroundColor: '#eef8ff' }}>
            <Badge
              color="primary"
              className="p-2 mr-2"
              pill>
              ETH
          </Badge>
            <strong>{ethBalance && Number(ethBalance / 10 ** 18).toFixed(FIXED_DECIMALS)}</strong>
          </ListGroupItem>}
      </ListGroup>
      <br />
      <h2>L.C, MGN, OWL</h2>
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
              <li>Locked Balance: <Badge color={mgnLockedBalance > 0 ? 'success' : 'secondary'} pill>{Number(mgnLockedBalance / (10 ** 18)).toFixed(FIXED_DECIMALS)}</Badge></li>
              <li>Unlocked Balance: <Badge color={mgnUnlockedBalance > 0 ? 'warning' : 'secondary'} pill>{Number(mgnUnlockedBalance / (10 ** 18)).toFixed(FIXED_DECIMALS)}</Badge></li>
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
              {/* <li>DutchX: <Badge color={owlBalance > 0 ? 'success' : 'secondary'} pill>{Number(balance / (10 ** decimals)).toFixed(FIXED_DECIMALS)}</Badge></li> */}
              {!owlAllowanceEnabled && <li>Allowance: <Badge color='warning' pill>{Number(owlAllowance / (10 ** 18)).toFixed(FIXED_DECIMALS)}</Badge></li>}
              <li>Balance: <Badge color={owlBalance > 0 ? 'warning' : 'secondary'} pill>{Number(owlBalance / (10 ** 18)).toFixed(FIXED_DECIMALS)}</Badge>{owlAllowanceEnabled && <Badge color='success' pill>ENABLED</Badge>}</li>
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
            onChange={event => setState(prevState => ({ ...prevState, hideTokensWithoutBalance: event.target.checked }))}
          />{' '}
          Hide tokens with no balance
        </Label>
      </FormGroup>
      {/* TOKEN STATS */}
      <ListGroup>
        {balances.map(balance => renderTokenBalance(balance))}
      </ListGroup>
    </PageWrapper>
  )

  function renderTokenBalance({ symbol, name, address, decimals, balance, balanceErc20 }, color = '#ffeeee') {
    const hasBalance = (balance + balanceErc20) > 0
    const showTokenBalance = !state.hideTokensWithoutBalance || hasBalance

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
          <li>DutchX: <Badge color={balance > 0 ? 'success' : 'secondary'} pill>{Number(balance / (10 ** decimals)).toFixed(FIXED_DECIMALS)}</Badge></li>
          <li>ERC20: <Badge color={balanceErc20 > 0 ? 'warning' : 'secondary'} pill>{Number(balanceErc20 / (10 ** decimals)).toFixed(FIXED_DECIMALS)}</Badge></li>
        </ul>
      </ListGroupItem>
    )
  }
}

export default ErrorHOC(Web3HOC(AccountDetails))
