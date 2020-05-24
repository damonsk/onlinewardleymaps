import ParseError from './ParseError';

export default class XAxisLabelsExtractionStrategy {
	constructor(data) {
		this.data = data;
	}
	apply() {
		let lines = this.data.trim().split('\n');
		for (let i = 0; i < lines.length; i++) {
			const element = lines[i];
			try {
				if (element.trim().indexOf('evolution') === 0) {
					let name = element
						.split('evolution ')[1]
						.trim()
						.split('->');
					return {
						evolution: [
							{ line1: name[0], line2: '' },
							{ line1: name[1], line2: '' },
							{ line1: name[2], line2: '' },
							{ line1: name[3], line2: '' },
						],
					};
				}
			} catch (err) {
				throw new ParseError(i);
			}
		}
		return {
			evolution: [
				{ line1: 'Genesis', line2: '' },
				{ line1: 'Custom-Built', line2: '' },
				{ line1: 'Product', line2: '(+rental)' },
				{ line1: 'Commodity', line2: '(+utility)' },
			],
		};
	}
}
