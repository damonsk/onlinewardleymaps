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
			let topNavHeight = document.getElementById('top-nav-wrapper')
				.clientHeight;
			let titleHeight = document.getElementById('title').clientHeight;
			return winHeight - topNavHeight - titleHeight;
		} else return winHeight - 30;
	};

	constructor(props) {
		super(props);
		this.state = {
			height: 500,
		};

		this.expressionSuggester = this.createExpressionSuggester(props);
	}

	createExpressionSuggester = props => {
		let c = props.mapObject.elements.map(_ => {
			return _.name;
		});
		return {
			elements: c,
			prefix: [
				'outsource ',
				'build ',
				'buy ',
				'component',
				'annotation',
				'annotations',
				'style',
				'evolve',
				'inertia',
				'title',
				'evolution',
			],
		};
	};

	handleResize = () => {
		this.setState({ height: this.getHeight() });
	};

	componentDidUpdate() {
		this.expressionSuggester = this.createExpressionSuggester(this.props);
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
			<div id="htmPane">
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
