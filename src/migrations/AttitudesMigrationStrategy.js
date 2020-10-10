import AttitudeExtractionStrategy from '../conversion/AttitudeExtractionStrategy';

export default class AttitudesMigrationStrategy {
	apply(mapText) {
		const attitudes = ['pioneers', 'settlers', 'townplanners'];
		let trimmed = mapText.trim();
		let elementsAsArray = trimmed.split('\n');
		let rebuild = [];
		let changed = false;
		let changeSets = [];
		for (let i = 0; i < elementsAsArray.length; i++) {
			let currentLine = elementsAsArray[i];
			let didMutate = false;
			for (let i = 0; i < attitudes.length; i++) {
				const e = attitudes[i];
				if (currentLine.indexOf(`${e} `) === 0) {
					didMutate = true;
					let parsed = new AttitudeExtractionStrategy(currentLine).apply()
						.attitudes[0];
					if (parsed.width > 0) {
						changed = true;
						let afterLine = `${e} [${parsed.visibility}, ${
							parsed.maturity
						}, ${parsed.visibility - 0.2}, ${parsed.maturity + 0.2}]`;
						rebuild.push(afterLine);
						changeSets.push({
							before: currentLine,
							after: afterLine,
						});
					} else {
						rebuild.push(currentLine);
					}
				}
			}
			if (didMutate === false) {
				rebuild.push(currentLine);
			}
		}
		return {
			original: mapText,
			changed,
			result: rebuild.join('\n'),
			changeSets,
		};
	}
}
