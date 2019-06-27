import React from 'react'

export const ErrorPre = ({
    error = 'An unknown error occurred',
    errorTitle = 'An error occurred during initialisation :(',
}) =>
    <pre style={{ padding: 50 }}>
        <h3>{errorTitle}</h3>
        {error.message || error}
    </pre>

export default ErrorPre
