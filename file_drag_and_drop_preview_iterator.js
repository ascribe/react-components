'use strict';

import React from 'react';

import FileDragAndDropPreview from './file_drag_and_drop_preview';

let FileDragAndDropPreviewIterator = React.createClass({
    propTypes: {
        files: React.PropTypes.array,
        handleDeleteFile: React.PropTypes.func,
        handleCancelFile: React.PropTypes.func
    },

    render() {
        if(this.props.files) {
            return (
                <div>
                    {this.props.files.map((file, i) => {
                        if(file.status !== 'deleted' && file.status !== 'canceled') {
                            return (
                                <FileDragAndDropPreview
                                    key={i}
                                    file={file}
                                    handleDeleteFile={this.props.handleDeleteFile}
                                    handleCancelFile={this.props.handleCancelFile}/>
                            );
                        } else {
                            return null;
                        }
                    })}
                </div>
            );
        } else {
            return null;
        }
    }
});

export default FileDragAndDropPreviewIterator;