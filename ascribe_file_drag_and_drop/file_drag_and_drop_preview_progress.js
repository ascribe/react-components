'use strict';

import React from 'react';

import ProgressBar from 'react-bootstrap/lib/ProgressBar';

import { displayValidProgressFilesFilter } from '../react_s3_fine_uploader_utils';


let FileDragAndDropPreviewProgress = React.createClass({
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
        let overallProgress = this.calcOverallProgress();
        let overallFileSize = this.calcOverallFileSize();
        let style = {
            visibility: 'hidden'
        };

        // only visible if overallProgress is over zero
        // or the overallFileSize is greater than 10MB
        if(overallProgress !== 0 && overallFileSize > 10000000) {
            style.visibility = 'visible';
        }

        return (
            <ProgressBar
                now={Math.ceil(overallProgress)}
                label="Overall progress: %(percent)s%"
                className="ascribe-progress-bar"
                style={style} />
        );
    }
});

export default FileDragAndDropPreviewProgress;