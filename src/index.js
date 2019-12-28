import React from 'react';
import { render } from 'react-dom';
import 'bootstrap/scss/bootstrap.scss';
import './styles.scss';
import App from './components/App';
import { owmBuild } from './version';

render(<App />, document.getElementById('app'));

render(<>{owmBuild}</>, document.getElementById('build'));
