import React from 'react'

import LOADING from '../../assets/img/brand/logo.svg'

const LoadingStyles = {
    display: 'flex',
    margin: 'auto',
}

const LoadingPicStyles = {
    maxWidth: '60%',
    borderRadius: 230,
    filter: 'saturate(0)',
}

const Loading = () =>
    <div style={LoadingStyles}>
        <pre style={{ margin: '20px auto', textAlign: 'center' }}><h1 style={{ margin: '30px 0px' }}>Loading...</h1>
        <img className="spinAnimate" style={LoadingPicStyles} src={LOADING} alt="Is he a liar? A doll? No! It's our Anxo!"/></pre>
        
    </div>

export default Loading
