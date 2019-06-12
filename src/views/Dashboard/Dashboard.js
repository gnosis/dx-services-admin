import React from 'react'
import { Jumbotron, Container } from 'reactstrap'

import ErrorHOC from '../../HOCs/ErrorHOC'

import { DX_GRAPHS_URL } from '../../globals'

const isPublic = process.env.REACT_APP_PUBLIC

function Dashboard() {
  return (
    <div className="animated fadeIn">
      <Jumbotron fluid>
        <Container fluid>
          <h1 className="display-3">{isPublic ? 'VisualX' : 'DutchX Services Admin'}</h1>
          <p className="lead">
            DutchX - Visualised
          </p>
          <iframe id="dxDashboardGraphs" title="DutchX Graphs" src={DX_GRAPHS_URL} style={{ height: '100vh', width: '100%' }}/>
        </Container>
      </Jumbotron>
    </div>
  )
}

export default ErrorHOC(Dashboard)
