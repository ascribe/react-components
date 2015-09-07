'use strict';

import React from 'react';

let FileDragAndDropPreviewProgress = React.createClass({
    propTypes: {
        files: React.PropTypes.array
    },

    calcOverallProgress() {
        let overallProgress = 0;
        let sizeOfAllFiles = 0;
        let files = this.props.files.filter((file) => file.status !== 'deleted' && file.status !== 'canceled');

        for(let i = 0; i < files.length; i++) {
            sizeOfAllFiles += files[i].size;
        }

        for(let i = 0; i < files.length; i++) {
            overallProgress += files[i].size / sizeOfAllFiles * files[i].progress;
        }


        return overallProgress;
    },

    render() {
        let overallProgress = this.calcOverallProgress();

        if(overallProgress !== 0) {
            return (
                <span
                    className="file-drag-and-drop-progress-time">
                    Overall progress: {overallProgress.toFixed(2)}%
                </span>
            );
        } else {
            return null;
        }
    }
});

export default FileDragAndDropPreviewProgress;