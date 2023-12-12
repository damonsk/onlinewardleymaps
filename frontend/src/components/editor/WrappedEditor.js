import React from 'react';
import AceEditor from 'react-ace';
require('./mode-owm');
require('ace-builds/src-noconflict/theme-eclipse');
require('ace-builds/src-noconflict/theme-dracula');
require('ace-builds/src-noconflict/ext-language_tools');
require('ace-builds/src-noconflict/ext-searchbox');

export default function WrappedEditor({ editorRef, ...props }) {
	return <AceEditor {...props} ref={editorRef} />;
}
