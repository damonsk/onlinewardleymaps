import ExtractLocation from './ExtractLocation';
export default class AnchorExtractionStrategy {
	constructor(data) {
		this.data = data;
	}
	extractLocation(input, defaultValue) {
		return new ExtractLocation().extract(input, defaultValue);
	}
	apply() {
		let lines = this.data.trim().split('\n');
		let anchorsToReturn = [];
		for (let i = 0; i < lines.length; i++) {
			try {
				const element = lines[i];
				if (element.trim().indexOf('anchor') === 0) {
					let name = element
						.split('anchor ')[1]
						.trim()
						.split(' [')[0]
						.trim();
					let positionData = this.extractLocation(element, {
						visibility: 0.95,
						maturity: 0.05,
					});
					anchorsToReturn.push({
						name: name,
						maturity: positionData.maturity,
						visibility: positionData.visibility,
						id: 1 + i,
						line: 1 + i,
					});
				}
			} catch (err) {
				throw { line: i, err };
			}
		}
		return { anchors: anchorsToReturn };
	}
}
