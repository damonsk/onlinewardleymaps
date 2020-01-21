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
		if (this.props.operatingMode == 'browser') {
			let topNavHeight =
				document.getElementById('top-nav-wrapper').clientHeight + 15;
			let titleHeight = document.getElementById('title').clientHeight;
			return winHeight - topNavHeight - titleHeight;
		} else return winHeight - 30;
	};

	constructor(props) {
		super(props);
		this.state = {
			height: 500,
		};

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
				'title',
				'evolution',
				'y-axis Label->Min->Max',
			],
		};
	};

	handleResize = () => {
		this.setState({ height: this.getHeight() });
	};

	componentDidUpdate() {
		this.expressionSuggester = this.createExpressionSuggester(
			this.props.mapComponents.concat(this.props.mapAnchors)
		);
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

	render() {
		return (
			<div id="htmPane" className={this.props.invalid ? ' invalid' : ''}>
				<AceEditor
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
