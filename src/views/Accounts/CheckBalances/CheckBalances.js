import React, { useState } from 'react';
import { Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';

import Web3HOC from '../../../HOCs/Web3HOC'

import { FIXED_DECIMALS } from '../../../globals'
import PageWrapper from '../../../containers/PageWrapper';

function CheckBalances(props) {
  const [inputAcct, setInputAcct] = useState(null)
  const [accountBalance, setAccountBalance] = useState(null)

  const handleClick = async e => {
    e.preventDefault()
    const { web3 } = props

    try {
      setAccountBalance('CALCULATING...')

      const acctBalance = await web3.getCurrentBalance(inputAcct)

      setAccountBalance(Number(web3.utils.fromWei(acctBalance.toString())).toFixed(FIXED_DECIMALS))
    } catch (error) {
      console.error(error)
      setAccountBalance('INVALID ADDRESS')
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
            <strong>Address Balance: {accountBalance || '-'}</strong>
          </Col>
        </FormGroup>
        <FormGroup check row>
          <Col sm={{ size: 10, offset: 2 }}>
            <Button
              title="Enter public address to get ETH balance. Defaults to your current Web3 account address"
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

export default Web3HOC(CheckBalances);
