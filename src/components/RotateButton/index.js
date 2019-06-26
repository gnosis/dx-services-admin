import React from 'react'

const RotateButton = ({
    customStyle = {},
    onClickHandler = () => null,
  }) =>
    <i 
      className="nav-icon fa fa-exchange hover90Shadow" 
      onClick={onClickHandler}
      style={{
        borderRadius: 50,
        cursor: 'pointer',
        fontSize: 18,
        marginLeft: 8,
        padding: 6,
        transform: 'rotate(90deg)',
        transition: 'all 0.25s linear',
        ...customStyle,
      }}
    />

export default RotateButton
