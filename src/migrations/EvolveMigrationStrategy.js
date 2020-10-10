import ComponentExtractionStrategy from '../conversion/ComponentExtractionStrategy';

export default class EvolveMigrationStrategy {
	apply(mapText) {
		let trimmed = mapText.trim();
		let elementsAsArray = trimmed.split('\n');
		let rebuild = [];
		let changed = false;
		let changeSets = [];
		for (let i = 0; i < elementsAsArray.length; i++) {
			let currentLine = elementsAsArray[i];
			if (currentLine.indexOf('component ') === 0) {
				if (currentLine.indexOf('evolve ') > -1) {
					changed = true;
					let parsed = new ComponentExtractionStrategy(currentLine).apply()
						.elements[0];
					let evolveLine =
						'evolve ' + parsed.name + ' ' + parsed.evolveMaturity;
					let afterLine = currentLine.replace(
						' evolve ' + parsed.evolveMaturity,
						''
					);
					rebuild.push(afterLine);
					rebuild.push(evolveLine);
					changeSets.push({
						before: currentLine,
						after: afterLine + '\n' + evolveLine,
					});
				} else {
					rebuild.push(currentLine);
				}
			} else {
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
