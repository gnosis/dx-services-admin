import React, { useEffect, useState } from 'react';

import getWeb3API from '../../services/web3Service'
import ErrorPre from '../../views/Error'
import MetaMaskSVG from '../../assets/svg/MetaMask.svg'

import { from, of } from 'rxjs'
import { concatMap, delay } from 'rxjs/operators'

const MetaMaskPrompt = () => {
    const [mmMessage, setMMMessage] = useState('Attempting MetaMask connection...')

    const messages = [
        'This is taking a long time...',
        'Is your MM wallet logged-in + connected?',
        'Timeout. Please try refreshing this page.',
    ]

    useEffect(() => {
        const MMMessageSubscription = from(messages)
        .pipe(
            concatMap(
                message => 
                    of(message)
                    .pipe(delay(10000))
            )
        )
        .subscribe({
            next: (message) => {
                setMMMessage(message)
            },
            error: (error) => console.error(error),
        })

        return () => {
            MMMessageSubscription && MMMessageSubscription.unsubscribe()
        }
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
        const web3InitSubscription = from(getWeb3API())
            .subscribe({
                next: (W3) => {
                    setAppLoadStatus(true)
                    setWeb3API(W3)
                },
                error: (loadErr) => {
                    console.error(loadErr)
                    setError(loadErr)
                }
            })

        return () => {
            web3InitSubscription && web3InitSubscription.unsubscribe()
        }
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

