import React from 'react'

const AttentionBanner = ({
    title = "ATTENTION",
    subText,
    backgroundColor = '#ffffd0',
  }) =>
    <div style={{ backgroundColor, padding: 5, textAlign: 'center' }}>
      <h1>{title}</h1>
      <pre>{subText}</pre>
    </div>

export default AttentionBanner
