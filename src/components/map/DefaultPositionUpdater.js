export default class DefaultPositionUpdater {
	constructor(type, positionCalc, mapText, mutator) {
		this.type = type;
		this.calc = positionCalc;
		this.mutator = mutator;
		this.mapText = mapText;
	}
	update(moved, identifier, mapDimensions) {
		this.mutator(
			this.mapText
				.split('\n')
				.map(line => {
					if (
						line
							.replace(/\s/g, '')
							.indexOf(this.type + identifier.replace(/\s/g, '') + '[') !== -1
					) {
						return line.replace(
							/\[(.?|.+?)\]/g,
							`[${this.calc.yToVisibility(
								moved.y,
								mapDimensions.height
							)}, ${this.calc.xToMaturity(moved.x, mapDimensions.width)}]`
						);
					} else if (
						line.replace(/\s/g, '') ===
						this.type + identifier.replace(/\s/g, '')
					) {
						return (
							line.trim() +
							' ' +
							`[${this.calc.yToVisibility(
								moved.y,
								mapDimensions.height
							)}, ${this.calc.xToMaturity(moved.x, mapDimensions.width)}]`
						);
					} else {
						return line;
					}
				})
				.join('\n')
		);
	}
}
