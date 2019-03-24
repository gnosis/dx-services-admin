import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Table, Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

class CheckBalances extends Component {

  render() {
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
                      <Input type="text" name="address" id="address" placeholder="0x0000000000000000000000000000000000000000" />
                    </Col>
                  </FormGroup>
                  <FormGroup check row>
                    <Col sm={{ size: 10, offset: 2 }}>
                      <Button>Check balances</Button>
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
}

export default CheckBalances;
