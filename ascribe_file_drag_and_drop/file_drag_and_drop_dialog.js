'use strict';

import React from 'react';
import { Link } from 'react-router';

import { dragAndDropAvailable } from '../../../utils/feature_detection_utils';
import { getLangText } from '../../../utils/lang_utils';
import { getCurrentQueryParams } from '../../../utils/url_utils';

let FileDragAndDropDialog = React.createClass({
    propTypes: {
        multipleFiles: React.PropTypes.bool,
        enableLocalHashing: React.PropTypes.bool,
        uploadMethod: React.PropTypes.string,
        onClick: React.PropTypes.func,

        // A class of a file the user has to upload
        // Needs to be defined both in singular as well as in plural
        fileClassToUpload: React.PropTypes.shape({
            singular: React.PropTypes.string,
            plural: React.PropTypes.string
        })
    },

    getDragDialog(fileClass) {
        if (dragAndDropAvailable) {
            return [
                <p className="file-drag-and-drop-dialog-title">{getLangText('Drag %s here', fileClass)}</p>,
                <p>{getLangText('or')}</p>
            ];
        } else {
            return null;
        }
    },

    render() {
        const {
            multipleFiles,
            enableLocalHashing,
            uploadMethod,
            fileClassToUpload,
            onClick } = this.props;
        let dialogElement;

        if (enableLocalHashing && !uploadMethod) {
            const currentQueryParams = getCurrentQueryParams();

            const queryParamsHash = Object.assign({}, currentQueryParams);
            queryParamsHash.method = 'hash';

            const queryParamsUpload = Object.assign({}, currentQueryParams);
            queryParamsUpload.method = 'upload';

            dialogElement = (
                <div className="present-options">
                    <p className="file-drag-and-drop-dialog-title">{getLangText('Would you rather')}</p>
                    {/*
                        The frontend in live is hosted under /app,
                        Since `Link` is appending that base url, if its defined
                        by itself, we need to make sure to not set it at this point.
                        Otherwise it will be appended twice.
                    */}
                    <Link
                        to={`/${window.location.pathname.split('/').pop()}`}
                        query={queryParamsHash}>
                        <span className="btn btn-default btn-sm">
                            {getLangText('Hash your work')}
                        </span>
                    </Link>

                    <span> {getLangText('or')} </span>

                   <Link
                        to={`/${window.location.pathname.split('/').pop()}`}
                        query={queryParamsUpload}>
                        <span className="btn btn-default btn-sm">
                            {getLangText('Upload and hash your work')}
                        </span>
                    </Link>
                </div>
            );
        } else {
            if (multipleFiles) {
                dialogElement = [
                    this.getDragDialog(fileClassToUpload.plural),
                    (<span
                        key='mutlipleFilesBtn'
                        className="btn btn-default"
                        onClick={onClick}>
                            {getLangText('choose %s to upload', fileClassToUpload.plural)}
                    </span>)
                ];
            } else {
                const dialog = uploadMethod === 'hash' ? getLangText('choose a %s to hash', fileClassToUpload.singular)
                                                       : getLangText('choose a %s to upload', fileClassToUpload.singular);

                dialogElement = [
                    this.getDragDialog(fileClassToUpload.singular),
                    (<span
                        key='singleFileBtn'
                        className="btn btn-default"
                        onClick={onClick}>
                            {dialog}
                    </span>)
                ];
            }
        }

        return (
            <div className="file-drag-and-drop-dialog">
                <div className="hidden-print">
                    {dialogElement}
                </div>
                {/* Hide the uploader and just show that there's been on files uploaded yet when printing */}
                <p className="text-align-center visible-print">
                    {getLangText('No files uploaded')}
                </p>
            </div>
        );
    }
});

export default FileDragAndDropDialog;
