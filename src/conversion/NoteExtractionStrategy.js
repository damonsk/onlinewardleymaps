import BaseStrategyRunner from './BaseStrategyRunner';
import * as ExtractionFunctions from '../constants/extractionFunctions';

export default class NoteExtractionStrategy {
	constructor(data) {
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
			[ExtractionFunctions.setText, ExtractionFunctions.setCoords]
		);
	}

	apply() {
		return this.baseRunner.apply();
	}
}
