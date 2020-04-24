export default class MapPipelines {
	constructor(components, pipelines) {
		this.mapComponents = components;
		this.pipelines = pipelines;
	}

	getMapPipelines() {
		if (this.pipelines == undefined) return [];
		let pipeline = this.pipelines
			.map(e => {
				let component = this.mapComponents.find(el => el.name == e.name);
				e.visibility = component.visibility;
				return e;
			})
			.flat();
		return pipeline;
	}
}
