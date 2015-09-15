'use strict';

import React from 'react';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';

import AppConstants from '../../../constants/application_constants';
import { getLangText } from '../../../utils/lang_utils';

let FileDragAndDropPreviewImage = React.createClass({
    propTypes: {
        progress: React.PropTypes.number,
        url: React.PropTypes.string,
        toggleUploadProcess: React.PropTypes.func,
        downloadUrl: React.PropTypes.string,
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

    render() {
        let imageStyle = {
            backgroundImage: 'url("' + this.props.url + '")',
            backgroundSize: 'cover'
        };

        let actionSymbol;
        
        if(this.props.progress > 0 && this.props.progress < 99 && this.state.paused) {
            actionSymbol = <span className="glyphicon glyphicon-pause action-file" aria-hidden="true" title={getLangText('Pause upload')} onClick={this.toggleUploadProcess}/>;
        } else if(this.props.progress > 0 && this.props.progress < 99 && !this.state.paused) {
            actionSymbol = <span className="glyphicon glyphicon-play action-file" aria-hidden="true" title={getLangText('Resume uploading')} onClick={this.toggleUploadProcess}/>;
        } else if(this.props.progress === 100) {

            // only if assets are actually downloadable, there should be a download icon if the process is already at
            // 100%. If not, no actionSymbol should be displayed
            if(this.props.areAssetsDownloadable) {
                actionSymbol = <a href={this.props.downloadUrl} target="_blank" className="glyphicon glyphicon-download action-file" aria-hidden="true" title={getLangText('Download file')}/>;
            }

        } else {
            actionSymbol = <img height={35} className="action-file" src={AppConstants.baseUrl + 'static/img/ascribe_animated_medium.gif'} />;
        }

        return (
            <div
                className="file-drag-and-drop-preview-image"
                style={imageStyle}>
                    <ProgressBar
                        now={Math.ceil(this.props.progress)}
                        className="ascribe-progress-bar ascribe-progress-bar-xs"/>
                    {actionSymbol}
            </div>
        );
    }
});

export default FileDragAndDropPreviewImage;
