'use strict';

import React from 'react';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import { displayValidProgressFilesFilter } from '../react_s3_fine_uploader_utils';
import { getLangText } from '../../../utils/lang_utils';
import { truncateTextAtCharIndex } from '../../../utils/general_utils';


export default function UploadButton(label) {
    return React.createClass({
        propTypes: {
            onDrop: React.PropTypes.func.isRequired,
            filesToUpload: React.PropTypes.array,
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

        getUploadedFile() {
            return this.props.filesToUpload.filter((file) => file.status === 'upload successful')[0];
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
            const uploadedFile = this.getUploadedFile();
            let { filesToUpload, fileClassToUpload } = this.props;

            // filter invalid files that might have been deleted or canceled...
            filesToUpload = filesToUpload.filter(displayValidProgressFilesFilter);

            // Depending on whether there is an upload going on or not we
            // display the progress or the successfully uploaded file's name
            if(uploadedFile) {
                return (
                    <span>
                        <Glyphicon glyph="ok" />
                        {' ' + truncateTextAtCharIndex(uploadedFile.name, 20)}
                    </span>
                );
            } else if(filesToUpload.length > 0) {
                return getLangText('Upload progress') + ': ' + Math.ceil(filesToUpload[0].progress) + '%';
            } else {
                return fileClassToUpload.singular;
            }
        },

        render() {
            let {
                 multiple,
                 allowedExtensions
            } = this.props;

            /*
             * We do not want a button that submits here.
             * As UploadButton could be used in forms that want to be submitted independent
             * of clicking the selector.
             * Therefore the wrapping component needs to be an `anchor` tag instead of a `button`
             */
            return (
                <div className="upload-button-wrapper">
                    <a
                        onClick={this.handleOnClick}
                        className="btn btn-default btn-sm margin-left-2px"
                        disabled={this.getUploadingFiles().length !== 0 || !!this.getUploadedFile()}>
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
                   </a>
                   {label}
                </div>
            );
        }
    });
}