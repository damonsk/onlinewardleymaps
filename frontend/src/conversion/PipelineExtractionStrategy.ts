import * as ExtractionFunctions from '../constants/extractionFunctions';
import { OwmFeatureSwitches } from '../constants/featureswitches';
import BaseStrategyRunner from './BaseStrategyRunner';
import { IParseStrategy } from './IParseStrategy';
import PipelineStrategyRunner from './PipelineStrategyRunner';

export default class PipelineExtractionStrategy implements IParseStrategy {
    data: string;
    keyword: string;
    containerName: string;
    baseRunner: IParseStrategy;
    constructor(data: string, featureSwitches: OwmFeatureSwitches) {
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
                [
                    ExtractionFunctions.setName,
                    ExtractionFunctions.setPipelineMaturity,
                ],
                [
                    ExtractionFunctions.setName,
                    ExtractionFunctions.setPipelineComponentMaturity,
                    ExtractionFunctions.setLabel,
                ],
            );
        } else {
            this.baseRunner = new BaseStrategyRunner(
                data,
                {
                    keyword: this.keyword,
                    containerName: this.containerName,
                    defaultAttributes: {},
                },
                [
                    ExtractionFunctions.setName,
                    ExtractionFunctions.setPipelineMaturity,
                ],
            );
        }
    }

    apply() {
        return this.baseRunner.apply();
    }
}
