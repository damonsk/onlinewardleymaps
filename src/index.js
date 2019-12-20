import React from 'react';
import { render } from 'react-dom';
import 'bootstrap/scss/bootstrap.scss';
import './styles.scss';
import './page';
import Usage from './components/editor/Usage';
import Controls from './components/editor/Controls';
import Breadcrumb from './components/editor/Breadcrumb';
import MapView from './components/editor/MapView';
import Meta from './components/editor/Meta';


render(
    <MapView />,
    document.getElementById("mapControl")
);

render(
    <Usage />, 
    document.getElementById("usageControl")
);

render(
    <Controls />,
    document.getElementById("controlsMenuControl")
);

render(
    <Breadcrumb />,
    document.getElementById("breadcrumbControl")
);

render(
    <Meta />,
    document.getElementById("metaControl")
);

