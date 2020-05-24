import BaseStrategyRunner from './BaseStrategyRunner';
import * as ExtractionFunctions from '../constants/extractionFunctions';

export default class AnchorExtractionStrategy {
	constructor(data) {
		this.data = data;
		this.keyword = 'anchor';
		this.containerName = 'anchors';
		this.baseRunner = new BaseStrategyRunner(
			data,
			{
				keyword: this.keyword,
				containerName: this.containerName,
			},
			[ExtractionFunctions.setName, ExtractionFunctions.setCoords]
		);
	}

	addDecorator(fn) {
		this.baseRunner.addDecorator(fn);
	}

	apply() {
		return this.baseRunner.apply();
	}
}
