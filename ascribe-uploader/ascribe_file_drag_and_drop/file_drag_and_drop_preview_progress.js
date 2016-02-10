'use strict';

import React from 'react';

import ProgressBar from 'react-bootstrap/lib/ProgressBar';

import { displayValidProgressFilesFilter } from '../react_s3_fine_uploader_utils';


const FileDragAndDropPreviewProgress = React.createClass({
    propTypes: {
        files: React.PropTypes.array
    },

    calcOverallFileSize() {
        let overallFileSize = 0;
        let files = this.props.files.filter(displayValidProgressFilesFilter);

        // We just sum up all files' sizes
        for(let i = 0; i < files.length; i++) {
            overallFileSize += files[i].size;
        }

        return overallFileSize;
    },

    calcOverallProgress() {
        let overallProgress = 0;
        let overallFileSize = this.calcOverallFileSize();
        let files = this.props.files.filter(displayValidProgressFilesFilter);

        // We calculate the overall progress by summing the individuals
        // files' progresses in relation to their size
        for(let i = 0; i < files.length; i++) {
            overallProgress += files[i].size / overallFileSize * files[i].progress;
        }

        return overallProgress;
    },

    render() {
        const files = this.props.files.filter(displayValidProgressFilesFilter);
        const style = !files.length ? { display: 'none' } : null;
        let overallProgress = this.calcOverallProgress();

        return (
            <div style={{marginTop: '1.3em'}}>
                <ProgressBar
                    now={Math.ceil(overallProgress)}
                    label={'%(percent)s%'}
                    className="ascribe-progress-bar"
                    style={style} />
            </div>
        );
    }
});

export default FileDragAndDropPreviewProgress;