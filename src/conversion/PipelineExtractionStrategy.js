export default class PipelineExtractionStrategy {
	constructor(data) {
		this.data = data;
	}
	apply() {
		let lines = this.data.trim().split('\n');
		let elementsToReturn = [];
		for (let i = 0; i < lines.length; i++) {
			try {
				const element = lines[i];
				if (element.trim().indexOf('pipeline ') == 0) {
					let name = element.split('pipeline ')[1].trim();
					if (name.indexOf('[') > -1) {
						name = name.split('[')[0].trim();
					}
					let pipelineHidden = true;
					let pieplinePos = { maturity1: 0.2, maturity2: 0.8 };
					let findPos = element.split('[');
					if (
						element.indexOf('[') > -1 &&
						element.indexOf(']') > -1 &&
						findPos.length > 1 &&
						findPos[1].indexOf(']') > -1
					) {
						let extractedPos = findPos[1].split(']')[0].split(',');
						pieplinePos.maturity1 = parseFloat(extractedPos[0].trim());
						pieplinePos.maturity2 = parseFloat(extractedPos[1].trim());
						pipelineHidden = false;
					}
					elementsToReturn.push({
						name: name,
						maturity1: pieplinePos.maturity1,
						maturity2: pieplinePos.maturity2,
						hidden: pipelineHidden,
						line: 1 + i,
					});
				}
			} catch (err) {
				throw { line: i, err };
			}
		}
		return { pipelines: elementsToReturn };
	}
}
