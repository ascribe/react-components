'use strict';

import React from 'react';

import FileDragAndDropPreview from './file_drag_and_drop_preview';
import FileDragAndDropPreviewProgress from './file_drag_and_drop_preview_progress';


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
        if(this.props.files && this.props.files.length > 0) {
            return (
                <div className="file-drag-and-drop-preview-iterator">
                    <div>
                        {this.props.files.map((file, i) => {
                            if(file.status !== 'deleted' && file.status !== 'canceled' && file.size !== -1) {
                                return (
                                    <FileDragAndDropPreview
                                        key={i}
                                        file={file}
                                        handleDeleteFile={this.props.handleDeleteFile}
                                        handleCancelFile={this.props.handleCancelFile}
                                        handlePauseFile={this.props.handlePauseFile}
                                        handleResumeFile={this.props.handleResumeFile}
                                        areAssetsDownloadable={this.props.areAssetsDownloadable}
                                        areAssetsEditable={this.props.areAssetsEditable}/>
                                );
                            } else {
                                return null;
                            }
                        })}
                    </div>
                    {/* <FileDragAndDropPreviewProgress files={this.props.files} /> */}
                </div>
            );
        } else {
            return null;
        }
    }
});

export default FileDragAndDropPreviewIterator;