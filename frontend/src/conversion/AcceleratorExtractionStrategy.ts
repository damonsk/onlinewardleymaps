import {
    isDeAccelerator,
    setCoords,
    setName,
} from '../constants/extractionFunctions';
import { IParseStrategy } from '../types/base';
import BaseStrategyRunner from './BaseStrategyRunner';

export default class AcceleratorExtractionStrategy implements IParseStrategy {
    data: string;
    containerName: string;
    baseStrategies: BaseStrategyRunner[];
    constructor(data: string) {
        this.data = data;
        this.containerName = 'accelerators';
        this.baseStrategies = ['accelerator', 'deaccelerator']
            .map(
                (e) =>
                    new BaseStrategyRunner(
                        data,
                        {
                            keyword: e,
                            containerName: 'accelerators',
                            defaultAttributes: { increaseLabelSpacing: 0 },
                        },
                        [setName, setCoords, isDeAccelerator],
                    ),
            )
            .flat();
    }

    apply() {
        const output = this.baseStrategies.map((bs) => bs.apply()).flat();
        return {
            [this.containerName]: output.map((o) => o.accelerators).flat(),
            errors: [],
        };
    }
}
