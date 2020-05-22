import EvolveMigrationStrategy from './EvolveMigrationStrategy';

export default class Migrations {
	constructor(mapText) {
		this.conversionStrategies = [new EvolveMigrationStrategy(mapText)];
	}

	apply() {
		let changed = false;
		let changeSets = [];
		let results = [];

		this.conversionStrategies.forEach(strategy => {
			let output = strategy.apply();
			changed = output.changed == true ? true : changed;
			changeSets = changeSets.concat(output.changeSets);
			results = results.concat(output.result);
		});

		return {
			original: this.mapText,
			changed,
			result: results.join('\n'),
			changeSets,
		};
	}
}
