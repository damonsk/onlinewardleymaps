import ExtendableExtractionStrategy from './ExtendableExtractionStrategy';

export default class ComponentExtractionStrategy {
	constructor(data) {
		this.data = data;
		this.keyword = 'component';
		this.containerName = 'elements';
		this.parentStrategy = new ExtendableExtractionStrategy(data, {
			keyword: 'component',
			containerName: 'elements',
		});
	}

	apply() {
		return this.parentStrategy.apply();
	}
}
