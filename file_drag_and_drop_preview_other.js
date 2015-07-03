'use strict';

import React from 'react';
import ProgressBar from 'react-progressbar';

import AppConstants from '../../constants/application_constants';
import { getLangText } from '../../utils/lang_utils.js'

let FileDragAndDropPreviewOther = React.createClass({
    propTypes: {
        type: React.PropTypes.string,
        progress: React.PropTypes.number,
        areAssetsDownloadable: React.PropTypes.bool,
        toggleUploadProcess: React.PropTypes.func,
        downloadUrl: React.PropTypes.string
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
            actionSymbol = <img height={35} src={AppConstants.baseUrl + 'static/img/ascribe_animated_medium.gif'} />;
        }

        return (
            <div
                className="file-drag-and-drop-preview">
                <ProgressBar completed={this.props.progress} color="black"/>
                <div className="file-drag-and-drop-preview-table-wrapper">
                    <div className="file-drag-and-drop-preview-other">
                        {actionSymbol}
                        <span>{'.' + this.props.type}</span>
                    </div>
                </div>
            </div>
        );
    }
});

export default FileDragAndDropPreviewOther;
