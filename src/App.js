import React, { useEffect, useState } from 'react';
import AppRouter from './AppRouter'

import getWeb3API from './services/web3Service'

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

function App() {
    const { appLoadStatus, web3API } = useWeb3Init()

    return appLoadStatus && web3API ? <AppRouter web3={web3API} /> : <div>LOADING...</div>
}

export default App;

