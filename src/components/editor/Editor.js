import React, { Component } from "react";
import AceEditor from 'react-ace';

function Editor(props){

    // var htmEditor;
    // ace.require("ace/ext/language_tools");
    // ace.config.set('modePath', './scripts');
    // htmEditor = ace.edit("htmEditor");
    // htmEditor.getSession().setMode("ace/mode/owm");
    // htmEditor.setTheme("ace/theme/chrimson");
    // htmEditor.setOptions({
    //     enableBasicAutocompletion: true,
    //     enableSnippets: true,
    //     showGutter: false,
    //     wrap: true
    // });
    // htmEditor.setShowPrintMargin(false);
    // htmEditor.setHighlightActiveLine(false);


    return (
        <div id="htmPane">
            <AceEditor
                mode="owm"
                theme="ace/theme/chrimson"
                onChange={props.mutateMapText}
                name="htmEditor"
                value={props.mapText}
                editorProps={{ $blockScrolling: true }}
            />
        </div>
    )
}

export default Editor;