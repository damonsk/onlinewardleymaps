import React from 'react';
import AceEditor from 'react-ace';
require('./mode-owm');
require('ace-builds/src-noconflict/theme-eclipse');
require('ace-builds/src-noconflict/ext-language_tools');

export default function WrappedEditor({ editorRef, ...props }) {
	return <AceEditor {...props} ref={editorRef} />;
}
