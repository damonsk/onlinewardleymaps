export default class NotDefinedPositionUpdater {
	constructor(type, positionCalc, mapText, mutator) {
		this.type = type;
		this.calc = positionCalc;
		this.mutator = mutator;
		this.mapText = mapText;
		this.positionUpdater = null;
	}
	setSuccessor(positionUpdater) {
		this.positionUpdater = positionUpdater;
	}
	update(moved, identifier, mapDimensions) {
		if (
			this.mapText.indexOf(this.type + ' ') > -1 &&
			this.positionUpdater != null
		) {
			this.positionUpdater.update(moved, identifier, mapDimensions);
		} else {
			this.mutator(
				this.mapText +
					'\n' +
					this.type +
					' [' +
					this.calc.yToVisibility(moved.y, mapDimensions.height) +
					', ' +
					this.calc.xToMaturity(moved.x, mapDimensions.width) +
					']'
			);
		}
	}
}
