import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { version as appVersion } from '../../../package.json'

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultFooter extends Component {
  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

    return (
      <>
        <span><a href="https://gnosis.io" target="_blank" rel="noopener noreferrer">Gnosis Ltd.</a> &copy; 2019 Gnosis.</span>
        <span className="ml-auto">Version {appVersion}</span> 
      </>
    );
  }
}

DefaultFooter.propTypes = propTypes;
DefaultFooter.defaultProps = defaultProps;

export default DefaultFooter;
