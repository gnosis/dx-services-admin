import React, { Component } from 'react';
import { Jumbotron, Container } from 'reactstrap';

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
      </div>
    )
  }
}

export default Dashboard;
