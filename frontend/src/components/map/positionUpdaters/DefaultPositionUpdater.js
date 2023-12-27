export default class DefaultPositionUpdater {
	constructor(type, mapText, mutator, replacers) {
		this.type = type;
		this.mutator = mutator;
		this.mapText = mapText;
		this.replacers = replacers;
	}
	update(moved, identifier) {
		this.mutator(
			this.mapText
				.split('\n')
				.map(line => {
					for (let i = 0; i < this.replacers.length; i++) {
						const r = this.replacers[i];
						if (r.matcher(line, identifier, this.type)) {
							return r.action(line, moved);
						}
					}
					return line;
				})
				.join('\n')
		);
	}
}
