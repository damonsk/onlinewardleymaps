import BaseStrategyRunner from './BaseStrategyRunner';
import * as ExtractionFunctions from '../constants/extractionFunctions';

export default class UrlExtractionStrategy {
	constructor(data) {
		this.data = data;
		this.keyword = 'url';
		this.containerName = 'urls';
		this.baseRunner = new BaseStrategyRunner(
			data,
			{
				keyword: this.keyword,
				containerName: this.containerName,
				defaultAttributes: {},
			},
			[ExtractionFunctions.setName, ExtractionFunctions.setUrl]
		);
	}

	apply() {
		return this.baseRunner.apply();
	}
}
