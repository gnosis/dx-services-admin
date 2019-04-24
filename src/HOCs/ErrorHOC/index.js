import React from 'react'
import Page500 from '../../views/Pages/Page500'

const ErrorHOC = Component =>
    class extends React.Component {
        state = {
            hasError: false,
        }

        static getDerivedStateFromError() {
            return {
                hasError: true,
            }
        }

        componentDidCatch(error, info) {
            // insert logging function here maybe (in future)
            console.warn('ERROR: ', error, 'INFO: ', info)
        }

        render() {
            return this.state.hasError ? <Page500 /> : <Component {...this.props} />
        }
    }

export default ErrorHOC
