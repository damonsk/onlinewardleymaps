import * as ExtractionFunctions from '../constants/extractionFunctions';

export default class PresentationExtractionStrategy {
	constructor(data) {
		this.data = data;
	}

	apply() {
		let presentationObject = {
			style: 'plain',
			annotations: { visibility: 0.9, maturity: 0.1 },
			yAxis: { label: 'Value Chain', max: 'Visible', min: 'Invisible' },
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
			if (element.trim().indexOf('y-axis ') === 0) {
				let yAxis = element
					.trim()
					.split('y-axis ')[1]
					.split('->');
				if (yAxis.length === 3) {
					presentationObject.yAxis.label = yAxis[0].trim();
					presentationObject.yAxis.min = yAxis[1].trim();
					presentationObject.yAxis.max = yAxis[2].trim();
				}
			}
		}
		return { presentation: presentationObject };
	}
}
