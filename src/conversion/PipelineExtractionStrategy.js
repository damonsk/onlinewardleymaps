import BaseStrategyRunner from './BaseStrategyRunner';
import * as ExtractionFunctions from '../constants/extractionFunctions';

export default class PipelineExtractionStrategy {
	constructor(data) {
		this.data = data;
		this.keyword = 'pipeline';
		this.containerName = 'pipelines';
		this.baseRunner = new BaseStrategyRunner(
			data,
			{
				keyword: this.keyword,
				containerName: this.containerName,
			},
			[ExtractionFunctions.setName, ExtractionFunctions.setPipelineMaturity]
		);
	}

	addDecorator(fn) {
		this.baseRunner.addDecorator(fn);
	}

	apply() {
		return this.baseRunner.apply();
	}
}
