import React from 'react';
import CssModules from 'react-css-modules';

import styles from './spinner.scss';


const { number, object, oneOfType, string } = React.PropTypes;

const propTypes = {
    size: oneOfType([number, string]),
    style: object
};

const defaultProps = {
    size: 20
};

const Spinner = ({ size, style, ...props }) => (
    <div {...props} style={{ height: size, width: size, ...style }} styleName="spinner" />
);

Spinner.propTypes = propTypes;
Spinner.defaultProps = defaultProps;

export default CssModules(Spinner, styles);
