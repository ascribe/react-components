'use strict';

import React from 'react';
import Router from 'react-router';

import { getLangText } from '../../utils/lang_utils';

let Link = Router.Link;

let FileDragAndDropDialog = React.createClass({
    propTypes: {
        hasFiles: React.PropTypes.bool,
        multipleFiles: React.PropTypes.bool,
        onClick: React.PropTypes.func,
        enableLocalHashing: React.PropTypes.bool
    },

    mixins: [Router.State],

    render() {
        const queryParams = this.getQuery();

        if(this.props.hasFiles) {
            return null;
        } else {
            if(this.props.enableLocalHashing && !queryParams.method) {

                let queryParamsHash = Object.assign({}, queryParams);
                queryParamsHash.method = 'hash';

                let queryParamsUpload = Object.assign({}, queryParams);
                queryParamsUpload.method = 'upload';

                return (
                    <div className="file-drag-and-drop-dialog present-options">
                        <p>{getLangText('Would you rather')}</p>
                        <Link
                            to={this.getPath()}
                            query={queryParamsHash}>
                            <span className="btn btn-default btn-sm">
                                {getLangText('Hash your work')}
                            </span>
                        </Link>

                        <span> or </span>
                       
                       <Link
                            to={this.getPath()}
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
                        <div className="file-drag-and-drop-dialog">
                            <p>{getLangText('Drag files here')}</p>
                            <p>{getLangText('or')}</p>
                            <span
                                className="btn btn-default"
                                onClick={this.props.onClick}>
                                    {getLangText('choose files to upload')}
                            </span>
                        </div>
                    );
                } else {
                    let dialog = queryParams.method === 'hash' ? getLangText('choose a file to hash') : getLangText('choose a file to upload');

                    return (
                        <div className="file-drag-and-drop-dialog">
                            <p>{getLangText('Drag a file here')}</p>
                            <p>{getLangText('or')}</p>
                            <span
                                className="btn btn-default"
                                onClick={this.props.onClick}>
                                    {dialog}
                            </span>
                        </div>
                    );
                }
            }
        }
    }
});

export default FileDragAndDropDialog;