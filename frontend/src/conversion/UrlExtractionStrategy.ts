import * as ExtractionFunctions from '../constants/extractionFunctions';
import BaseStrategyRunner from './BaseStrategyRunner';
import { IParseStrategy } from './IParseStrategy';

export default class UrlExtractionStrategy implements IParseStrategy {
    data: string;
    keyword: string;
    containerName: string;
    baseRunner: BaseStrategyRunner;
    constructor(data: string) {
        this.data = data;
        this.keyword = 'url';
        this.containerName = 'urls';
        this.baseRunner = new BaseStrategyRunner(
            data,
            {
                keyword: this.keyword,
                containerName: this.containerName,
                defaultAttributes: {},
            },
            [ExtractionFunctions.setName, ExtractionFunctions.setUrl],
        );
    }

    apply() {
        return this.baseRunner.apply();
    }
}
