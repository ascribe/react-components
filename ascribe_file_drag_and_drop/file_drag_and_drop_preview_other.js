'use strict';

import React from 'react';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';

import AclProxy from '../../acl_proxy';
import AscribeSpinner from '../../ascribe_spinner';
import { getLangText } from '../../../utils/lang_utils';


const { string, number, bool, func } = React.PropTypes;

const FileDragAndDropPreviewOther = React.createClass({
    propTypes: {
        type: string,
        progress: number,
        areAssetsDownloadable: bool,
        toggleUploadProcess: func,
        downloadUrl: string,
        showProgress: bool
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
        const { progress,
                areAssetsDownloadable,
                downloadUrl,
                type,
                showProgress } = this.props;
        const style = !showProgress ? { visibility: 'hidden' }: null;
        let actionSymbol;

        // only if assets are actually downloadable, there should be a
        // download icon if the process is already at 100%.
        // If not, no actionSymbol should be displayed
        if (progress === 100 && areAssetsDownloadable) {
            actionSymbol = (
                <a
                    href={downloadUrl}
                    target="_blank"
                    className="glyphicon glyphicon-download action-file"
                    aria-hidden="true"
                    title={getLangText('Download file')}/>
            );
        } else if(progress >= 0 && progress < 100) {
            actionSymbol = (
                <div className="spinner-file">
                    <AscribeSpinner color='dark-blue' size='md' />
                </div>
            );
        } else {
            actionSymbol = (
                <span
                    className="glyphicon glyphicon-ok action-file" />
            );
        }

        return (
            <div
                className="file-drag-and-drop-preview">
                <ProgressBar
                    now={Math.ceil(progress)}
                    style={style}
                    className="ascribe-progress-bar ascribe-progress-bar-xs"/>
                <div className="file-drag-and-drop-preview-table-wrapper">
                    <div className="file-drag-and-drop-preview-other">
                        {actionSymbol}
                        <p style={style}>{'.' + type}</p>
                    </div>
                </div>
            </div>
        );
    }
});

export default FileDragAndDropPreviewOther;
