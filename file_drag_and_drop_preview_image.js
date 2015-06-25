'use strict';

import React from 'react';
import ProgressBar from 'react-progressbar';

let FileDragAndDropPreviewImage = React.createClass({
    propTypes: {
        progress: React.PropTypes.number,
        url: React.PropTypes.string,
        onClick: React.PropTypes.func
    },

    render() {
        let imageStyle = {
            backgroundImage: 'url("' + this.props.url + '")',
            backgroundSize: 'cover'
        };

        return (
            <div
                onClick={this.props.onClick}
                className="file-drag-and-drop-preview-image"
                style={imageStyle}>
                    <ProgressBar completed={this.props.progress} color="black"/>
                    {this.props.progress === 100 ? <span className="glyphicon glyphicon-remove delete-file" aria-hidden="true" title="Delete"></span> : null}
            </div>
        );
    }
});

export default FileDragAndDropPreviewImage;