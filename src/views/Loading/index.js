import React from 'react'

const ANXO = 'https://gitlab.gnosisdev.com/web/gnosis-website-owl-page/uploads/856f1a1221b8592e8aa6f2b8dabf1864/loading.png'

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
        <pre style={{ margin: '20px auto', textAlign: 'center' }}><h1 style={{ margin: '30px 0px' }}>Mmmmm incoming data :D</h1>
        <img className="spinAnimate" style={LoadingPicStyles} src={ANXO} alt="Is he a liar? A doll? No! It's our Anxo!"/></pre>
        
    </div>

export default Loading
