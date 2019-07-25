import React from 'react'

const AttentionBanner = ({
    title = "ATTENTION",
    subText,
    backgroundColor = '#ffffd0',
    customStyle = {},
  }) =>
    <div style={{ backgroundColor, padding: 5, textAlign: 'center', ...customStyle }}>
      <h1>{title}</h1>
      <pre>{typeof subText === 'function' ? subText() : subText}</pre>
    </div>

export default AttentionBanner
