'use strict';

import React from 'react';

import FileDragAndDropPreview from './file_drag_and_drop_preview';
import FileDragAndDropPreviewProgress from './file_drag_and_drop_preview_progress';

import { displayValidFilesFilter } from '../react_s3_fine_uploader_utils';


let FileDragAndDropPreviewIterator = React.createClass({
    propTypes: {
        files: React.PropTypes.array,
        handleDeleteFile: React.PropTypes.func,
        handleCancelFile: React.PropTypes.func,
        handlePauseFile: React.PropTypes.func,
        handleResumeFile: React.PropTypes.func,
        areAssetsDownloadable: React.PropTypes.bool,
        areAssetsEditable: React.PropTypes.bool
    },

    render() {
        let {
            files,
            handleDeleteFile,
            handleCancelFile,
            handlePauseFile,
            handleResumeFile,
            areAssetsDownloadable,
            areAssetsEditable
        } = this.props;
        files = files.filter(displayValidFilesFilter);

        if(files && files.length > 0) {
            return (
                <div>
                    {files.map((file, i) => {
                        return (
                            <FileDragAndDropPreview
                                key={i}
                                file={file}
                                handleDeleteFile={handleDeleteFile}
                                handleCancelFile={handleCancelFile}
                                handlePauseFile={handlePauseFile}
                                handleResumeFile={handleResumeFile}
                                areAssetsDownloadable={areAssetsDownloadable}
                                areAssetsEditable={areAssetsEditable}
                                numberOfDisplayedFiles={files.length}/>
                        );
                    })}
                    <FileDragAndDropPreviewProgress files={files} />
                </div>
            );
        } else {
            return null;
        }
    }
});

export default FileDragAndDropPreviewIterator;