import React from 'react';


/**
 * Factory for creating ComponentSpecExtensionBuilders, so that we can hide the class details from
 * the public API (to disallow users from doing weird things, like extending them).
 *
 * @param  {object} componentSpec           React component spec to extend with the builder
 * @param  {string} [baseRefName=component] Ref name from the extending component to the base
 * @return {ComponentSpecExtensionBuilder}  ComponentSpecExtensionBuilder instance
 */
export function createComponentSpecExtensionBuilder(...args) {
    // This can never be invoked by an importer of this module before the class is defined later in
    // this file
    // eslint-disable-next-line no-use-before-define
    return new ComponentSpecExtensionBuilder(...args);
}

/**
 * Builder for creating component extenders that propagate methods down to base refs.
 * Allows for patterns that resemble selective inheritance (although technically speaking, the
 * components are actually composed from each other). See createComponentSpecExtensionBuilder() on
 * how to obtain an instance.
 *
 * Useful when you want to add the same public API from a base component to extended components.
 * Only works when creating components with React.createClass(), as this directly adds methods to
 * the component spec. As well, this will typically not work if the extended component is wrapped
 * by a higher order component as most HOCs do not preserve their base component's imperiative API
 * (react-css-modules is a rare exception as its HOC extends the actual component being wrapped;
 * while this is powerful, this is not recommended for most use cases since React components should
 * be extended from React.Component and compose other components -- see
 * https://medium.com/@dan_abramov/how-to-use-classes-and-sleep-at-night-9af8de78ccb4#.jg851xg7c).
 *
 * Note that you cannot rely on babel-transform-react-display-names to generate a display name for
 * components who are wrapped by a spec extender, so you should provide one yourself.
 *
 * Usage:
 *   const componentSpecExtender = (componentSpec) => {
 *      const builder = new ComponentSpecExtensionBuilder(componentSpec);
 *      builder.extendForFn('foo')
 *             .extendForFn('bar');
 *
 *      return builder.constructSpec();
 *   }
 *
 *   const ExtendedComponent = React.createClass(componentSpecExtender({
 *      propTypes: {
 *          ...
 *      },
 *
 *      render() {
 *          ...
 *      }
 *  }));
 *
 * Constructor:
 *   @param {object} componentSpec           React component spec to extend with the builder
 *   @param {string} [baseRefName=component] Ref name from the extending component to the base
 *
 * Public API:
 *   constructSpec(): Get the extended component spec
 *   extendForFn(fnName): Adds fnName to the extended component
 *
 */
class ComponentSpecExtensionBuilder {
    constructor(componentSpec, baseRefName = 'component') {
        this.baseRefName = baseRefName;
        this.componentSpec = componentSpec;
        this.extensions = {};

        if (process.env.NODE_ENV !== 'production' && !componentSpec.hasOwnProperty('displayName')) {
            console.error('Component whose spec has been extended did not define a displayName ' +
                          '(very useful for debugging).\n' +
                          "Unfortunately, babel-plugin-transform-react-display-name isn't smart " +
                          'enough to detect when we use a spec transformer to generate the ' +
                          'display name automatically.');
        }
    }

    constructSpec() {
        return Object.assign({}, this.componentSpec, this.extensions);
    }

    extendForFn(fnName) {
        const { baseRefName, componentSpec } = this;
        const { displayName = 'ExtendedComponentSpec' } = componentSpec;

        // If the component being extended already has this function, don't overwrite it
        if (typeof componentSpec[fnName] !== 'function') {
            // Use traditional binding so `this.refs` evaluates to the rendered component's refs
            this.extensions[fnName] = function extendedFn(...args) {
                const baseRef = this.refs[baseRefName];

                if (!baseRef) {
                    throw new Error(`Could not find base ref (using ${baseRefName}) for ` +
                                    `extended component (display name: ${displayName}) when ` +
                                    `invoking extended function (${fnName}) from base`);
                }

                if (typeof baseRef[fnName] !== 'function') {
                    throw new Error(`Could not find function (${fnName}) in base ref (using ` +
                                    `${baseRefName}) from extended component (display name: ` +
                                    `${displayName}) when invoked from extended component`);
                }

                // Invoke the base component's method of the same name
                return baseRef[fnName](...args);
            };
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
 * Best-effort attempt at getting a component's display name. If none can be found, 'Component' is
 * returned. Adapted from react-router (https://github.com/reactjs/react-router/blob/master/modules/withRouter.js)
 *
 * @param  {function} Component React component
 * @return {string}             Display name of component, or 'Component' if none can be found
 */
export function getDisplayName(Component) {
    return Component.displayName || Component.name || 'Component';
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
