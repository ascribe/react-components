'use strict';

import React from 'react';

let FileDragAndDropDialog = React.createClass({
    propTypes: {
        hasFiles: React.PropTypes.bool,
        multipleFiles: React.PropTypes.bool,
        onClick: React.PropTypes.func
    },

    render() {
        if(this.props.hasFiles) {
            return null;
        } else {
            if(this.props.multipleFiles) {
                return (
                    <span className="file-drag-and-drop-dialog">Click or drag to add files</span>
                );
            } else {
                return (
                    <span className="file-drag-and-drop-dialog">
                        <p>Drag a file here</p>
                        <p>or</p>
                        <button
                            className="btn btn-default"
                            onClick={this.props.onClick}>
                                choose a file to upload
                        </button>
                    </span>
                );
            }
        }
    }
});

export default FileDragAndDropDialog;