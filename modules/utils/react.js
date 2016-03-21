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
