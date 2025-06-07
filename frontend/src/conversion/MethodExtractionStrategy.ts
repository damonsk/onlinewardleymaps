import * as ExtractionFunctions from '../constants/extractionFunctions';
import BaseStrategyRunner from './BaseStrategyRunner';
import { IParseStrategy } from '../types/base';

export default class MethodExtractionStrategy implements IParseStrategy {
    data: string;
    containerName: string;
    baseStrategies: BaseStrategyRunner[];
    constructor(data: string) {
        this.data = data;
        this.containerName = 'methods';
        this.baseStrategies = ['buy', 'outsource', 'build']
            .map(
                (e) =>
                    new BaseStrategyRunner(
                        data,
                        {
                            keyword: e,
                            containerName: 'methods',
                            // Set to 0 to satisfy the interface but not affect positioning
                            defaultAttributes: { increaseLabelSpacing: 0 },
                        },
                        [ExtractionFunctions.setMethod],
                    ),
            )
            .flat();
    }

    apply() {
        const output = this.baseStrategies.map((bs) => bs.apply()).flat();
        return {
            [this.containerName]: output.map((o) => o.methods).flat(),
            errors: [],
        };
    }
}
