export default class EvolveExtractionStrategy {
	constructor(data) {
		this.data = data;
	}
	apply() {
		let lines = this.data.trim().split('\n');
		let elementsToReturn = [];
		for (let i = 0; i < lines.length; i++) {
			try {
				const element = lines[i];
				if (element.trim().indexOf('evolve ') === 0) {
					let name = element.split('evolve ')[1].trim();
					let evolveMaturity = element.match(/\s[0-9]?\.[0-9]+[0-9]?/);
					let newPoint = 0.85;
					if (evolveMaturity.length > 0) {
						newPoint = parseFloat(evolveMaturity[0]);
						name = name.split(newPoint)[0].trim();
					}
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
						maturity: newPoint,
						label: labelOffset,
						line: 1 + i,
					});
				}
			} catch (err) {
				throw { line: i, err };
			}
		}
		return { evolved: elementsToReturn };
	}
}
