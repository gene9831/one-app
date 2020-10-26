import React from 'react';
import PropTypes from 'prop-types';

export default function ComponentShell(props) {
  const { Component, Props } = props;

  return Component ? <Component {...Props} /> : null;
}

ComponentShell.propTypes = {
  Component: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  Props: PropTypes.object,
};
