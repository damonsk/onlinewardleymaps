export default class EvolvedToEvolvingLinksStrategy {
	constructor(links, mapElements) {
		this.links = links;
		this.mapElements = mapElements;
	}
	getLinks() {
		const links = this.links.filter(
			li =>
				this.mapElements.getEvolvedElements().find(i => i.name === li.start) &&
				this.mapElements.getEvolveElements().find(i => i.name === li.end)
		);
		return {
			name: 'evolvedToEvolving',
			links: links,
			startElements: this.mapElements.getEvolvedElements(),
			endElements: this.mapElements.getEvolveElements(),
		};
	}
}
