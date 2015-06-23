import React from 'react';

import FileDragAndDropPreview from './file_drag_and_drop_preview';

let FileDragAndDropPreviewIterator = React.createClass({
    propTypes: {
        files: React.PropTypes.array,
        handleDeleteFile: React.PropTypes.func
    },

    render() {
        if(this.props.files) {
            return (
                <div>
                    {this.props.files.map((file, i) => {
                        return (
                            <FileDragAndDropPreview 
                                key={i}
                                file={file}
                                handleDeleteFile={this.props.handleDeleteFile}/>
                        );
                    })}
                </div>
            );
        } else {
            return null;
        }
    }
});

export default FileDragAndDropPreviewIterator;