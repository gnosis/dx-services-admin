import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, ListGroup, ListGroupItem, Badge, Media } from 'reactstrap';
import Blockies from 'react-blockies'
import getDxService from '../../../services/dxService'

const qrCodeUrl = 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&choe=UTF-8&chl='

class AccountDetails extends Component {
  state = {
    balances: []
  }

  async componentDidMount() {
    const dxService = await getDxService()
    let tokens = dxService.getTokens()

    const account = this.props.match.params.address
    const balancePromises = tokens.map(async token => {
      const balance = await dxService.getTokenBalanceDx({
        account,
        tokenAddress: token.address
      })

      const balanceErc20 = await dxService.getTokenBalanceErc20({
        account,
        tokenAddress: token.address
      })

      // TODO: Get ERC20 token balance

      return {
        balance,
        balanceErc20,
        ...token
      }
    })


    this.setState({
      balances: await Promise.all(balancePromises)
    })
  }

  render() {
    const { balances } = this.state
    if (!balances) {
      return null
    }

    const address = this.props.match.params.address
    return (
      <div className="animated fadeIn">
        <Row>

          <Col xs="12">
            <Card>
              <CardHeader>
                <strong>Account information</strong>
              </CardHeader>
              <CardBody>
                <div class="d-flex flex-row bd-highlight mb-3">
                  <div class="p-2 bd-highlight">
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
                  <div class="p-2 bd-highlight">
                    <img className="mt-1" src={qrCodeUrl + address} width="100" height="100" alt="QR Code" />
                  </div>
                  <div class="p-2 bd-highlight">
                    <h3 className="mt-2"><small>{address}</small></h3>
                    <a target="blank" href={'http://etherscan.io/address/' + address}>View in Etherscan.com</a>
                  </div>
                </div>



                <h2>Balances</h2>
                <Badge color="success" className="my-4 m-1 ml-3" pill>Balance in DutchX</Badge>
                <Badge color="warning" className="my-4 m-1" pill>Balance of user (out of DutchX)</Badge>

                <ListGroup>
                  {balances.map(({ symbol, name, address, decimals, balance, balanceErc20 }) => (
                    <ListGroupItem className="justify-content-between">
                      {symbol}&nbsp;
                      <Badge color="success" pill>{balance.toFixed(2)}</Badge>&nbsp;
                      <Badge color="warning" pill>{balanceErc20.toFixed(2)}</Badge>
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default AccountDetails;
