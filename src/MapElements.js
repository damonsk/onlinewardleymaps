export default class MapElements {
	constructor(components, evolved) {
		this.mapComponents = components;
		this.evolved = evolved;
	}

	getEvolvedElements() {
		return this.getEvolveElements().map(el => {
			return {
				name: el.name,
				id: el.id + 'ev',
				maturity: el.evolveMaturity,
				visibility: el.visibility,
				evolving: false,
				evolved: true,
			};
		});
	}

	getEvolveElements() {
		if (this.evolved == undefined) return [];
		let evolving = this.evolved
			.map(e => {
				return this.mapComponents
					.filter(el => el.name == e.name)
					.map(i => {
						i.evolveMaturity = e.maturity;
						i.evolving = true;
						return i;
					});
			})
			.flat();
		return evolving;
	}

	getNoneEvolvingElements() {
		return this.mapComponents.filter(el => el.evolving == false);
	}

	getNonEvolvedElements() {
		return this.getNoneEvolvingElements().concat(this.getEvolveElements());
	}

	getMergedElements() {
		var evolveElements = this.mapComponents.filter(el => el.evolving);
		var noneEvolving = this.mapComponents.filter(el => el.evolving == false);
		var evolvedElements = evolveElements.map(el => {
			return {
				name: el.name,
				id: el.id + 'ev',
				maturity: el.evolveMaturity,
				visibility: el.visibility,
				evolving: false,
				evolved: true,
			};
		});

		return noneEvolving.concat(evolvedElements).concat(evolveElements);
	}
}
