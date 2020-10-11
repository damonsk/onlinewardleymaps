import BaseStrategyRunner from './BaseStrategyRunner';
import * as ExtractionFunctions from '../constants/extractionFunctions';

export default class ExtendableComponentExtractionStrategy {
	constructor(data, config, additionalExtractions) {
		this.data = data;
		this.keyword = config.keyword;
		this.containerName = config.containerName;

		let extractionFuncs = [
			ExtractionFunctions.decorators,
			ExtractionFunctions.setCoords,
			ExtractionFunctions.setName,
			ExtractionFunctions.setInertia,
			ExtractionFunctions.setLabel,
			ExtractionFunctions.setEvolve,
		];

		if (
			(additionalExtractions !== null) &
			(additionalExtractions !== undefined)
		) {
			extractionFuncs = additionalExtractions.concat(extractionFuncs);
		}

		this.baseRunner = new BaseStrategyRunner(data, config, extractionFuncs);
	}

	apply() {
		return this.baseRunner.apply();
	}
}
