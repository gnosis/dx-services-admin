import React, { useEffect, useState } from 'react';

import getWeb3API from '../../services/web3Service'

import ErrorPre from '../../views/Error'

import MetaMaskSVG from '../../assets/svg/MetaMask.svg'

const MetaMaskPrompt = () => {
    const [mmMessage, setMMMessage] = useState('Attempting MetaMask connection...')
    useEffect(() => {
        setTimeout(() => setMMMessage('This is taking a long time...'), 10000)
        setTimeout(() => setMMMessage('Is your MM wallet logged-in + connected?'), 20000)
        setTimeout(() => setMMMessage('Timeout. Please try refreshing this page.'), 30000)
    }, [])

    return (
        <div className="MetaMaskSVGContainer slowFadeIn">
            <h1>{mmMessage}</h1>
            <img src={MetaMaskSVG} alt="Dark MetaMask Fox" />
        </div>
    )
}

const useWeb3Init = () => {
    const [web3API, setWeb3API] = useState(false)
    const [appLoadStatus, setAppLoadStatus] = useState(false)
    const [error, setError] = useState(undefined)

    useEffect(() => {
        const initWeb3API = async () => {
            try {
                const W3 = await getWeb3API()
                setAppLoadStatus(true)
                setWeb3API(W3)
            } catch (loadErr) {
                console.error(loadErr)
                setError(loadErr)
            }
        }
        initWeb3API()
    }, [])

    return { appLoadStatus, error, web3API }
}

const Web3HOC = Component =>
    function WrappedComponent(props) {
        const { appLoadStatus, error, web3API } = useWeb3Init()
        
        if (error) return <ErrorPre error={error} errorTitle="An error has occurred on Web3 initialisation mount :(" />

        return appLoadStatus && web3API ? <Component web3={web3API} {...props}/> : <MetaMaskPrompt />
    }


export default Web3HOC;

