import React from 'react';

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
