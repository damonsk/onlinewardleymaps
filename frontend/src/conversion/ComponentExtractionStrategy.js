import ExtendableComponentExtractionStrategy from './ExtendableComponentExtractionStrategy';

export default class ComponentExtractionStrategy {
	constructor(data) {
		const config = {
			keyword: 'component',
			containerName: 'elements',
		};

		let lines = [];
		let toRunThrough = data.split('\n');
		let isWithinNestedContainer = false;
		for (let i = 0; i < toRunThrough.length; i++) {
			const element = toRunThrough[i];
			if (element.trim().indexOf('{') === 0) {
				isWithinNestedContainer = true;
				lines.push(' ');
			}
			if (isWithinNestedContainer && element.trim().indexOf('}') === 0) {
				isWithinNestedContainer = false;
				lines.push(' ');
			}
			if (
				isWithinNestedContainer == false &&
				element.trim().indexOf('}') === -1
			) {
				lines.push(element);
			}
		}
		const cleanedData = lines.join('\n');
		this.data = cleanedData;
		this.keyword = config.keyword;
		this.containerName = config.containerName;
		this.parentStrategy = new ExtendableComponentExtractionStrategy(
			cleanedData,
			config
		);
	}

	apply() {
		return this.parentStrategy.apply();
	}
}
