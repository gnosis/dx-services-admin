import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { Col, Table, Badge, FormGroup, Form } from 'reactstrap'
import { PageFilter, PageWrapper } from '../../containers'

import ErrorHOC from '../../HOCs/ErrorHOC'
import Web3HOC from '../../HOCs/Web3HOC'

import getDxService from '../../services/dxService'

const SAFE_TYPES = [
    'seller',
    'complete',   
]

function Safes({ web3 }) {
    const [safeData, setSafeData] = useState([])
    const [safeNameFilter, setSafeNameFilter] = useState('')
    const [safeTypeFilter, setSafeTypeFilter] = useState('')
    const [network, setNetwork] = useState('UNKNOWN NETWORK')

    // mount logic
    // 1. load endpoint Safes data
    // 2. set to state
    useEffect(() => {
        // load data
        async function getSafeData(time = 3000) {
            try {
                const network = await web3.getNetworkId()
                const dxService = await getDxService(network, web3)

                const safeData = await dxService.getSafeModules()
                
                setNetwork(network)
                return setSafeData(safeData)
            } catch(error) {
                const err = new Error(error.message)
                console.error(err)
            }
        }
        getSafeData()
    }, [])

    // eslint-disable-next-line eqeqeq
    const renderEtherscanLink = address => <a href={`https://${network == '4' ? 'rinkeby.etherscan' : 'etherscan'}.io/address/${address}`} target="_blank" rel="noopener noreferrer">{address}</a>
    
    const renderAccountLink = address => address && <Link to={'/accounts/' + address}>{address}</Link>

    return (
        <PageWrapper pageTitle="DutchX Safes">
            <Form>
                <FormGroup row>
                    {/* Filter SafeModule Name */}
                    <Col sm={6} className="py-2">
                        <PageFilter
                            type="select"
                            title="Safe"
                            showWhat={safeNameFilter}
                            changeFunction={event => setSafeNameFilter(event.target.value)}
                            inputName="safe"
                            render={safeData.map(({ name, safeAddress }) => <option key={safeAddress} value={name}>{name}</option>)}
                        />
                    </Col>
                    {/* Filter SafeModule Type */}
                    <Col sm={6} className="py-2">
                        <PageFilter
                            type="select"
                            title="Type"
                            showWhat={safeTypeFilter}
                            changeFunction={event => setSafeTypeFilter(event.target.value)}
                            inputName="safe"
                            render={SAFE_TYPES.map((type, index) => <option key={index} value={type}>{type}</option>)}
                        />
                    </Col>
                </FormGroup>
            </Form>

            <Table responsive hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        {/* <th>Markets</th>
                        <th>Safe Address</th> */}
                        <th>Type</th>
                        <th>Info</th>
                    </tr>
                </thead>
                <tbody>
                    {safeData
                        // Sort by operatorAddressIndex greatest to least
                        .sort((a, b) => b.operatorAddressIndex - a.operatorAddressIndex)
                        // filter out TYPE
                        .filter(({ safeModuleType }) => safeTypeFilter ? safeModuleType === safeTypeFilter : true)
                        // filter out NAME
                        .filter(({ name }) => safeNameFilter ? name === safeNameFilter : true)
                        .map(({
                            name,
                            markets,
                            safeAddress,
                            uniswapArbitrageAddress,
                            // operatorAddressIndex,
                            operatorAddress,
                            safeModuleType,
                            safeModuleAddress,
                            // minimumAmountInUsdForToken,
                        }) =>
                        <tr key={`safe-${safeAddress}`}>
                            {/* Safe Name */}
                            <td><Badge color="primary" className="p-2" pill>{name}</Badge></td>
                            {/* <td>{markets.map(({ tokenA, tokenB }) => [<p><Badge key={`safe-market-${tokenA}-${tokenB}`}>{`${tokenA}-${tokenB}`}</Badge></p>])}</td>
                            <td>{renderAccountLink(safeAddress)}</td> */}
                            {/* Type */}
                                <td><Badge color="success" className="p-2" pill>{safeModuleType}</Badge></td>
                            {/* Safe Info */}
                            <td>
                                <ul>
                                    <li>Markets: {markets.map(({ tokenA, tokenB }) => [<span key={`safe-market-${tokenA}-${tokenB}`} style={{padding: '0px 5px'}}><Badge>{`${tokenA}-${tokenB}`}</Badge></span>])}</li>
                                    <li>Safe: {renderAccountLink(safeAddress)}</li>
                                    <li>Safe Module: {renderEtherscanLink(safeModuleAddress)}</li>
                                    {uniswapArbitrageAddress && <li>Uniswap: {renderAccountLink(uniswapArbitrageAddress)}</li>}
                                    {/* Operator Address */}
                                    <li>Operator: {renderEtherscanLink(operatorAddress)}</li>
                                </ul>
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </PageWrapper>
    )
}

export default ErrorHOC(Web3HOC(Safes))
