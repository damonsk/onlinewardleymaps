import BaseStrategyRunner from './BaseStrategyRunner';
import * as ExtractionFunctions from '../constants/extractionFunctions';

export default class MethodExtractionStrategy {
	constructor(data) {
		this.data = data;
		this.containerName = 'methods';
		this.baseStrategies = ['buy', 'outsource', 'build']
			.map(
				e =>
					new BaseStrategyRunner(
						data,
						{
							keyword: e,
							containerName: 'methods',
							defaultAttributes: {},
						},
						[ExtractionFunctions.setMethod]
					)
			)
			.flat();
	}
	apply() {
		const output = this.baseStrategies.map(bs => bs.apply()).flat();
		return { [this.containerName]: output.map(o => o.methods).flat() };
	}
}
