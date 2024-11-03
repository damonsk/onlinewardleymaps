import * as ExtractionFunctions from '../constants/extractionFunctions';

export default class PresentationExtractionStrategy {
	constructor(data) {
		this.data = data;
	}

	apply() {
		let presentationObject = {
			style: 'plain',
			annotations: { visibility: 0.9, maturity: 0.1 },
			size: { width: 0, height: 0 },
		};
		let lines = this.data.split('\n');
		for (let i = 0; i < lines.length; i++) {
			const element = lines[i];
			if (element.trim().indexOf('style') === 0) {
				let name = element.split('style ')[1].trim();
				presentationObject.style = name;
			}
			if (element.trim().indexOf('annotations ') === 0) {
				presentationObject.annotations = ExtractionFunctions.extractLocation(
					element,
					{
						visibility: 0.9,
						maturity: 0.1,
					}
				);
			}
			if (element.trim().indexOf('size ') === 0) {
				presentationObject.size = ExtractionFunctions.extractSize(element, {
					width: 0,
					height: 0,
				});
			}
		}
		return { presentation: presentationObject };
	}
}
