import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, ListGroup, ListGroupItem, Badge, FormGroup, Label, Input } from 'reactstrap';
import Blockies from 'react-blockies'
import getDxService from '../../../services/dxService'

const qrCodeUrl = 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&choe=UTF-8&chl='

class AccountDetails extends Component {
  state = {
    balances: [],
    hideTokensWithoutBalance: false
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
                    <a target="blank" href={'http://etherscan.io/address/' + address}>View in Etherscan.com</a>
                  </div>
                </div>



                <h2>Balances</h2>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={this.state.hideTokensWithoutBalance}
                      onChange={event => this.setState({ hideTokensWithoutBalance: event.target.checked })}
                    />{' '}
                    Hide tokens with no balance
                  </Label>
                </FormGroup>
                <ListGroup>
                  {balances.map(balance => this.renderTokenBalance(balance))}
                </ListGroup>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  renderTokenBalance({ symbol, name, address, decimals, balance, balanceErc20 }) {
    const hasBalance = (balance + balanceErc20) > 0
    const showTokenBalance = !this.state.hideTokensWithoutBalance || hasBalance

    return showTokenBalance && (
      <ListGroupItem style={{ backgroundColor: hasBalance ? '#ffeeee' : '#f9f9f9' }}
        key={'token-' + symbol}
        className={(hasBalance ? '' : 'secondary ') + 'justify-content-between'}>
        <Badge
          color="primary"
          className="p-2 mr-2"
          pill>
          {symbol}
        </Badge>
        &nbsp;{name}
        <ul>
          <li>DutchX: <Badge color={balance > 0 ? 'success' : 'secondary'} pill>{balance.toFixed(2)}</Badge></li>
          <li>ERC20: <Badge color={balanceErc20 > 0 ? 'warning' : 'secondary'} pill>{balanceErc20.toFixed(2)}</Badge></li>
        </ul>
      </ListGroupItem>
    )
  }
}

export default AccountDetails;
