import EvolveMigrationStrategy from './EvolveMigrationStrategy';
import AttitudesMigrationStrategy from './AttitudesMigrationStrategy';

export default class Migrations {
	constructor(mapText) {
		this.conversionStrategies = [
			new EvolveMigrationStrategy(),
			new AttitudesMigrationStrategy(),
		];
		this.mapText = mapText;
	}

	apply() {
		let changed = false;
		let changeSets = [];
		let results = [];
		let result = this.mapText;
		for (let index = 0; index < this.conversionStrategies.length; index++) {
			let output = this.conversionStrategies[index].apply(result);
			result = output.result;
			changed = output.changed === true ? true : changed;
			changeSets = changeSets.concat(output.changeSets);
			results = results.concat(output.result);
		}

		return {
			original: this.mapText,
			changed,
			result: result,
			changeSets,
		};
	}
}
