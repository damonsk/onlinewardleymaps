import React from 'react';
import { render } from 'react-dom';
import 'bootstrap/scss/bootstrap.scss';
import './styles.scss';
import './page';
import App from './components/App';


render(
    <App />, 
    document.getElementById("usage")
);