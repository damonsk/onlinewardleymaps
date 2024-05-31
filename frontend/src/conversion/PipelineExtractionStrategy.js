import * as ExtractionFunctions from '../constants/extractionFunctions';
import PipelineStrategyRunner from './PipelineStrategyRunner';
import BaseStrategyRunner from './BaseStrategyRunner';

export default class PipelineExtractionStrategy {
	constructor(data, featureSwitches) {
		this.data = data;
		this.keyword = 'pipeline';
		this.containerName = 'pipelines';

		if (featureSwitches.enableNewPipelines) {
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
					ExtractionFunctions.setLabel,
				]
			);
		} else {
			this.baseRunner = new BaseStrategyRunner(
				data,
				{
					keyword: this.keyword,
					containerName: this.containerName,
					defaultAttributes: {},
				},
				[ExtractionFunctions.setName, ExtractionFunctions.setPipelineMaturity]
			);
		}
	}

	apply() {
		return this.baseRunner.apply();
	}
}
