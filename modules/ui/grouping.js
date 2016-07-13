import React from 'react';
import CssModules from 'react-css-modules';

import styles from './grouping.scss';


const { bool, node, number, oneOfType, string } = React.PropTypes;

const propTypes = {
    children: node.isRequired,

    // Providing a number will default to using 'px' for the margin
    margin: oneOfType([number, string]),

    vertical: bool

    // All other props are passed into the rendered element
};

const defaultProps = {
    margin: 1
};

const Grouping = ({ children, margin, vertical, ...props }) => {
    const childDisplayStyle = vertical ? {
        display: 'block'
    } : null;

    const childMarginStyle = {
        [vertical ? 'marginTop' : 'marginLeft']: margin
    };

    const childStyle = {
        ...childDisplayStyle,
        ...childMarginStyle
    };

    return (
        <span {...props} styleName="grouping-container">
            {React.Children.map(children, (child, ii) => {
                // Only apply the display style to the first child to avoid setting unnecessary
                // margin at the start
                const baseStyle = ii ? childStyle : childDisplayStyle;

                return React.cloneElement(child, {
                    // If the child has styles applied to it already, let those override our base
                    // styles
                    style: {
                        ...baseStyle,
                        ...child.props.style
                    }
                });
            })}
        </span>
    );
};

Grouping.propTypes = propTypes;
Grouping.defaultProps = defaultProps;

export default CssModules(Grouping, styles);
