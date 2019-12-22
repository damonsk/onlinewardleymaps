import React, {useState} from 'react';
var createReactClass = require('create-react-class');

function Meta(props) {

    const [showMeta, setShowMeta] = useState(false);
    const onClickAlert = function(){
        setShowMeta(!showMeta);
    }

    return (
        <>
            { props.metaText.length > 0 ? <Alert toggleMeta={onClickAlert} /> : null }
            { showMeta ? <MetaText metaText={props.metaText} /> : null }
        </>
    )
}

var Alert = createReactClass({
    render: function() {
        return (
            <>
            <div id="meta-alert" className="alert alert-warning" role="alert">
            Your map has meta data - <a onClick={() => this.props.toggleMeta(true)} id="showMeta">Show</a>
            </div>
            </>
        );
    }
});

var MetaText = createReactClass({
    render: function() {
        return (
            <>
            <div id="meta-container">
                <textarea readonly className="form-control" id="meta" value={this.props.metaText}></textarea>
            </div>
            </>
        );
    }
});

export default Meta;