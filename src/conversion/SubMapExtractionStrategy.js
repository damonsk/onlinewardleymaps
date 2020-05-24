import ComponentExtractionStrategy from './ComponentExtractionStrategy';

export default class SubMapExtractionStrategy extends ComponentExtractionStrategy {
	constructor(data) {
		super();
		this.data = data;
		this.keyword = 'submap';
		this.containerName = 'submaps';
	}
	apply() {
		return super.apply();
	}
}
