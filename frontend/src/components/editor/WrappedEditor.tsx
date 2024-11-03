import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-searchbox';
import 'ace-builds/src-noconflict/keybinding-vscode';
import 'ace-builds/src-noconflict/theme-dracula';
import 'ace-builds/src-noconflict/theme-eclipse';
import React, { ForwardedRef, forwardRef } from 'react';
import AceEditor, { IAceEditorProps } from 'react-ace';
import './mode-owm';

export interface WrappedEditorProps extends IAceEditorProps {
    editorRef?: ForwardedRef<AceEditor>;
}

const WrappedEditor: React.ForwardRefRenderFunction<
    AceEditor,
    WrappedEditorProps
> = ({ editorRef, ...props }, ref) => {
    return <AceEditor {...props} ref={editorRef || ref} />;
};

export default forwardRef(WrappedEditor);
