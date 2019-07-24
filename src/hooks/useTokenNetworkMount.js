import { useEffect, useState } from 'react'
import { from } from 'rxjs'

import { getTokensAndNetwork } from '../api'

/* MOUNT ONLY */
function useTokenNetworkMount(web3) {
    const [network, setNetwork]                       = useState(undefined)
    const [availableTokens, setAvailableTokens]       = useState([])
    
    const [loading, setLoading]                       = useState(false)
    const [error, setError]                           = useState(undefined)
  
    useEffect(() => {
      setError(undefined)
      setLoading(true)
  
      const mountSubscription = from(getTokensAndNetwork(web3, network))
        .subscribe({
          next: ({ tokens, bcNetwork }) => {
            setNetwork(bcNetwork)
            setAvailableTokens(tokens)
          },
          error: appError => setError(appError),
          complete: () => setLoading(false),
        })
  
      return () => {
        mountSubscription && mountSubscription.unsubscribe()
      }
    }, [])
  
    return { network, availableTokens, loading, error }
  }

export default useTokenNetworkMount
