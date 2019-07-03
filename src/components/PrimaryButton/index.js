import React from 'react'

const PrimaryButton = ({
    text,
    customClassNames = '',
    customStyle = { margin: 3 },
    onClickHandler,
}) =>
    <button
        className={`btn btn-primary ${customClassNames}`}
        style={customStyle}
        onClick={onClickHandler}
    >
        {text}
    </button>

export default PrimaryButton
