import {
    setAttitude,
    setCoords,
    setHeightWidth,
    setManyCoords,
} from '../constants/extractionFunctions';
import BaseStrategyRunner from './BaseStrategyRunner';
import { IParseStrategy } from './IParseStrategy';

export default class AttitudeExtractionStrategy implements IParseStrategy {
    data: string;
    containerName: string;
    baseStrategies: BaseStrategyRunner[];
    constructor(data: string) {
        this.data = data;
        this.containerName = 'attitudes';
        this.baseStrategies = ['pioneers', 'settlers', 'townplanners']
            .map(
                e =>
                    new BaseStrategyRunner(
                        data,
                        {
                            keyword: e,
                            containerName: 'attitudes',
                            defaultAttributes: {},
                        },
                        [setAttitude, setCoords, setManyCoords, setHeightWidth],
                    ),
            )
            .flat();
    }

    apply() {
        const output = this.baseStrategies.map(bs => bs.apply()).flat();
        return {
            [this.containerName]: output.map(o => o.attitudes).flat(),
            errors: [],
        };
    }
}
