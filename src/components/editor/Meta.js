import React from 'react';

const Meta = () => (
    <>
    <div id="meta-alert" className="alert alert-warning" role="alert">
        Your map has meta data - <a href="#" id="showMeta">Show</a>
    </div>
    <div id="meta-container">
        <textarea className="form-control" id="meta"></textarea>
    </div>
    </>
)

export default Meta;