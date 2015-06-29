'use strict';

import React from 'react';
import ProgressBar from 'react-progressbar';

import AppConstants from '../../constants/application_constants';

let FileDragAndDropPreviewImage = React.createClass({
    propTypes: {
        progress: React.PropTypes.number,
        url: React.PropTypes.string,
        onClick: React.PropTypes.func
    },

    getInitialState() {
        return {
            loading: false
        };
    },

    onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.setState({
            loading: true
        });

        this.props.onClick(e);
    },

    render() {
        let imageStyle = {
            backgroundImage: 'url("' + this.props.url + '")',
            backgroundSize: 'cover'
        };

        let actionSymbol = this.state.loading ? <img src={AppConstants.baseUrl + 'static/img/ascribe_animated_medium.gif'} /> : <span className="glyphicon glyphicon-remove delete-file" aria-hidden="true" title="Delete or cancel upload" onClick={this.onClick} />;
        return (
            <div
                className="file-drag-and-drop-preview-image"
                style={imageStyle}>
                    <ProgressBar completed={this.props.progress} color="black"/>
                    {actionSymbol}
            </div>
        );
    }
});

export default FileDragAndDropPreviewImage;