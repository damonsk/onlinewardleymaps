import ExtendableComponentExtractionStrategy from './ExtendableComponentExtractionStrategy';
import * as ExtractionFunctions from '../constants/extractionFunctions';

export default class SubMapExtractionStrategy {
	constructor(data) {
		this.data = data;

		const additionalExtractions = [ExtractionFunctions.setRef];

		this.parentStrategy = new ExtendableComponentExtractionStrategy(
			data,
			{
				keyword: 'submap',
				containerName: 'submaps',
			},
			additionalExtractions
		);
	}

	apply() {
		return this.parentStrategy.apply();
	}
}
