import BaseStrategyRunner from './BaseStrategyRunner';
import * as ExtractionFunctions from '../constants/extractionFunctions';

export default class AnnotationExtractionStrategy {
	constructor(data) {
		this.data = data;
		this.keyword = 'annotation';
		this.containerName = 'annotations';

		const extractionFuncs = [
			ExtractionFunctions.setNumber,
			ExtractionFunctions.setOccurances,
			ExtractionFunctions.setTextFromEnding,
		];
		this.baseRunner = new BaseStrategyRunner(
			data,
			{
				keyword: this.keyword,
				containerName: this.containerName,
			},
			extractionFuncs
		);
	}

	addDecorator(fn) {
		this.baseRunner.addDecorator(fn);
	}

	apply() {
		let result = this.baseRunner.apply();
		let unpack = result[this.containerName];
		let returnables = unpack.filter(a => a.occurances.length > 0);
		return { [this.containerName]: returnables };
	}
}
