import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import { ButtonContainer } from '../modules/buttons';

const App = React.createClass({
    render() {
        return (
            <div>
                This is going to be such a cool app you can't even imagine how awesome it's going to be
            </div>
        );
    }
});

// TODO: use ReactDOM when upgrading to React 1.4
ReactDOM.render((<App />), document.getElementById('demo-app'));
