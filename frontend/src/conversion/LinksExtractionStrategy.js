import ParseError from './ParseError';

export default class LinksExtractionStrategy {
	constructor(data) {
		this.data = data;
		this.notLinks = [
			'evolution',
			'anchor',
			'evolve',
			'component',
			'style',
			'build',
			'buy',
			'outsource',
			'title',
			'annotation',
			'annotations',
			'y-axis',
			'pipeline',
			'note',
			'pioneers',
			'settlers',
			'townplanners',
			'submap',
			'url',
			'market',
			'ecosystem',
		];
	}
	apply() {
		let lines = this.data.split('\n');
		let linksToReturn = [];
		let errors = [];
		for (let i = 0; i < lines.length; i++) {
			try {
				const element = lines[i];
				if (this.canProcessLine(element)) {
					if (element.indexOf('+>') > -1) {
						let name = element.split('+>');
						linksToReturn.push({
							start: name[0].trim(),
							end: name[1].trim(),
							flow: true,
							future: true,
							past: false,
						});
					} else if (element.indexOf('+<>') > -1) {
						let name = element.split('+<>');
						linksToReturn.push({
							start: name[0].trim(),
							end: name[1].trim(),
							flow: true,
							future: true,
							past: true,
						});
					} else if (element.indexOf('+<') > -1) {
						let name = element.split('+<');
						linksToReturn.push({
							start: name[0].trim(),
							end: name[1].trim(),
							flow: true,
							future: false,
							past: true,
						});
					} else if (element.indexOf("+'") > -1) {
						let flowValue;
						let endName;
						let isFuture = false;
						let isPast = false;
						if (element.indexOf("'>") > -1) {
							flowValue = element.split("+'")[1].split("'>")[0];
							endName = element.split("'>");
							isFuture = true;
						} else if (element.indexOf("'<>") > -1) {
							flowValue = element.split("+'")[1].split("'<>")[0];
							endName = element.split("'<>");
							isPast = true;
							isFuture = true;
						} else if (element.indexOf("'<") > -1) {
							flowValue = element.split("+'")[1].split("'<")[0];
							endName = element.split("'<");
							isPast = true;
						}
						let startName = element.split("+'");
						linksToReturn.push({
							start: startName[0].trim(),
							end: endName[1].trim(),
							flow: true,
							flowValue: flowValue,
							future: isFuture,
							past: isPast,
						});
					} else {
						let name = element.split('->');
						linksToReturn.push({
							start: name[0].trim(),
							end: name[1].trim(),
							flow: false,
						});
					}
				}
			} catch (err) {
				errors.push(new ParseError(i));
			}
		}
		return { links: linksToReturn, errors: errors };
	}

	canProcessLine(element) {
		if (element.trim().length === 0) return false;
		let shouldProcess = true;
		for (let j = 0; j < this.notLinks.length; j++) {
			const shouldIgnore = this.notLinks[j];
			if (
				element.trim().indexOf(shouldIgnore) === 0 ||
				element.trim().indexOf('(' + shouldIgnore + ')') !== -1
			) {
				shouldProcess = false;
			}
		}
		return shouldProcess;
	}
}
