import React, { Component } from 'react';
import AceEditor from 'react-ace';
import 'brace/ext/language_tools';

class Editor extends Component {
	customAceEditorCompleter = ref => {
		return {
			getCompletions: function(editor, session, pos, prefix, callback) {
				var components = ref.expressionSuggester.elements.map(item => {
					return { name: item, value: item, score: 1, meta: 'owm' };
				});
				var prefixes = ref.expressionSuggester.prefix.map(item => {
					return { name: item, value: item, score: 1, meta: 'owm' };
				});

				callback(null, prefixes.concat(components));
			},
		};
	};

	getHeight = () => {
		let winHeight = window.innerHeight;
		let topNavHeight =
			document.getElementById('top-nav-wrapper').clientHeight + 15;
		let titleHeight = document.getElementById('title').clientHeight;
		return winHeight - topNavHeight - titleHeight;
	};

	constructor(props) {
		super(props);
		this.state = {
			height: 500,
		};

		this.gotoLine = this.gotoLine.bind(this);
		this.aceEditor = React.createRef();
		this.expressionSuggester = this.createExpressionSuggester(
			props.mapComponents.concat(this.props.mapAnchors)
		);
	}

	createExpressionSuggester = mapComponents => {
		let c = mapComponents.map(_ => {
			return _.name;
		});
		return {
			elements: c,
			prefix: [
				'outsource <component>',
				'build <component>',
				'buy <component>',
				'component',
				'component <name>',
				'component <name> [<visility>, <maturity>]',
				'anchor',
				'annotation',
				'annotations',
				'style',
				'style wardley',
				'style colour',
				'style handwritten',
				'style plain',
				'evolve',
				'inertia',
				'pipeline',
				'note',
				'note <note text>',
				'note <note text> [<visility>, <maturity>]',
				'title',
				'evolution',
				'y-axis Label->Min->Max',
			],
		};
	};

	handleResize = () => {
		this.setState({ height: this.getHeight() });
	};

	componentDidUpdate(prevProps) {
		this.expressionSuggester = this.createExpressionSuggester(
			this.props.mapComponents.concat(this.props.mapAnchors)
		);

		if (prevProps.highlightLine != this.props.highlightLine) {
			this.gotoLine(this.props.highlightLine);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	componentDidMount() {
		this.setState({ height: this.getHeight() });
		if (typeof window !== 'undefined') {
			window.addEventListener('resize', this.handleResize);
		}
	}

	gotoLine(line) {
		const reactAceComponent = this.aceEditor.current;
		const editor = reactAceComponent.editor;
		editor.gotoLine(parseInt(line));
	}

	render() {
		return (
			<div id="htmPane" className={this.props.invalid ? ' invalid' : ''}>
				<AceEditor
					ref={this.aceEditor}
					mode="owm"
					theme={'eclipse'}
					onChange={this.props.mutateMapText}
					name="htmEditor"
					value={this.props.mapText}
					showGutter={false}
					width={''}
					height={this.state.height + 'px'}
					className="jumbotron"
					showPrintMargin={false}
					editorProps={{ $blockScrolling: true }}
					setOptions={{
						enableBasicAutocompletion: [this.customAceEditorCompleter(this)],
						enableLiveAutocompletion: true,
					}}
				/>
			</div>
		);
	}
}

export default Editor;
