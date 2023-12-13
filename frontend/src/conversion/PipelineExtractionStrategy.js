import * as ExtractionFunctions from '../constants/extractionFunctions';
import PipelineStrategyRunner from './PipelineStrategyRunner';

export default class PipelineExtractionStrategy {
	constructor(data) {
		this.data = data;
		this.keyword = 'pipeline';
		this.containerName = 'pipelines';
		this.baseRunner = new PipelineStrategyRunner(
			data,
			{
				keyword: this.keyword,
				containerName: this.containerName,
				defaultAttributes: {},
			},
			[ExtractionFunctions.setName, ExtractionFunctions.setPipelineMaturity],
			[
				ExtractionFunctions.setName,
				ExtractionFunctions.setPipelineComponentMaturity,
			]
		);
	}

	apply() {
		return this.baseRunner.apply();
	}
}
