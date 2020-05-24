import ExtendableComponentExtractionStrategy from './ExtendableComponentExtractionStrategy';

export default class SubMapExtractionStrategy {
	constructor(data) {
		this.data = data;
		this.parentStrategy = new ExtendableComponentExtractionStrategy(data, {
			keyword: 'submap',
			containerName: 'submaps',
		});
	}

	apply() {
		return this.parentStrategy.apply();
	}
}
