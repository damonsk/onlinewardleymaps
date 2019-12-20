import React, { Component } from "react";
import AceEditor from 'react-ace';

class Editor extends Component {

    constructor(props) {
        super(props)
        this.state = {
            width: 0
        }
    }

    componentDidMount() {
        const width = document.getElementById('htmPane').parentNode.clientWidth;
        this.setState({ width });
    }

    render() {
        return (
            <div id="htmPane">
                    <AceEditor
                        mode="owm"
                        theme="ace/theme/chrimson"
                        onChange={this.props.mutateMapText}
                        name="htmEditor"
                        value={this.props.mapText}
                        showGutter= {false}
                        width=""
                        className="jumbotron"  
                        showPrintMargin= {false}
                        editorProps={{ $blockScrolling: true }}
                    />
            </div>
        )
    }
}

export default Editor;