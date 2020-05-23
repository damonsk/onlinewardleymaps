export default class EvolveToEvolvedLinksStrategy {
	constructor(links, mapElements) {
		this.links = links;
		this.mapElements = mapElements;
	}
	getLinks() {
		const links = this.links.filter(
			li =>
				this.mapElements.getEvolveElements().find(i => i.name === li.start) &&
				this.mapElements.getEvolvedElements().find(i => i.name === li.end)
		);
		return {
			name: 'evolveToEvolved',
			links: links,
			startElements: this.mapElements.getEvolveElements(),
			endElements: this.mapElements.getEvolvedElements(),
		};
	}
}
