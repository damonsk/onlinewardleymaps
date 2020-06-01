import BaseStrategyRunner from './BaseStrategyRunner';
import {
	setAttitude,
	setCoords,
	setHeightWidth,
} from '../constants/extractionFunctions';

export default class AttitudeExtractionStrategy {
	constructor(data) {
		this.data = data;
		this.containerName = 'attitudes';
		this.baseStrategies = ['pioneers', 'settlers', 'townplanners']
			.map(
				e =>
					new BaseStrategyRunner(
						data,
						{ keyword: e, containerName: 'attitudes' },
						[setAttitude, setCoords, setHeightWidth]
					)
			)
			.flat();
	}
	apply() {
		const output = this.baseStrategies.map(bs => bs.apply()).flat();
		return { [this.containerName]: output.map(o => o.attitudes).flat() };
	}
}
