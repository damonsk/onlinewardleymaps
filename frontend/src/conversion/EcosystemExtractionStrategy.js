import ExtendableComponentExtractionStrategy from './ExtendableComponentExtractionStrategy';

export default class EcosystemExtractionStrategy {
	constructor(data) {
		const config = {
			keyword: 'ecosystem',
			containerName: 'ecosystems',
			defaultAttributes: { increaseLabelSpacing: 3 },
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
