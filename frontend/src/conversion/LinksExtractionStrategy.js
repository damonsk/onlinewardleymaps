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
			'pipeline',
			'note',
			'pioneers',
			'settlers',
			'townplanners',
			'submap',
			'url',
			'market',
			'ecosystem',
			'{',
			'}',
			'accelerator',
			'deaccelerator',
			'size',
		];
	}
	apply() {
		const lines = this.data.split('\n');
		const linksToReturn = [];
		const errors = [];

		for (let i = 0; i < lines.length; i++) {
			try {
				const element = lines[i];
				if (this.canProcessLine(element)) {
					let start,
						end,
						flow = true,
						future = false,
						past = false,
						flowValue,
						context;

					if (element.includes('+>')) {
						[start, end] = element.split('+>');
					} else if (element.includes('+<>')) {
						[start, end] = element.split('+<>');
						past = true;
					} else if (element.includes('+<')) {
						[start, end] = element.split('+<');
						future = true;
					} else if (element.includes("+'")) {
						const parts = element.split("+'");
						start = parts[0].trim();

						if (parts[1].includes("'>")) {
							[flowValue, end] = parts[1].split("'>");
							future = true;
						} else if (parts[1].includes("'<>")) {
							[flowValue, end] = parts[1].split("'<>");
							past = true;
							future = true;
						} else if (parts[1].includes("'<")) {
							[flowValue, end] = parts[1].split("'<");
							past = true;
						}

						linksToReturn.push({
							start,
							end: end.trim().split(';')[0].trim(),
							flow,
							flowValue,
							future,
							past,
						});
					} else if (element.includes('->')) {
						[start, end] = element.split('->');
						flow = false;
					}

					if (element.includes(';')) {
						context = element.split(';')[1].trim();
					}

					linksToReturn.push({
						start: start.trim(),
						end: end.trim().split(';')[0].trim(),
						flow,
						future,
						past,
						context,
					});
				}
			} catch (err) {
				errors.push(new ParseError(i));
			}
		}

		return { links: linksToReturn, errors };
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
