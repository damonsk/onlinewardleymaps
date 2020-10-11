import BaseStrategyRunner from './BaseStrategyRunner';
import * as ExtractionFunctions from '../constants/extractionFunctions';

export default class EvolveExtractionStrategy {
	constructor(data) {
		const config = {
			keyword: 'evolve',
			containerName: 'evolved',
		};
		this.data = data;
		this.keyword = config.keyword;
		this.containerName = config.containerName;

		const extractionFuncs = [
			ExtractionFunctions.setLabel,
			ExtractionFunctions.setNameWithMaturity,
			ExtractionFunctions.decorators,
		];
		this.baseRunner = new BaseStrategyRunner(data, config, extractionFuncs);
	}

	apply() {
		return this.baseRunner.apply();
	}
}
