import ExtendableComponentExtractionStrategy from './ExtendableComponentExtractionStrategy';

export default class ComponentExtractionStrategy {
	constructor(data) {
		const config = {
			keyword: 'component',
			containerName: 'elements',
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
		return this.parentStrategy.apply();
	}
}
