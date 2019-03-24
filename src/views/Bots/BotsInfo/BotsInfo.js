import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Table } from 'reactstrap';

import getDxService from '../../../services/dxService'

class BotsInfo extends Component {
  state = {
    about: null
  }

  async componentDidMount() {
    const dxService = await getDxService()
    const about = await dxService.getAbout()
    this.setState({ about })
  }

  render() {
    const { about } = this.state
    if (!about) {
      return null
    }

    const { ethereum, auctions, markets, git } = about
    const { tokens } = auctions

    return (
      <div className="animated fadeIn">
        <Row>
          <Col lg={6}>
            <Card>
              <CardHeader>
                <strong>DutchX info</strong>
              </CardHeader>
              <CardBody>
                <Table responsive borderless hover>
                  <tbody>
                    <tr>
                      <th scope="row">Version</th>
                      <td>{about.version}</td>
                    </tr>
                    <tr>
                      <th scope="row">Environment</th>
                      <td>{about.environment}</td>
                    </tr>
                    <tr>
                      <th scope="row">Ethereum node</th>
                      <td>{ethereum.node}</td>
                    </tr>
                    <tr>
                      <th scope="row">Ethereum network</th>
                      <td>{ethereum.network}</td>
                    </tr>
                    <tr>
                      <th scope="row">Ethereum version</th>
                      <td>{ethereum.ethereumVersion}</td>
                    </tr>
                    {/* {
                      userDetails.map(([key, value]) => {
                        return (
                          <tr key={key}>
                            <td>{`${key}:`}</td>
                            <td><strong>{value}</strong></td>
                          </tr>
                        )
                      })
                    } */}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>

          <Col lg={6}>
            <Card>
              <CardHeader>
                <strong>DutchX config</strong>
              </CardHeader>
              <CardBody>
                <Table responsive borderless hover>
                  <tbody>
                    <tr>
                      <th scope="row">Auctioneer</th>
                      <td>{auctions.auctioneer}</td>
                    </tr>
                    <tr>
                      <th scope="row">DutchX address (proxy)</th>
                      <td>{auctions.dxAddress}</td>
                    </tr>
                    <tr>
                      <th scope="row">DutchX Price Oracle address</th>
                      <td>{auctions.priceOracleAddress}</td>
                    </tr>
                    {/* {
                      userDetails.map(([key, value]) => {
                        return (
                          <tr key={key}>
                            <td>{`${key}:`}</td>
                            <td><strong>{value}</strong></td>
                          </tr>
                        )
                      })
                    } */}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>


          <Col lg={6}>
            <Card>
              <CardHeader>
                <strong>Tokens config</strong>
              </CardHeader>
              <CardBody>
                <Table responsive borderless hover>
                  <tbody>
                    {
                      tokens.map(({ name, address }) => {
                        return (
                          <tr key={address}>
                            <th scope="row">{name}</th>
                            <td>{address}</td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>

          <Col lg={6}>
            <Card>
              <CardHeader>
                <strong>Markets</strong>
              </CardHeader>
              <CardBody>
                {
                  markets.map(({ tokenA, tokenB }) => {
                    const market = tokenA + '-' + tokenB
                    return (
                      <ul key={market}>
                        <li>{market}</li>
                      </ul>
                    )
                  })
                }
              </CardBody>
            </Card>
          </Col>

          <Col lg={6}>
            <Card>
              <CardHeader>
                <strong>Git info</strong>
              </CardHeader>
              <CardBody>
                <Table responsive borderless hover>
                  <tbody>
                    <tr>
                      <th scope="row">Git Short</th>
                      <td>{git.short}</td>
                    </tr>
                    <tr>
                      <th scope="row">Git Long</th>
                      <td>{git.long}</td>
                    </tr>
                    <tr>
                      <th scope="row">Git tag</th>
                      <td>{git.tag}</td>
                    </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default BotsInfo;
