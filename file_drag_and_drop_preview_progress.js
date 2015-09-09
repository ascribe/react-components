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

    render() {
        let overallProgress = this.calcOverallProgress();
        let style = {
            visibility: 'hidden'
        };

        if(overallProgress !== 0) {
            style.visibility = 'visible';
        }

        console.log(overallProgress, style);

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