import React from 'react';
import CssModules from 'react-css-modules';

import propertySpecExtender from '../utils/property_spec_extender';

import styles from './simple_property.scss';


const SimpleLayout = CssModules(({ children }) => (
    <div styleName="layout">
        {children}
    </div>
), styles);

SimpleLayout.displayName = 'SimpleLayout';


const SimpleProperty = (Property) => (
    // Needs to be created as a stateful component to allow the Form to attach refs to this component
    React.createClass(propertySpecExtender({
        displayName: 'SimpleProperty',

        render() {
            // Don't show any error messages in the individual properties to let the form handle them
            // all
            const noErrorLabel = null;

            return (
                <Property
                    ref="property"
                    {...this.props}
                    errorLabelType={noErrorLabel}
                    layoutType={SimpleLayout} />
            );
        }
    }))
);

export default SimpleProperty;
