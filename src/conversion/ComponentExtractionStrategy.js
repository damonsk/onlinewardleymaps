import ExtractLocation from './ExtractLocation';

export default class ComponentExtractionStrategy {
	constructor(data) {
		this.data = data;
	}

	extractLocation(input, defaultValue) {
		return new ExtractLocation().extract(input, defaultValue);
	}

	apply() {
		let lines = this.data.trim().split('\n');
		let elementsToReturn = [];
		for (let i = 0; i < lines.length; i++) {
			try {
				const element = lines[i];
				if (element.trim().indexOf('component') === 0) {
					let name = element
						.split('component ')[1]
						.trim()
						.split(' [')[0]
						.trim();
					let newPoint;
					if (element.indexOf('evolve ') > -1) {
						newPoint = element.split('evolve ')[1].trim();
						newPoint = newPoint.replace('inertia', '').trim();
					}
					let positionData = this.extractLocation(element, {
						visibility: 0.95,
						maturity: 0.05,
					});
					let labelOffset = { x: 5, y: -10 };
					if (element.indexOf('label ') > -1) {
						let findPos = element.split('label [');
						if (findPos.length > 0 && findPos[1].indexOf(']') > -1) {
							let extractedPos = findPos[1].split(']')[0].split(',');
							labelOffset.x = parseFloat(extractedPos[0].trim());
							labelOffset.y = parseFloat(extractedPos[1].trim());
						}
					}
					elementsToReturn.push({
						name: name,
						maturity: positionData.maturity,
						visibility: positionData.visibility,
						id: 1 + i,
						line: 1 + i,
						evolving: newPoint !== null && newPoint !== undefined,
						evolveMaturity: newPoint,
						inertia: element.indexOf('inertia') > -1,
						label: labelOffset,
					});
				}
			} catch (err) {
				throw { line: i, err };
			}
		}
		return { elements: elementsToReturn };
	}
}
