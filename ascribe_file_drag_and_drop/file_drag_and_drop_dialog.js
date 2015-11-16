'use strict';

import React from 'react';
import { Link } from 'react-router';

import { dragAndDropAvailable } from '../../../utils/feature_detection_utils';
import { getLangText } from '../../../utils/lang_utils';
import { getCurrentQueryParams } from '../../../utils/url_utils';

let FileDragAndDropDialog = React.createClass({
    propTypes: {
        hasFiles: React.PropTypes.bool,
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
                <p>{getLangText('Drag %s here', fileClass)}</p>,
                <p>{getLangText('or')}</p>
            ];
        } else {
            return null;
        }
    },

    render() {
        const {
            hasFiles,
            multipleFiles,
            enableLocalHashing,
            uploadMethod,
            fileClassToUpload,
            onClick } = this.props;

        if (hasFiles) {
            return null;
        } else {
            if (enableLocalHashing && !uploadMethod) {
                const currentQueryParams = getCurrentQueryParams();

                const queryParamsHash = Object.assign({}, currentQueryParams);
                queryParamsHash.method = 'hash';

                const queryParamsUpload = Object.assign({}, currentQueryParams);
                queryParamsUpload.method = 'upload';

                return (
                    <div className="file-drag-and-drop-dialog present-options">
                        <p>{getLangText('Would you rather')}</p>
                        <Link
                            to={window.location.pathname}
                            query={queryParamsHash}>
                            <span className="btn btn-default btn-sm">
                                {getLangText('Hash your work')}
                            </span>
                        </Link>

                        <span> or </span>

                       <Link
                            to={window.location.pathname}
                            query={queryParamsUpload}>
                            <span className="btn btn-default btn-sm">
                                {getLangText('Upload and hash your work')}
                            </span>
                        </Link>
                    </div>
                );
            } else {
                if (multipleFiles) {
                    return (
                        <span className="file-drag-and-drop-dialog">
                            {this.getDragDialog(fileClassToUpload.plural)}
                            <span
                                className="btn btn-default"
                                onClick={onClick}>
                                    {getLangText('choose %s to upload', fileClassToUpload.plural)}
                            </span>
                        </span>
                    );
                } else {
                    const dialog = uploadMethod === 'hash' ? getLangText('choose a %s to hash', fileClassToUpload.singular)
                                                           : getLangText('choose a %s to upload', fileClassToUpload.singular);

                    return (
                        <span className="file-drag-and-drop-dialog">
                            {this.getDragDialog(fileClassToUpload.singular)}
                            <span
                                className="btn btn-default"
                                onClick={onClick}>
                                    {dialog}
                            </span>
                        </span>
                    );
                }
            }
        }
    }
});

export default FileDragAndDropDialog;
