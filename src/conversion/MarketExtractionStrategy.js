import ExtendableComponentExtractionStrategy from './ExtendableComponentExtractionStrategy';

export default class MarketExtractionStrategy {
	constructor(data) {
		const config = {
			keyword: 'market',
			containerName: 'markets',
			defaultAttributes: { increaseLabelSpacing: true },
		};
		this.data = data;
		this.keyword = config.keyword;
		this.containerName = config.containerName;
		this.parentStrategy = new ExtendableComponentExtractionStrategy(
			data,
			config
		);
	}

	apply() {
		let s = this.parentStrategy.apply();
		return s;
	}
}
