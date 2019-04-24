import React, { Component } from 'react';
import { Col, Container, Row } from 'reactstrap';

class Page500 extends Component {
  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">
              <span className="clearfix">
                <h1 className="float-left display-3 mr-4">500</h1>
                <h2 className="pt-3">Berlin, we have a problem!</h2>
                <p className="text-muted float-left">The page you are looking for is temporarily unavailable. Quick, slack David! (or Dima, he loves bugs). Or, try refreshing :)</p>
              </span>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Page500;
