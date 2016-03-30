import React from 'react';

/**
 * Builder for creating component extenders that propagate methods down to base refs.
 *
 * Useful when you want to add the same public API from a base component to extended components.
 *
 * Constructor:
 *   @param {function} Component   Component to extend with the builder
 *   @param {string}   baseRefName Ref name from the extension component to the base
 *   @param {object}   spec        React class spec used to initialize the extension component.
 *                                 Usually the only useful thing to provide here is a `displayName`.
 *
 * Public API:
 *   createClass(): Creates the built, extended component
 *   extendForFn(fnName): Adds fnName to the extended component
 *
 */
export class ComponentExtenderBuilder {
    constructor(Component, baseRefName = 'component', spec = {}) {
        // The extension component will just render the given component but attach a ref so it can
        // propagate method calls down the refs.
        // Use traditional binding so `this.props` evaluates to the rendered component's props
        spec.render = function () {
            return (<Component ref="component" {...this.props} />);
        };

        this.baseRefName = baseRefName;
        this.componentDisplayName = Component.displayName;
        this.spec = spec;
    }

    createClass() {
        return React.createClass(this.spec);
    }

    extendForFn(fnName) {
        const { baseRefName, componentDisplayName } = this;

        // Add the given function to the extended class
        // Use traditional binding so `this.refs` evaluates to the rendered component's refs
        this.spec[fnName] = function (...args) {
            const { component } = this.refs;

            if (typeof component[fnName] === 'function') {
                // If the component being extended already has this function, just invoke it
                return component[fnName](...args);
            } else {
                const baseRef = component.refs[baseRefName];

                if (!baseRef) {
                    throw new Error(`Could not find base ref (using ${baseRefName}) for ` +
                                    `extended component (display name: ${componentDisplayName}) ` +
                                    `when invoking extended function (${fnName}) from base`);
                }

                if (typeof baseRef[fnName] !== 'function') {
                    throw new Error(`Could not find function (${fnName}) in base ref (using ` +
                                    `${baseRefName}) from extended component (display name: ` +
                                    `${componentDisplayName}) when invoked from extended component`);
                }

                // Invoke the base component's method of the same name
                return baseRef[fnName](...args);
            }
        }

        return this;
    }
}

/**
 * Checks if a object is a React component and not a native HTML element
 *
 * Not entirely optimal, but this is similar to what babel-plugin-react-transform does so we'll take it.
 * See https://github.com/gaearon/babel-plugin-react-transform/blob/master/src/index.js
 *
 * @param  {object}  component Object to check
 * @return {boolean}           True if given component is a React component
 */
export function isReactElement(element) {
    // Check if the element has a render method, and if possible, check to see that it's not an
    // instance of HTMLElement.
    return element && element.render &&
           !(typeof window.HTMLElement === 'function' && element instanceof window.HTMLElement);
}

/**
 * Create a new component that always has the given props added to it when invoked
 *
 * @param  {function} Component    React component to stuff with props
 * @param  {object}   stuffedProps Props to be always added to the component
 * @return {function}              New React component
 */
export function PropStuffer(Component, stuffedProps, displayName = 'PropStuffer') {
    const StuffedComponent = ({ ...props }) => (
        <Component {...props} {...stuffedProps} />
    );

    StuffedComponent.displayName = displayName;

    return StuffedComponent;
}
