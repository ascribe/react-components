'use strict';

import React from 'react';
import ProgressBar from 'react-progressbar';

import AppConstants from '../../constants/application_constants';

let FileDragAndDropPreviewImage = React.createClass({
    propTypes: {
        progress: React.PropTypes.number,
        url: React.PropTypes.string,
        toggleUploadProcess: React.PropTypes.func,
        downloadFile: React.PropTypes.func,
        areAssetsDownloadable: React.PropTypes.bool
    },

    getInitialState() {
        return {
            paused: true
        };
    },

    toggleUploadProcess(e) {
        e.preventDefault();
        e.stopPropagation();

        this.setState({
            paused: !this.state.paused
        });

        this.props.toggleUploadProcess();
    },

    downloadFile() {
        console.log('implement this');
    },

    render() {
        let imageStyle = {
            backgroundImage: 'url("' + this.props.url + '")',
            backgroundSize: 'cover'
        };

        let actionSymbol;
        
        if(this.props.progress > 0 && this.props.progress < 99 && this.state.paused) {
            actionSymbol = <span className="glyphicon glyphicon-pause action-file" aria-hidden="true" title="Pause upload" onClick={this.toggleUploadProcess}/>;
        } else if(this.props.progress > 0 && this.props.progress < 99 && !this.state.paused) {
            actionSymbol = <span className="glyphicon glyphicon-play action-file" aria-hidden="true" title="Resume uploading" onClick={this.toggleUploadProcess}/>;
        } else if(this.props.progress === 100) {

            // only if assets are actually downloadable, there should be a download icon if the process is already at
            // 100%. If not, no actionSymbol should be displayed
            if(this.props.areAssetsDownloadable) {
                actionSymbol = <span className="glyphicon glyphicon-download action-file" aria-hidden="true" title="Download file" onClick={this.props.downloadFile}/>;
            }

        } else {
            actionSymbol = <img height={35} className="action-file" src={AppConstants.baseUrl + 'static/img/ascribe_animated_medium.gif'} />;
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