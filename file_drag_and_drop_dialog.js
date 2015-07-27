'use strict';

import React from 'react';

import { getLangText } from '../../utils/lang_utils';

let FileDragAndDropDialog = React.createClass({
    propTypes: {
        hasFiles: React.PropTypes.bool,
        multipleFiles: React.PropTypes.bool,
        onClick: React.PropTypes.func,
        localHashing: React.PropTypes.bool
    },

    render() {
        if(this.props.hasFiles) {
            return null;
        } else {
            if(this.props.multipleFiles) {
                return (
                    <span className="file-drag-and-drop-dialog">
                        {getLangText('Click or drag to add files')}
                    </span>
                );
            } else {
                let dialog = this.props.localHashing ? getLangText('choose a file to hash') : getLangText('choose a file to upload');

                return (
                    <span className="file-drag-and-drop-dialog">
                        <p>{getLangText('Drag a file here')}</p>
                        <p>{getLangText('or')}</p>
                        <span
                            className="btn btn-default"
                            onClick={this.props.onClick}>
                                {dialog}
                        </span>
                    </span>
                );
            }
        }
    }
});

export default FileDragAndDropDialog;