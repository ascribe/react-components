import React from 'react';

class PropertyExtenderBuilder {
    constructor(PropertyComponent, propertyRefName = 'property') {
        this.propertyRefName = propertyRefName;

        // Set up spec for creating extended property class
        this.spec = {
            displayName: 'PropertyExtender',

            // Use traditional binding so `this` evaluates to the rendered component
            render() {
                return (<PropertyComponent ref="property" {...this.props} />);
            }
        };
    }

    createClass() {
        return React.createClass(this.spec);
    }

    extendForFn(fnName) {
        const { propertyRefName } = this;

        // Use traditional binding so `this` evaluates to the rendered component
        this.spec[fnName] = function (...args) {
            const component = this.refs.property;

            if (typeof component[fnName] !== 'function') {
                const propertyRef = component.refs[propertyRefName];

                if (!propertyRef) {
                    throw new Error(`Could not find Property ref (using ${propertyRefName}) for ` +
                                    `extended component (display name: ${PropertyComponent.displayName}) ` +
                                    `when invoking extended function (${fnName}) from Property`);
                }

                if (typeof propertyRef[fnName] !== 'function') {
                    throw new Error(`Could not find invoked function: ${fnName} in extended Property ` +
                                    `component (display name: ${PropertyComponent.displayName}) ` +
                                    `using Property ref: ${propertyRefName}`);
                }

                return propertyRef[fnName](...args);
            } else {
                // If the component being extended already has this function, just invoke it
                return this.refs.property[fnName](...args);
            }
        }
    }
}

const PropertyExtender = (PropertyComponent, propertyRefName) => {
    const builder = new PropertyExtenderBuilder(PropertyComponent, propertyRefName);
    builder.extendForFn('getValue');
    builder.extendForFn('handleFocus');
    builder.extendForFn('handleSubmitFailure');
    builder.extendForFn('handleSubmitSuccess');
    builder.extendForFn('reset');
    builder.extendForFn('validate');

    return builder.createClass();
};

export default PropertyExtender;
