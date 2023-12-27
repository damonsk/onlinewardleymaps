export default class EvolvingEndLinksStrategy {
	constructor(links, mapElements) {
		this.links = links;
		this.mapElements = mapElements;
	}

	getLinks() {
		const links = this.links.filter(
			li =>
				this.mapElements.getEvolvedElements().find(i => i.name === li.end) &&
				this.mapElements
					.getNoneEvolvingElements()
					.find(i => i.name === li.start)
		);
		return {
			name: 'evolvingEndLinks',
			links: links,
			startElements: this.mapElements.getNoneEvolvingElements(),
			endElements: this.mapElements.getEvolveElements(),
		};
	}
}
