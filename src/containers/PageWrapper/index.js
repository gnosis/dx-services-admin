import React from 'react'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
import AttentionBanner from '../../components/AttentionBanner'

const disclaimerParagraph = {
    whiteSpace: 'normal',
    textAlign: 'left',
    margin: '20px',
}

const PageWrapper = ({ children, render, pageTitle = 'Page Title', colSize = { lg: "12" }, ...rest }) =>
    <div className="animated fadeIn">
        <Row>
            <Col {...colSize}>
                <AttentionBanner 
                    title=''
                    subText={() => 
                        <div>
                            <p style={disclaimerParagraph}>
                                VisualX is provided for information purposes only and reads data from the DutchX trading protocol on the Ethereum Blockchain (see version at the bottom). 
                                We have no control over the transactions executed, attempted to be executed or erroneously executed via the DutchX trading protocol, which is permissionless. 
                                We do not give any guarantee that any displayed information is accurate. No assessment or selection is conducted as to the display of the executed, falsely executed or attempted transactions on the DutchX trading protocol. 
                                It is possible that VisualX displays tokens or features that are not compatible with the DutchX trading protocol, because transactions or listings have been made in error. 
                                Accordingly, it is not advised to rely on the data displayed on VisualX to assess the compatibility of an intended transactions with the DutchX trading protocol. 
                                We do not accept any liability to you or anyone else for any losses of any nature resulting from any transactions made or action taken in reliance on the information contained on VisualX. 
                                All and any such responsibility is expressly disclaimed.
                            </p>
                            <p style={disclaimerParagraph}>
                                The DutchX was developed by Gnosis Limited as infrastructure of the Ethereum Blockchain. It is upgradeable and those powers are retained by the dxDAO (dxDAO.daostack.io). 
                                Gnosis Limited is not part of the dxDAO and retains absolutely no miscellaneous powers over or to affect the DutchX.
                            </p>
                        </div>
                    }
                    customStyle={{
                        backgroundColor: '#fff',
                    }}
                />
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

export default PageWrapper
