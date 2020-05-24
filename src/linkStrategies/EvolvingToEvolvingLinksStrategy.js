export default class EvolvingToEvolvingLinksStrategy {
	constructor(links, mapElements) {
		this.links = links;
		this.mapElements = mapElements;
	}
	getLinks() {
		const links = this.links.filter(
			li =>
				this.mapElements.getEvolveElements().find(i => i.name === li.start) &&
				this.mapElements.getEvolveElements().find(i => i.name === li.end)
		);
		return {
			name: 'bothEvolving',
			links: links,
			startElements: this.mapElements.getEvolveElements(),
			endElements: this.mapElements.getEvolveElements(),
		};
	}
}
