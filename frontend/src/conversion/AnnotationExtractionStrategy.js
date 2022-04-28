import BaseStrategyRunner from './BaseStrategyRunner';
import * as ExtractionFunctions from '../constants/extractionFunctions';

export default class AnnotationExtractionStrategy {
	constructor(data) {
		const config = {
			keyword: 'annotation',
			containerName: 'annotations',
			defaultAttributes: {},
		};
		this.data = data;
		this.keyword = config.keyword;
		this.containerName = config.containerName;

		const extractionFuncs = [
			ExtractionFunctions.setNumber,
			ExtractionFunctions.setOccurances,
			ExtractionFunctions.setTextFromEnding,
		];
		this.baseRunner = new BaseStrategyRunner(data, config, extractionFuncs);
	}

	apply() {
		let result = this.baseRunner.apply();
		let unpack = result[this.containerName];
		let returnables = unpack.filter(a => a.occurances.length > 0);
		return { [this.containerName]: returnables };
	}
}
