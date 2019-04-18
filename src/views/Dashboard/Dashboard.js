import React from 'react';
import { Jumbotron, Container } from 'reactstrap';

function Dashboard() {
  return (
    <div className="animated fadeIn">
      <Jumbotron fluid>
        <Container fluid>
          <h1 className="display-3">DutchX services admin</h1>
          <p className="lead">
            Admin bots, services, and notifications.
          </p>
          <iframe id="dxDashboardGraphs" title="DutchX Graphs" src="https://explore.duneanalytics.com/public/dashboards/NJXQ1WlL4zr9KVesucCaB3MbKPgcbYz8vTEAXv6s" style={{ height: '100vh', width: '100%' }}/>
        </Container>
      </Jumbotron>
    </div>
  )
}

export default Dashboard;
