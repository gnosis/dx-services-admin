import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Jumbotron, Container } from 'reactstrap';

// import botsData, { ethereum, auctions, markets, git } from '../../../data/mock/bots'
// const { tokens } = auctions
class Dashboard extends Component {

  render() {
    return (
      <div className="animated fadeIn">
        <Jumbotron fluid>
          <Container fluid>
            <h1 className="display-3">DutchX services admin</h1>
            <p className="lead">
              Admin bots, services, and notifications.
            </p>
          </Container>
        </Jumbotron>

        {/* <Row>
          <Col lg={12}>
            <Card>
              <CardHeader>
                <strong>DutchX services admin</strong>
              </CardHeader>
              <CardBody>
              </CardBody>
            </Card>
          </Col>
        </Row> */}
      </div>
    )
  }
}

export default Dashboard;
