import React from 'react';
import ProgressBar from 'react-progressbar';

let FileDragAndDropPreviewImage = React.createClass({
    propTypes: {
        progress: React.PropTypes.number,
        url: React.PropTypes.string
    },

    render() {
        let imageStyle = {
            backgroundImage: 'url("' + this.props.url + '")',
            backgroundSize: 'cover'
        };

        return (
            <div
                className="file-drag-and-drop-preview-image"
                style={imageStyle}>
                    <ProgressBar completed={this.props.progress} color="black"/>
            </div>
        );
    }
});

export default FileDragAndDropPreviewImage;