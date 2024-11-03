import * as ExtractionFunctions from '../constants/extractionFunctions';
import BaseStrategyRunner from './BaseStrategyRunner';
import { IParseStrategy } from './IParseStrategy';

export default class NoteExtractionStrategy implements IParseStrategy {
    data: string;
    keyword: string;
    containerName: string;
    baseRunner: BaseStrategyRunner;
    constructor(data: string) {
        this.data = data;
        this.keyword = 'note';
        this.containerName = 'notes';
        this.baseRunner = new BaseStrategyRunner(
            data,
            {
                keyword: this.keyword,
                containerName: this.containerName,
                defaultAttributes: {},
            },
            [ExtractionFunctions.setText, ExtractionFunctions.setCoords],
        );
    }

    apply() {
        return this.baseRunner.apply();
    }
}
