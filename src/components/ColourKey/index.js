import React from 'react'

const ColourKey = ({
    colourMap = {},
    header = "Colour key:",
    containerCustomStyle,
    spanCustomStyle,
  }) =>
    <div 
      style={{ 
        display: 'inline-grid', 
        margin: '10px 0',
        border: '3px dotted #00000017',
        padding: 5,
        textAlign: 'center',
        ...containerCustomStyle 
      }}
    >
      <strong>{header}</strong>
      {Object.keys(colourMap).map((key, idx) => <i key={key + idx} style={{ backgroundColor: key, padding: '3px 8px', ...spanCustomStyle }}>{colourMap[key]}</i>)}
    </div>

export default ColourKey
