export default class LinksExtractionStrategy {
	constructor(data) {
		this.data = data;
	}
	apply() {
		let lines = this.data.trim().split('\n');
		let linksToReturn = [];
		for (let i = 0; i < lines.length; i++) {
			try {
				const element = lines[i];
				if (
					element.trim().length > 0 &&
					element.trim().indexOf('evolution') === -1 &&
					element.trim().indexOf('anchor') === -1 &&
					element.trim().indexOf('evolve') === -1 &&
					element.trim().indexOf('component') === -1 &&
					element.trim().indexOf('style') === -1 &&
					element.trim().indexOf('build') === -1 &&
					element.trim().indexOf('buy') === -1 &&
					element.trim().indexOf('outsource') === -1 &&
					element.trim().indexOf('title') === -1 &&
					element.trim().indexOf('annotation') === -1 &&
					element.trim().indexOf('annotations') === -1 &&
					element.trim().indexOf('y-axis') === -1 &&
					element.trim().indexOf('pipeline') === -1 &&
					element.trim().indexOf('note') === -1
				) {
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
				throw { line: i, err };
			}
		}
		return { links: linksToReturn };
	}
}
