import ExtendableComponentExtractionStrategy from './ExtendableComponentExtractionStrategy';

export default class ComponentExtractionStrategy {
	constructor(data) {
		this.data = data;
		this.keyword = 'component';
		this.containerName = 'elements';
		this.parentStrategy = new ExtendableComponentExtractionStrategy(data, {
			keyword: 'component',
			containerName: 'elements',
		});
	}

	apply() {
		return this.parentStrategy.apply();
	}
}
