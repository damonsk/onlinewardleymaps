import React from 'react';
import Usage from './editor/Usage';
import Controls from './editor/Controls';
import Breadcrumb from './editor/Breadcrumb';
import MapView from './editor/MapView';
import Meta from './editor/Meta';
import Editor from './editor/Editor';

function App(){
    return (
        <>
        <nav className="navbar navbar-dark"> 
            <div className="container-fluid">
                <a className="navbar-brand" href="#">
                    <h3>Online Wardley Maps</h3> 
                </a>
                <Controls />
            </div>
        </nav>

        <Breadcrumb />

        <div className="container-fluid">
            <div className="row">
                <div className="col">
                    <Editor />
                    <div className="form-group">
                        <Meta />
                        <Usage />
                    </div>
                </div>
                <MapView />
            </div>
        </div>
        </>
    )
}

export default App;