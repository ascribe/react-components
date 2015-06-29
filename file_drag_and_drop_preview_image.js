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
            paused: false
        };
    },

    /*onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.setState({
            loading: true
        });

        this.props.onClick(e);
    },*/

    toggleUploadProcess(e) {
        e.preventDefault();
        e.stopPropagation();

        this.setState({
            paused: true
        });
    },

    render() {
        let imageStyle = {
            backgroundImage: 'url("' + this.props.url + '")',
            backgroundSize: 'cover'
        };

        //let actionSymbol = this.state.loading ? <img src={AppConstants.baseUrl + 'static/img/ascribe_animated_medium.gif'} /> : <span className="glyphicon glyphicon-remove delete-file" aria-hidden="true" title="Delete or cancel upload" onClick={this.onClick} />;
        let actionSymbol = this.state.paused ? <span className="glyphicon glyphicon-pause action-file" aria-hidden="true" title="Pause upload" onClick={this.toggleUploadProcess}/> : <span className="glyphicon glyphicon-play action-file" aria-hidden="true" title="Pause upload" onClick={this.toggleUploadProcess}/>
        return (
            <div
                className="file-drag-and-drop-preview-image"
                style={imageStyle}>
                    <ProgressBar completed={this.props.progress} color="black"/>
                    
            </div>
        );
    }
});

export default FileDragAndDropPreviewImage;