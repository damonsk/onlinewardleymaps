import * as ExtractionFunctions from '../constants/extractionFunctions';
import ExtendableComponentExtractionStrategy from './ExtendableComponentExtractionStrategy';
import {IParseStrategy} from '../types/base';

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
                defaultAttributes: {increaseLabelSpacing: 0},
            },
            additionalExtractions,
        );
    }

    apply() {
        return this.parentStrategy.apply();
    }
}
