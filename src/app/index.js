import React from 'react';
import { render } from 'react-dom';
import 'bootstrap/scss/bootstrap.scss';
import '../styles.scss';
import OfflineApp from '../components/OfflineApp';

render(<OfflineApp />, document.getElementById('app'));
