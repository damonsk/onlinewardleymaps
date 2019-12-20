import React from 'react';

function Meta(props) {

    return(
        <>
        <div id="meta-alert" className="alert alert-warning" role="alert">
            Your map has meta data - <a href="#" id="showMeta">Show</a>
        </div>
        <div id="meta-container">
            <textarea className="form-control" id="meta" value={props.metaText}></textarea>
        </div>
        </>
    )
}

export default Meta;