import * as ExtractionFunctions from '../constants/extractionFunctions';
import { IParseStrategy } from '../types/base';
import BaseStrategyRunner from './BaseStrategyRunner';

export default class AnchorExtractionStrategy implements IParseStrategy {
    data: string;
    keyword: string;
    containerName: string;
    baseRunner: BaseStrategyRunner;
    constructor(data: string) {
        const config = {
            keyword: 'anchor',
            containerName: 'anchors',
            defaultAttributes: {},
        };
        this.data = data;
        this.keyword = config.keyword;
        this.containerName = config.containerName;
        this.baseRunner = new BaseStrategyRunner(data, config, [
            ExtractionFunctions.setName,
            ExtractionFunctions.setCoords,
        ]);
    }

    apply() {
        return this.baseRunner.apply();
    }
}
