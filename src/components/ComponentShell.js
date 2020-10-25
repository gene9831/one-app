import React from 'react';
import PropTypes from 'prop-types';

export default function ComponentShell(props) {
  const { Component, Props } = props;

  return <Component {...Props} />;
}

ComponentShell.propTypes = {
  Component: PropTypes.object.isRequired,
  Props: PropTypes.object,
};
