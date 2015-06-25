'use strict';

import React from 'react';
import ProgressBar from 'react-progressbar';

let FileDragAndDropPreviewOther = React.createClass({
    propTypes: {
        type: React.PropTypes.string,
        progress: React.PropTypes.number
    },

    render() {
        return (
            <div
                className="file-drag-and-drop-preview">
                <ProgressBar completed={this.props.progress} color="black"/>
                <div className="file-drag-and-drop-preview-table-wrapper">
                    <div className="file-drag-and-drop-preview-other">
                        <span className="glyphicon glyphicon-remove delete-file" aria-hidden="true" title="Delete"></span>
                        <span>{'.' + this.props.type}</span>
                    </div>
                </div>
            </div>
        );
    }
});

export default FileDragAndDropPreviewOther;