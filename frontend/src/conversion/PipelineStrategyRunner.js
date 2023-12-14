import ParseError from './ParseError';
import merge from 'lodash.merge';
export default class PipelineStrategyRunner {
	constructor(data, config, decorators, childDecorators) {
		this.data = data;
		this.keyword = config.keyword;
		this.childKeyword = 'pipelinecomponent';
		this.containerName = config.containerName;
		this.config = config;
		this.decorators =
			decorators !== null && decorators !== undefined ? decorators : [];
		this.childDecorators = childDecorators;
	}

	apply() {
		let lines = this.data.split('\n');
		let elementsToReturn = [];
		let errors = [];
		for (let i = 0; i < lines.length; i++) {
			try {
				const element = lines[i];
				if (element.trim().indexOf(`${this.keyword} `) === 0) {
					let baseElement = merge(
						{
							id: 1 + i,
							line: 1 + i,
						},
						this.config.defaultAttributes
					);
					this.decorators.forEach(f =>
						f(baseElement, element, {
							keyword: this.keyword,
							containerName: this.containerName,
							config: this.config,
						})
					);
					// do some funky stuff to see if there are any immediate pipeline components.  Cancel and return if we hit a pipeline.
					const scanForPipelineComponents = (
						allLines,
						startingIndex,
						elementToMutate,
						decorators
					) => {
						let childComponents = [];
						for (let j = 1 + startingIndex; j < allLines.length; j++) {
							if (allLines[j].trim().indexOf(`${this.keyword} `) === 0) {
								break; //we hit a new pipeline, stop extracting
							}
							if (allLines[j].trim().indexOf(`${this.childKeyword} `) === 0) {
								let pipelineComponent = merge(
									{
										id: 1 + i + '-' + j,
										line: 1 + j,
									},
									this.config.defaultAttributes
								);
								decorators.forEach(f => {
									f(pipelineComponent, allLines[j], {
										keyword: this.childKeyword,
									});
								});
								childComponents.push(pipelineComponent);
							}
						}
						elementToMutate = merge(elementToMutate, {
							components: childComponents,
						});
					};
					scanForPipelineComponents(
						lines,
						i,
						baseElement,
						this.childDecorators
					);

					if (baseElement.components.length > 0) {
						// now, find the most left and most right child components, overwrite the pipeline maturities.
						let mostLeft = 1;
						let mostRight = 0;
						for (let j = 0; j < baseElement.components.length; j++) {
							const child = baseElement.components[j];
							if (child.maturity < mostLeft) {
								mostLeft = child.maturity;
							}
							if (child.maturity > mostRight) {
								mostRight = child.maturity;
							}
						}
						baseElement.maturity1 = mostLeft;
						baseElement.maturity2 = mostRight;
						baseElement.hidden = false;
					}
					elementsToReturn.push(baseElement);
				}
			} catch (l) {
				// eslint-disable-next-line no-unused-expressions
				errors.push[new ParseError(i)];
			}
		}
		return { [this.containerName]: elementsToReturn, errors: errors };
	}
}
