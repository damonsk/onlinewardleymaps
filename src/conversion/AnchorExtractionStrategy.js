import BaseStrategyRunner from './BaseStrategyRunner';
import * as ExtractionFunctions from '../constants/extractionFunctions';

export default class AnchorExtractionStrategy {
	constructor(data) {
		const config = {
			keyword: 'anchor',
			containerName: 'anchors',
			defaultAttributes: {},
		};
		this.data = data;
		this.keyword = config.keyword;
		this.containerName = config.containerName;
		this.baseRunner = new BaseStrategyRunner(data, config, [
			ExtractionFunctions.setName,
			ExtractionFunctions.setCoords,
		]);
	}

	apply() {
		return this.baseRunner.apply();
	}
}
