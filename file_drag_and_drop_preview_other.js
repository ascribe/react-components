'use strict';

import React from 'react';
import ProgressBar from 'react-progressbar';

let FileDragAndDropPreviewOther = React.createClass({
    propTypes: {
        type: React.PropTypes.string,
        progress: React.PropTypes.number,
        onClick: React.PropTypes.func
    },

    render() {
        return (
            <div
                onClick={this.props.onClick}
                className="file-drag-and-drop-preview">
                <ProgressBar completed={this.props.progress} color="black"/>
                <div className="file-drag-and-drop-preview-table-wrapper">
                    <div className="file-drag-and-drop-preview-other">
                        {this.props.progress === 100 ? <span className="glyphicon glyphicon-remove delete-file" aria-hidden="true" title="Delete"></span> : null}
                        <span>{'.' + this.props.type}</span>
                    </div>
                </div>
            </div>
        );
    }
});

export default FileDragAndDropPreviewOther;