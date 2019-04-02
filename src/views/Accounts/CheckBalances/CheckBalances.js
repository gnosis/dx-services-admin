import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Button, Form, FormGroup, Label, Input } from 'reactstrap';

import Web3HOC from '../../../HOCs/Web3HOC'

import { FIXED_DECIMALS } from '../../../globals'

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
    <div className="animated fadeIn">
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader>
              <strong>Check balances for account</strong>
            </CardHeader>
            <CardBody>
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
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Web3HOC(CheckBalances);
