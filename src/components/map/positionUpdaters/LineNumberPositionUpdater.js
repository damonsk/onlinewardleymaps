export default class LineNumberPositionUpdater {
	constructor(type, mapText, mutator, replacers) {
		this.type = type;
		this.mapText = mapText;
		this.mutator = mutator;
		this.replacers = replacers;
	}
	update(moved, identifier, line) {
		let getLine = this.mapText.split('\n')[line - 1];
		for (let i = 0; i < this.replacers.length; i++) {
			const r = this.replacers[i];
			if (r.matcher(getLine, identifier, this.type)) {
				getLine = r.action(getLine, moved);
			}
		}
		let splitArray = this.mapText.split('\n');
		splitArray[line - 1] = getLine;
		this.mutator(splitArray.join('\n'));
	}
}
