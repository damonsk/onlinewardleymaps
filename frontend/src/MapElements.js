import { featureSwitches } from './constants/featureswitches';

export default class MapElements {
	// this is a messs...
	constructor(components, evolved, pipelines) {
		this.mapComponents = components.flatMap(i => {
			return i.collection.map(c => Object.assign(c, { type: i.type }));
		});
		this.evolved = evolved;
		this.pipelines = this.processPipelines(pipelines, this.mapComponents);
		if (featureSwitches.enableNewPipelines) {
			let getPipelineChildComponents = this.pipelines.flatMap(p =>
				p.components.map(c => {
					return {
						...c,
						type: 'component',
						pseudoComponent: true,
						visibility: p.visibility,
						offsetY: 14,
					};
				})
			);
			this.mapComponents = this.mapComponents.concat(
				getPipelineChildComponents
			);
		}
	}

	processPipelines(pipelines, components) {
		if (pipelines === undefined) return [];
		let pipeline = pipelines
			.map(e => {
				let component = components.find(el => el.name === e.name);
				if (component !== null && component !== undefined) {
					e.visibility = component.visibility;
				} else {
					e.hidden = true;
				}
				return e;
			})
			.filter(e => e.hidden === false)
			.flat();
		return pipeline;
	}

	getMapPipelines() {
		return this.pipelines;
	}

	getEvolvedElements() {
		const x = this.getEvolveElements().map(el => {
			let v = this.evolved.find(evd => evd.name === el.name);
			return {
				name: el.name,
				id: el.id + 'ev',
				maturity: el.evolveMaturity,
				visibility: el.visibility,
				evolving: false,
				evolved: true,
				label: v.label,
				override: v.override,
				line: v.line,
				type: el.type,
				offsetY: el.offsetY,
				decorators: v.decorators,
				increaseLabelSpacing: v.increaseLabelSpacing,
			};
		});
		console.log('x', x);
		return x;
	}

	getEvolveElements() {
		if (this.evolved === undefined) return [];
		let evolving = this.evolved
			.map(e => {
				return this.mapComponents
					.filter(el => el.name === e.name)
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
		return this.mapComponents.filter(el => el.evolving === false);
	}

	getNoneEvolvedOrEvolvingElements() {
		return this.mapComponents.filter(
			el =>
				(el.evolving === undefined || el.evolving === false) &&
				(el.evolved === undefined || el.evolved === false)
		);
	}

	geEvolvedOrEvolvingElements() {
		return this.mapComponents.filter(
			el => el.evolving === true || el.evolved === true
		);
	}

	getNonEvolvedElements() {
		return this.getNoneEvolvingElements().concat(this.getEvolveElements());
	}

	getMergedElements() {
		let evolveElements = this.getEvolveElements();
		let noneEvolving = this.getNoneEvolvingElements();
		let evolvedElements = this.getEvolvedElements();
		let collection = noneEvolving
			.concat(evolvedElements)
			.concat(evolveElements)
			.filter(c => !c.pseudoComponent == true);
		console.log('getMergedElements', collection);
		if (this.pipelines === undefined) return collection;
		const e = collection
			.map(e => {
				let component = this.pipelines.find(el => el.name === e.name);
				e.pipeline =
					component != null && component !== undefined ? true : false;
				return e;
			})
			.flat();
		return e;
	}
}
