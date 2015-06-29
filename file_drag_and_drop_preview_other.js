'use strict';

import React from 'react';
import ProgressBar from 'react-progressbar';


let FileDragAndDropPreviewOther = React.createClass({
    propTypes: {
        type: React.PropTypes.string,
        progress: React.PropTypes.number,
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
        //let actionSymbol = this.state.loading ? <img src={AppConstants.baseUrl + 'static/img/ascribe_animated_medium.gif'} /> : <span className="glyphicon glyphicon-remove delete-file" aria-hidden="true" title="Delete or cancel upload" onClick={this.onClick} />;
        return (
            <div
                className="file-drag-and-drop-preview">
                <ProgressBar completed={this.props.progress} color="black"/>
                <div className="file-drag-and-drop-preview-table-wrapper">
                    <div className="file-drag-and-drop-preview-other">
                        <span className="glyphicon glyphicon-pause delete-file" aria-hidden="true" title="Delete or cancel upload"/>
                        <span>{'.' + this.props.type}</span>
                    </div>
                </div>
            </div>
        );
    }
});

export default FileDragAndDropPreviewOther;