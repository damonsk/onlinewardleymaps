import * as ExtractionFunctions from '../constants/extractionFunctions';
import ExtendableComponentExtractionStrategy from './ExtendableComponentExtractionStrategy';
import { IParseStrategy } from './IParseStrategy';

export default class SubMapExtractionStrategy implements IParseStrategy {
    data: string;
    parentStrategy: ExtendableComponentExtractionStrategy;
    constructor(data: string) {
        this.data = data;

        const additionalExtractions = [ExtractionFunctions.setRef];

        this.parentStrategy = new ExtendableComponentExtractionStrategy(
            data,
            {
                keyword: 'submap',
                containerName: 'submaps',
                defaultAttributes: {},
            },
            additionalExtractions,
        );
    }

    apply() {
        return this.parentStrategy.apply();
    }
}
