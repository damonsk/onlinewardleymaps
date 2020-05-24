import ExtendableExtractionStrategy from './ExtendableExtractionStrategy';

export default class SubMapExtractionStrategy {
	constructor(data) {
		this.data = data;
		this.parentStrategy = new ExtendableExtractionStrategy(data, {
			keyword: 'submap',
			containerName: 'submaps',
		});
	}

	apply() {
		return this.parentStrategy.apply();
	}
}
