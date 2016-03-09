import React from 'react';

const { bool, func, string } = React.PropTypes;

const FileInput = React.createClass({
    propTypes: {
        onChange: func.isRequired,

        accept: string,
        multiple: bool
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
        this.refs.inputElement.dispatchEvent(evt);
    },

    reset() {
        this.refs.inputElement.value = '';
    },

    render() {
        const { accept, multiple, onChange } = this.props;

        // Opera doesn't trigger simulated click events if the targeted input has `display:none`
        // set, which means we need to set its visibility to hidden instead.
        // See http://stackoverflow.com/questions/12880604/jquery-triggerclick-not-working-on-opera-if-the-element-is-not-displayed
        return (
            <input
                ref="inputElement"
                accept={accept}
                multiple={multiple}
                onChange={onChange}
                style={{
                    height: 0,
                    position: 'absolute',
                    top: 0,
                    visibility: 'hidden',
                    width: 0
                }}
                type="file" />
        );
    }
});

export default FileInput;
