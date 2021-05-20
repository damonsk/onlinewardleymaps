import ParseError from './ParseError';
import merge from 'lodash.merge';
export default class BaseStrategyRunner {
	constructor(data, config, decorators) {
		this.data = data;
		this.keyword = config.keyword;
		this.containerName = config.containerName;
		this.config = config;
		this.decorators =
			decorators !== null && decorators !== undefined ? decorators : [];
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
					elementsToReturn.push(baseElement);
				}
			} catch {
				// eslint-disable-next-line no-unused-expressions
				errors.push[new ParseError(i)];
			}
		}
		return { [this.containerName]: elementsToReturn, errors: errors };
	}
}
