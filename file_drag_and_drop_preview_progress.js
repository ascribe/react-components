'use strict';

import React from 'react';

import ProgressBar from 'react-bootstrap/lib/ProgressBar';

let FileDragAndDropPreviewProgress = React.createClass({
    propTypes: {
        files: React.PropTypes.array
    },

    calcOverallProgress() {
        let overallProgress = 0;
        let sizeOfAllFiles = 0;
        let files = this.props.files.filter((file) => file.status !== 'deleted' && file.status !== 'canceled' && file.status !== 'online');

        for(let i = 0; i < files.length; i++) {
            sizeOfAllFiles += files[i].size;
        }

        for(let i = 0; i < files.length; i++) {
            overallProgress += files[i].size / sizeOfAllFiles * files[i].progress;
        }

        return overallProgress;
    },

    calcOverallFileSize() {
        let overallFileSize = 0;
        let files = this.props.files.filter((file) => file.status !== 'deleted' && file.status !== 'canceled' && file.status !== 'online');

        for(let i = 0; i < files.length; i++) {
            overallFileSize += files[i].size;
        }

        return overallFileSize;
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