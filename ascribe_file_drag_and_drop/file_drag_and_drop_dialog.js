'use strict';

import React from 'react';
import { Link } from 'react-router';

import { getLangText } from '../../../utils/lang_utils';
import { dragAndDropAvailable } from '../../../utils/feature_detection_utils';



let FileDragAndDropDialog = React.createClass({
    propTypes: {
        hasFiles: React.PropTypes.bool,
        multipleFiles: React.PropTypes.bool,
        onClick: React.PropTypes.func,
        enableLocalHashing: React.PropTypes.bool,

        // A class of a file the user has to upload
        // Needs to be defined both in singular as well as in plural
        fileClassToUpload: React.PropTypes.shape({
            singular: React.PropTypes.string,
            plural: React.PropTypes.string
        }),

        location: React.PropTypes.object
    },

    getDragDialog(fileClass) {
        if(dragAndDropAvailable) {
            return [
                <p>{getLangText('Drag %s here', fileClass)}</p>,
                <p>{getLangText('or')}</p>
            ];
        } else {
            return null;
        }
    },

    render() {
        const queryParams = this.props.location.query;

        if(this.props.hasFiles) {
            return null;
        } else {
            if(this.props.enableLocalHashing && !queryParams.method) {

                let queryParamsHash = Object.assign({}, queryParams);
                queryParamsHash.method = 'hash';

                let queryParamsUpload = Object.assign({}, queryParams);
                queryParamsUpload.method = 'upload';

                let { location } = this.props;

                return (
                    <div className="file-drag-and-drop-dialog present-options">
                        <p>{getLangText('Would you rather')}</p>
                        <Link
                            to={location.pathname}
                            query={queryParamsHash}>
                            <span className="btn btn-default btn-sm">
                                {getLangText('Hash your work')}
                            </span>
                        </Link>

                        <span> or </span>
                       
                       <Link
                            to={location.pathname}
                            query={queryParamsUpload}>
                            <span className="btn btn-default btn-sm">
                                {getLangText('Upload and hash your work')}
                            </span>
                        </Link>
                    </div>
                );
            } else {
                if(this.props.multipleFiles) {
                    return (
                        <span className="file-drag-and-drop-dialog">
                            {this.getDragDialog(this.props.fileClassToUpload.plural)}
                            <span
                                className="btn btn-default"
                                onClick={this.props.onClick}>
                                    {getLangText('choose %s to upload', this.props.fileClassToUpload.plural)}
                            </span>
                        </span>
                    );
                } else {
                    let dialog = queryParams.method === 'hash' ? getLangText('choose a %s to hash', this.props.fileClassToUpload.singular) : getLangText('choose a %s to upload', this.props.fileClassToUpload.singular);

                    return (
                        <span className="file-drag-and-drop-dialog">
                            {this.getDragDialog(this.props.fileClassToUpload.singular)}
                            <span
                                className="btn btn-default"
                                onClick={this.props.onClick}>
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