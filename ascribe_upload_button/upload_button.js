'use strict';

import React from 'react';

import { displayValidProgressFilesFilter } from '../react_s3_fine_uploader_utils';
import { getLangText } from '../../../utils/lang_utils';


let UploadButton = React.createClass({
    propTypes: {
        onDragStart: React.PropTypes.func,
        onDrop: React.PropTypes.func.isRequired,
        onDrag: React.PropTypes.func,
        onDragEnter: React.PropTypes.func,
        onLeave: React.PropTypes.func,
        onDragLeave: React.PropTypes.func,
        onDragOver: React.PropTypes.func,
        onDragEnd: React.PropTypes.func,
        onInactive: React.PropTypes.func,
        filesToUpload: React.PropTypes.array,
        handleDeleteFile: React.PropTypes.func,
        handleCancelFile: React.PropTypes.func,
        handlePauseFile: React.PropTypes.func,
        handleResumeFile: React.PropTypes.func,
        multiple: React.PropTypes.bool,

        // For simplification purposes we're just going to use this prop as a
        // label for the upload button
        fileClassToUpload: React.PropTypes.shape({
            singular: React.PropTypes.string,
            plural: React.PropTypes.string
        }),

        allowedExtensions: React.PropTypes.string
    },

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        let files = event.target.files;

        if(typeof this.props.onDrop === 'function' && files) {
          this.props.onDrop(files);
        }

    },

    getUploadingFiles() {
        return this.props.filesToUpload.filter((file) => file.status === 'uploading');
    },

    handleOnClick() {
        let uploadingFiles = this.getUploadingFiles();

        // We only want the button to be clickable if there are no files currently uploading
        if(uploadingFiles.length === 0) {
            // Firefox only recognizes the simulated mouse click if bubbles is set to true,
            // but since Google Chrome propagates the event much further than needed, we
            // need to stop propagation as soon as the event is created
            var evt = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });

            evt.stopPropagation();
            this.refs.fileinput.getDOMNode().dispatchEvent(evt);
        }
    },

    getButtonLabel() {
        let { filesToUpload, fileClassToUpload } = this.props;

        // filter invalid files that might have been deleted or canceled...
        filesToUpload = filesToUpload.filter(displayValidProgressFilesFilter);

        // Depending on wether there is an upload going on or not we
        // display the progress
        if(filesToUpload.length > 0) {
            return  getLangText('Upload progress') + ': ' + Math.ceil(filesToUpload[0].progress) + '%';
        } else {
            return fileClassToUpload.singular;
        }
    },

    render() {
        let {
             multiple,
             fileClassToUpload,
             allowedExtensions
        } = this.props;

        return (
            <button
                onClick={this.handleOnClick}
                className="btn btn-default btn-sm margin-left-2px"
                disabled={this.getUploadingFiles().length !== 0}>
                {this.getButtonLabel()}
                <input
                    multiple={multiple}
                    ref="fileinput"
                    type="file"
                    style={{
                        display: 'none',
                        height: 0,
                        width: 0
                    }}
                    onChange={this.handleDrop}
                    accept={allowedExtensions}/>
           </button>
        );
    }
});

export default UploadButton;