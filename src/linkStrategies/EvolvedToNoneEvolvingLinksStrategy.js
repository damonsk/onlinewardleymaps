export default class EvolvedToNoneEvolvingLinksStrategy {
	constructor(links, mapElements) {
		this.links = links;
		this.mapElements = mapElements;
	}
	getLinks() {
		const links = this.links.filter(
			li =>
				this.mapElements.getEvolvedElements().find(i => i.name === li.start) &&
				this.mapElements.getNoneEvolvingElements().find(i => i.name === li.end)
		);
		return {
			name: 'evolveStartLinks',
			links: links,
			startElements: this.mapElements.getNoneEvolvingElements(),
			endElements: this.mapElements.getEvolveElements(),
		};
	}
}
