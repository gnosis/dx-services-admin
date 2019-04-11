import React from 'react'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'

function PageWrapper({ children, render, pageTitle = 'Page Title', colSize = { lg: "12" }, ...rest }) {
    return (
        <div className="animated fadeIn">
            <Row>
                <Col {...colSize}>
                    <Card>
                        <CardHeader>
                        <strong>{pageTitle}</strong>
                        </CardHeader>
                        <CardBody>
                            {render || children}
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default PageWrapper
