import React from 'react';

import HiddenInput from '../ui/hidden_input';


const { bool, func, string } = React.PropTypes;

/**
 * Convenience wrapper component for `<input type="file" />` that hides the backing native input to
 * let users style the UI themselves (that default input button is UGLY!).
 */
const FileInput = React.createClass({
    propTypes: {
        // All props given will be passed down to the backing input element.
        // This is just a list of the more useful props that you'll likely want to use:
        accept: string,
        multiple: bool,
        onChange: func
    },

    // Fake click events to act as if the user clicked directly on this input instead of its
    // parent container
    dispatchClickEvent() {
        let evt;

        try {
            evt = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
        } catch(e) {
            // For browsers that do not support the new MouseEvent syntax
            evt = document.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
        }

        evt.stopPropagation();
        this.inputElement.dispatchEvent(evt);
    },

    reset() {
        this.inputElement.value = '';
    },

    render() {
        // See the documentation in HiddenInput about the gotchas associated with hiding `<input />`s
        return (
            <HiddenInput
                ref={(ref) => { this.inputElement = ref && ref.inputElement; }}
                {...this.props}
                type="file" />
        );
    }
});

export default FileInput;
