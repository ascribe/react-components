'use strict';

import React from 'react';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';

import AscribeSpinner from '../../ascribe_spinner';
import { getLangText } from '../../../utils/lang_utils';


const { string, number, bool, func } = React.PropTypes;

const FileDragAndDropPreviewOther = React.createClass({
    propTypes: {
        type: string,
        progress: number,
        areAssetsDownloadable: bool,
        toggleUploadProcess: func,
        downloadUrl: string
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
            actionSymbol = (
                <div className="spinner-file">
                    <AscribeSpinner color='dark-blue' size='md' />
                </div>
            );
        }

        return (
            <div
                className="file-drag-and-drop-preview">
                <ProgressBar
                    now={Math.ceil(this.props.progress)}
                    className="ascribe-progress-bar ascribe-progress-bar-xs"/>
                <div className="file-drag-and-drop-preview-table-wrapper">
                    <div className="file-drag-and-drop-preview-other">
                        {actionSymbol}
                        <p>{'.' + this.props.type}</p>
                    </div>
                </div>
            </div>
        );
    }
});

export default FileDragAndDropPreviewOther;
