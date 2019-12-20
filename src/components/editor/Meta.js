import React from 'react';

const Meta = () => (
    <>
    <div id="meta-alert" class="alert alert-warning" role="alert">
        Your map has meta data - <a href="#" id="showMeta">Show</a>
    </div>
    <div id="meta-container">
        <textarea class="form-control" id="meta"></textarea>
    </div>
    </>
)

export default Meta;