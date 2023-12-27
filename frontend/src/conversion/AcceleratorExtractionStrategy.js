import BaseStrategyRunner from './BaseStrategyRunner';
import {
	setCoords,
	setName,
	isDeAccelerator,
} from '../constants/extractionFunctions';

export default class AcceleratorExtractionStrategy {
	constructor(data) {
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
							defaultAttributes: {},
						},
						[setName, setCoords, isDeAccelerator]
					)
			)
			.flat();
	}
	apply() {
		const output = this.baseStrategies.map((bs) => bs.apply()).flat();
		return { [this.containerName]: output.map((o) => o.accelerators).flat() };
	}
}
