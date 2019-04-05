import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { AppNavbarBrand, AppSidebarToggler } from '@coreui/react';
import logo from '../../assets/img/brand/logo.svg'

import { network2Color } from '../../utils'

const propTypes = {
  children: PropTypes.node,
};

class DefaultHeader extends Component {
  render() {

    // eslint-disable-next-line
    const { children, networkName, ...attributes } = this.props;
    const headerBackgroundColor = network2Color(this.props.networkName)
    return (
      <div className="headerContainer" style={{ background: headerBackgroundColor }}>
        <AppNavbarBrand
          full={{ src: logo, width: 89, height: 25, alt: 'DutchX Logo' }}
          minimized={{ width: 30, height: 30 }}
          />
        <div className="headerNetworkName"><h5>{this.props.networkName.toUpperCase()}</h5></div>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <AppSidebarToggler className="d-md-down-none" display="lg"/>
      </div>
    );
  }
}

DefaultHeader.propTypes = propTypes;

export default DefaultHeader;
