import * as ExtractionFunctions from '../constants/extractionFunctions';
import BaseStrategyRunner from './BaseStrategyRunner';
import { IParseStrategy } from './IParseStrategy';

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
