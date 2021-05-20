import React, { useEffect, useRef, useState } from 'react';
import AceEditor from 'react-ace';
import 'brace/ext/language_tools';
import { EditorPrefixes } from '../../constants/editorPrefixes';

function Editor(props) {
	const [height, setHeight] = useState(10);
	const [editorCompletions, setEditorCompletions] = useState({
		prefix: EditorPrefixes,
		elements: [],
	});
	const aceEditor = useRef(null);

	const customAceEditorCompleter = ed => {
		return {
			getCompletions: function(editor, session, pos, prefix, callback) {
				let components = ed.elements.map(item => {
					return { name: item, value: item, score: 1, meta: 'owm' };
				});
				let prefixes = ed.prefix.map(item => {
					return { name: item, value: item, score: 1, meta: 'owm' };
				});

				callback(null, prefixes.concat(components));
			},
		};
	};

	useEffect(() => {
		const getHeight = () => {
			var winHeight = window.innerHeight;
			var topNavHeight = document.getElementById('top-nav-wrapper')
				.clientHeight;
			var titleHeight = document.getElementById('title').clientHeight;
			return winHeight - topNavHeight - titleHeight + 10;
		};

		const handleResize = () => {
			setHeight(getHeight());
		};

		window.addEventListener('load', handleResize);
		window.addEventListener('resize', handleResize);
		return function cleanup() {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('load', handleResize);
		};
	}, []);

	useEffect(() => {
		gotoLine(props.highlightLine);
	}, [props.highlightLine]);

	useEffect(() => {
		const reactAceComponent = aceEditor.current;
		const editor = reactAceComponent.editor;
		for (var x = 0; x < editor.session.getLength(); x++) {
			editor.session.removeGutterDecoration(x, 'ace_error');
		}
		if (props.errorLine.length > 0) {
			props.errorLine.forEach(e =>
				editor.session.addGutterDecoration(e, 'ace_error')
			);
		}
	}, [props.errorLine]);

	useEffect(() => {
		setEditorCompletions(
			createExpressionSuggester(
				props.mapComponents
					.concat(props.mapAnchors)
					.concat(props.mapSubMaps)
					.concat(props.mapMarkets)
			)
		);
	}, [
		props.mapComponents,
		props.mapAnchors,
		props.mapSubMaps,
		props.mapMarkets,
	]);

	useEffect(() => {
		const reactAceComponent = aceEditor.current;
		const editor = reactAceComponent.editor;
		editor.completers = [customAceEditorCompleter(editorCompletions)];
	}, [editorCompletions]);

	const createExpressionSuggester = mapComponents => {
		let c = mapComponents.map(_ => {
			return _.name;
		});
		return {
			elements: c,
			prefix: EditorPrefixes,
		};
	};

	const gotoLine = line => {
		const reactAceComponent = aceEditor.current;
		const editor = reactAceComponent.editor;
		editor.gotoLine(parseInt(line));
	};

	return (
		<div id="htmPane" className={props.invalid ? ' invalid' : ''}>
			<AceEditor
				ref={aceEditor}
				mode="owm"
				theme={'eclipse'}
				onChange={props.mutateMapText}
				name="htmEditor"
				value={props.mapText}
				showGutter={props.showLineNumbers || props.errorLine.length > 0}
				width={''}
				height={height + 'px'}
				className="jumbotron"
				showPrintMargin={false}
				debounceChangePeriod={500}
				editorProps={{ $blockScrolling: true }}
				setOptions={{
					showLineNumbers: props.showLineNumbers,
					enableBasicAutocompletion: [
						customAceEditorCompleter(editorCompletions),
					],
					enableLiveAutocompletion: true,
				}}
			/>
		</div>
	);
}

export default Editor;
