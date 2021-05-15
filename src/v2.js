// polyfill for flat < node 11
import 'core-js/features/array/flat';

import React from 'react';
import { render } from 'react-dom';
import 'bootstrap/scss/bootstrap.scss';
import './styles.scss';
import App from './components/App';

render(<App />, document.getElementById('root'));
