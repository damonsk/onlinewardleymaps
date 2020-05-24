import ExtractLocation from './ExtractLocation';
import ParseError from './ParseError';

export default class AnnotationExtractionStrategy {
	constructor(data) {
		this.data = data;
	}

	extractLocation(input, defaultValue) {
		return new ExtractLocation().extract(input, defaultValue);
	}

	apply() {
		if (this.data.trim().length < 1) return [];
		let lines = this.data.trim().split('\n');
		var annotationsArray = [];
		for (let i = 0; i < lines.length; i++) {
			try {
				const element = lines[i];
				if (element.trim().indexOf('annotation ') === 0) {
					let number = parseInt(
						element
							.split('annotation ')[1]
							.trim()
							.split(' [')[0]
							.trim()
					);
					let positionData = [];
					if (element.replace(/\s/g, '').indexOf('[[') > -1) {
						let justOccurances =
							'[' +
							element
								.replace(/\s/g, '')
								.split('[[')[1]
								.split(']]')[0] +
							']';
						let occurancesAsArray = justOccurances
							.replace(/\],\[/g, ']|[')
							.split('|');
						occurancesAsArray.forEach(e => {
							positionData.push(this.extractLocation(e));
						});
					} else if (element.indexOf('[') > -1 && element.indexOf(']') > -1) {
						positionData.push(
							this.extractLocation(element, { visibility: 0.9, maturity: 0.1 })
						);
					}
					let text = '';
					if (
						element.trim().indexOf(']') > -1 &&
						element.trim().indexOf(']') !== element.trim().length - 1
					) {
						if (element.replace(/\s/g, '').indexOf(']]') === -1) {
							text = element.split(']')[1].trim();
						}
						if (element.replace(/\s/g, '').indexOf(']]') > -1) {
							var pos = element.lastIndexOf(']');
							text = element.substr(pos + 1, element.length - 1).trim();
						}
					}
					if (positionData.length > 0) {
						annotationsArray.push({
							number: parseInt(number),
							occurances: positionData,
							text: text,
							line: 1 + i,
						});
					}
				}
			} catch (err) {
				throw new ParseError(i);
			}
		}
		return { annotations: annotationsArray };
	}
}
