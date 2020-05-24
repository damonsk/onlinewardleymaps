import BaseStrategyRunner from './BaseStrategyRunner';
import * as ExtractionFunctions from '../constants/extractionFunctions';

export default class ExtendableComponentExtractionStrategy {
	constructor(data, config) {
		this.data = data;
		this.keyword = config.keyword;
		this.containerName = config.containerName;

		const extractionFuncs = [
			ExtractionFunctions.setCoords,
			ExtractionFunctions.setName,
			ExtractionFunctions.setInertia,
			ExtractionFunctions.setLabel,
			ExtractionFunctions.setEvolve,
		];
		this.baseRunner = new BaseStrategyRunner(data, config, extractionFuncs);
	}

	addDecorator(fn) {
		this.baseRunner.addDecorator(fn);
	}

	apply() {
		return this.baseRunner.apply();
	}
}
