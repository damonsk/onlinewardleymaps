import * as ExtractionFunctions from '../constants/extractionFunctions';
import {IParseStrategy, IProvideFeatureSwitches} from '../types/base';
import BaseStrategyRunner from './BaseStrategyRunner';
import PipelineStrategyRunner from './PipelineStrategyRunner';

export default class PipelineExtractionStrategy implements IParseStrategy {
    data: string;
    keyword: string;
    containerName: string;
    baseRunner: IParseStrategy;
    constructor(data: string, featureSwitches: IProvideFeatureSwitches) {
        this.data = data;
        this.keyword = 'pipeline';
        this.containerName = 'pipelines';

        if (featureSwitches.enableNewPipelines) {
            this.baseRunner = new PipelineStrategyRunner(
                data,
                {
                    keyword: this.keyword,
                    containerName: this.containerName,
                    defaultAttributes: {increaseLabelSpacing: 0},
                },
                [ExtractionFunctions.setName, ExtractionFunctions.setPipelineMaturity],
                [ExtractionFunctions.setName, ExtractionFunctions.setPipelineComponentMaturity, ExtractionFunctions.setLabel],
            );
        } else {
            this.baseRunner = new BaseStrategyRunner(
                data,
                {
                    keyword: this.keyword,
                    containerName: this.containerName,
                    defaultAttributes: {increaseLabelSpacing: 0},
                },
                [ExtractionFunctions.setName, ExtractionFunctions.setPipelineMaturity],
            );
        }
    }

    apply() {
        return this.baseRunner.apply();
    }
}
