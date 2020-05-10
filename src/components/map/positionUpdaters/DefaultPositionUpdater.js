export default class DefaultPositionUpdater {
	constructor(type, mapText, mutator) {
		this.type = type;
		this.mutator = mutator;
		this.mapText = mapText;
	}
	update(moved, identifier) {
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
							`[${moved.visibility}, ${moved.maturity}]`
						);
					} else if (
						line.replace(/\s/g, '') ===
						this.type + identifier.replace(/\s/g, '')
					) {
						return (
							line.trim() + ' ' + `[${moved.visibility}, ${moved.maturity}]`
						);
					} else {
						return line;
					}
				})
				.join('\n')
		);
	}
}
