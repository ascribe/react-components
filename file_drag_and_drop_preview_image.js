'use strict';

import React from 'react';
import ProgressBar from 'react-progressbar';

let FileDragAndDropPreviewImage = React.createClass({
    propTypes: {
        progress: React.PropTypes.number,
        url: React.PropTypes.string,
        toggleUploadProcess: React.PropTypes.func,
        downloadFile: React.PropTypes.func
    },

    getInitialState() {
        return {
            paused: true
        };
    },

    /*onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.setState({
            loading: true
        });

        this.props.onClick(e);
    },*/

    toggleUploadProcess(e) {
        e.preventDefault();
        e.stopPropagation();

        this.setState({
            paused: true
        });
    },

    downloadFile() {

    },

    render() {
        let imageStyle = {
            backgroundImage: 'url("' + this.props.url + '")',
            backgroundSize: 'cover'
        };

        let actionSymbol;
        
        if(this.props.progress !== 100 && this.state.paused) {
            actionSymbol = <span className="glyphicon glyphicon-pause action-file" aria-hidden="true" title="Pause upload" onClick={this.toggleUploadProcess}/>;
        } else if(this.props.progress !== 100 && !this.state.paused) {
            actionSymbol = <span className="glyphicon glyphicon-play action-file" aria-hidden="true" title="Resume uploading" onClick={this.toggleUploadProcess}/>;
        } else {
            actionSymbol = <span className="glyphicon glyphicon-download action-file" aria-hidden="true" title="Download file" onClick={this.props.downloadFile}/>;
        }

        return (
            <div
                className="file-drag-and-drop-preview-image"
                style={imageStyle}>
                    <ProgressBar completed={this.props.progress} color="black"/>
                    {actionSymbol}
            </div>
        );
    }
});

export default FileDragAndDropPreviewImage;