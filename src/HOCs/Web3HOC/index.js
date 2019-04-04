import React, { useEffect, useState } from 'react';

import getWeb3API from '../../services/web3Service'

const useWeb3Init = () => {
    const [web3API, setWeb3API] = useState(false)
    const [appLoadStatus, setAppLoadStatus] = useState(false)

    useEffect(() => {
        const initWeb3API = async () => {
            const W3 = await getWeb3API()
            setAppLoadStatus(true)
            setWeb3API(W3)
        }
        initWeb3API()
    }, [])

    return { appLoadStatus, web3API }
}

const Web3HOC = Component =>
    function WrappedComponent(props) {
        const { appLoadStatus, web3API } = useWeb3Init()

        return appLoadStatus && web3API && <Component web3={web3API} {...props}/>/*  : <h1 style={{ padding: 50 }}>L O A D I N G . . .</h1> */
    }


export default Web3HOC;

