import React, { useState } from 'react';
import { Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';

import ErrorHOC from '../../../HOCs/ErrorHOC'
import Web3HOC from '../../../HOCs/Web3HOC'
import PageWrapper from '../../../containers/PageWrapper';

// import { FIXED_DECIMALS } from '../../../globals'

function CheckBalances(props) {
  const [inputAcct, setInputAcct] = useState(null)
  // const [accountBalance, setAccountBalance] = useState(null)

  const handleClick = async e => {
    e.preventDefault()
    const { web3 } = props

    try {
      const acct = inputAcct || await web3.getCurrentAccount()
      // setAccountBalance('CALCULATING...')
      // const acctBalance = await web3.getCurrentBalance(inputAcct)
      // setAccountBalance(Number(web3.utils.fromWei(acctBalance.toString())).toFixed(FIXED_DECIMALS))
      const { host } = window.location
      window.location.replace(`${host.includes('localhost') ? 'http' : 'https'}://${host}/#/accounts/${acct}`)
    } catch (error) {
      console.error(error)
      // setAccountBalance('Invalid address passed, try again')
    }
  }

  const handleInputChange = async ({ target }) => setInputAcct(target.value)

  return (
    <PageWrapper pageTitle="Check Balances">
      <Form>
        <FormGroup row>
          <Label for="address" sm={2}>Ethereum address</Label>
          <Col sm={10}>
            <Input
              type="text"
              name="address"
              id="address"
              placeholder="0x0000000000000000000000000000000000000000"
              onChange={handleInputChange}
            />
            <strong>** clicking <i>Check balances</i> with no address defaults to your current Ethereum address</strong>
          </Col>
        </FormGroup>
        <FormGroup check row>
          <Col sm={{ size: 10, offset: 2 }}>
            <Button
              title="Enter public address to get various balances. Defaults to your current Web3 account address"
              onClick={handleClick}
            >
              Check balances
              </Button>
          </Col>
        </FormGroup>
      </Form>
    </PageWrapper>
  )
}

export default ErrorHOC(Web3HOC(CheckBalances))
