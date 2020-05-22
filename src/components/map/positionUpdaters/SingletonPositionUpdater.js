export default class SingletonPositionUpdater {
	constructor(type, mapText, mutator) {
		this.type = type;
		this.mutator = mutator;
		this.mapText = mapText;
		this.positionUpdater = null;
	}
	setSuccessor(positionUpdater) {
		this.positionUpdater = positionUpdater;
	}
	update(moved, identifier) {
		if (
			this.mapText.indexOf(this.type + ' ') > -1 &&
			this.positionUpdater != null
		) {
			this.positionUpdater.update(moved, identifier);
		} else {
			this.mutator(
				this.mapText + '\n' + this.type + ` [${moved.param1}, ${moved.param2}]`
			);
		}
	}
}
