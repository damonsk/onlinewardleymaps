import ParseError from './ParseError';

export default class MethodExtractionStrategy {
	constructor(data) {
		this.data = data;
	}
	apply() {
		let lines = this.data.trim().split('\n');
		let methodElements = [];
		for (let i = 0; i < lines.length; i++) {
			try {
				const element = lines[i];
				if (element.trim().indexOf('outsource ') === 0) {
					let name = element.split('outsource ')[1].trim();
					if (name.length > 0) {
						methodElements.push({
							name: name,
							method: 'outsource',
							line: 1 + i,
						});
					}
				} else if (element.trim().indexOf('build ') === 0) {
					let name = element.split('build ')[1].trim();
					if (name.length > 0) {
						methodElements.push({ name: name, method: 'build', line: 1 + i });
					}
				} else if (element.trim().indexOf('buy ') === 0) {
					let name = element.split('buy ')[1].trim();
					if (name.length > 0) {
						methodElements.push({ name: name, method: 'buy', line: 1 + i });
					}
				}
			} catch (err) {
				throw new ParseError(i);
			}
		}
		return { methods: methodElements };
	}
}
