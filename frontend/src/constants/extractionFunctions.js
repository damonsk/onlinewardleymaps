import merge from 'lodash.merge';
import * as Defaults from './defaults';

export const setNumber = (o, line, config) => {
	let number = line
		.split(`${config.keyword} `)[1]
		.trim()
		.split(' [')[0]
		.trim();
	return Object.assign(o, { number: parseInt(number) });
};

export const setRef = (o, line) => {
	if (line.indexOf('url(') !== -1) {
		const extractedRef = line
			.split('url(')[1]
			.split(')')[0]
			.trim();
		return Object.assign(o, { url: extractedRef });
	}
};

export const setTextFromEnding = (o, line) => {
	let text = '';
	if (
		line.trim().indexOf(']') > -1 &&
		line.trim().indexOf(']') !== line.trim().length - 1
	) {
		if (line.replace(/\s/g, '').indexOf(']]') === -1) {
			text = line.split(']')[1].trim();
		}
		if (line.replace(/\s/g, '').indexOf(']]') > -1) {
			var pos = line.lastIndexOf(']');
			text = line.substr(pos + 1, line.length - 1).trim();
		}
	}
	return Object.assign(o, { text: text });
};

export const setOccurances = (o, line) => {
	const defaultPosition = {
		visibility: 0.9,
		maturity: 0.1,
	};
	let positionData = [];
	if (line.replace(/\s/g, '').indexOf('[[') > -1) {
		const justOccurances =
			'[' +
			line
				.replace(/\s/g, '')
				.split('[[')[1]
				.split(']]')[0] +
			']';
		const occurancesAsArray = justOccurances
			.replace(/\],\[/g, ']|[')
			.split('|');
		occurancesAsArray.forEach(e => {
			positionData.push(extractLocation(e, defaultPosition));
		});
	} else if (line.indexOf('[') > -1 && line.indexOf(']') > -1) {
		positionData.push(extractLocation(line, defaultPosition));
	}
	return Object.assign(o, { occurances: positionData });
};

export const setPipelineMaturity = (o, line) => {
	let pipelineHidden = true;
	let pieplinePos = { maturity1: 0.2, maturity2: 0.8 };
	let findPos = line.split('[');
	if (
		line.indexOf('[') > -1 &&
		line.indexOf(']') > -1 &&
		findPos.length > 1 &&
		findPos[1].indexOf(']') > -1
	) {
		let extractedPos = findPos[1].split(']')[0].split(',');
		pieplinePos.maturity1 = parseFloat(extractedPos[0].trim());
		pieplinePos.maturity2 = parseFloat(extractedPos[1].trim());
		pipelineHidden = false;
	}
	return Object.assign(
		o,
		{ hidden: pipelineHidden },
		{ maturity2: pieplinePos.maturity2 },
		{ maturity1: pieplinePos.maturity1 }
	);
};

export const extractLocation = (input, defaultValue) => {
	if (input.indexOf('[') > -1 && input.indexOf(']') > -1) {
		let loc = input
			.split('[')[1]
			.trim()
			.split(']')[0]
			.replace(/\s/g, '')
			.split(',');
		return {
			visibility: isNaN(parseFloat(loc[0]))
				? defaultValue.visibility
				: parseFloat(loc[0]),
			maturity: isNaN(parseFloat(loc[1]))
				? defaultValue.maturity
				: parseFloat(loc[1]),
		};
	} else return defaultValue;
};

export const extractManyLocations = (input, defaultValue) => {
	if (input.indexOf('[') > -1 && input.indexOf(']') > -1) {
		let loc = input
			.split('[')[1]
			.trim()
			.split(']')[0]
			.replace(/\s/g, '')
			.split(',');
		return {
			visibility: isNaN(parseFloat(loc[0]))
				? defaultValue.visibility
				: parseFloat(loc[0]),
			maturity: isNaN(parseFloat(loc[1]))
				? defaultValue.maturity
				: parseFloat(loc[1]),
			visibility2: isNaN(parseFloat(loc[2]))
				? defaultValue.visibility2
				: parseFloat(loc[2]),
			maturity2: isNaN(parseFloat(loc[3]))
				? defaultValue.maturity2
				: parseFloat(loc[3]),
		};
	} else return defaultValue;
};

export const setMethod = (o, line, config) => {
	let name = line.split(`${config.keyword} `)[1].trim();
	return Object.assign(o, { name: name }, { method: config.keyword });
};

export const setAttitude = (o, line, config) => {
	return Object.assign(o, { attitude: config.keyword });
};

export const setHeightWidth = (o, line) => {
	if (!line.includes(']')) {
		return o;
	}
	const [width, height] = line
		.split(']')[1]
		.trim()
		.split(' ');

	return Object.assign(o, { width, height });
};

export const setNameWithMaturity = (o, line) => {
	let name = line.split('evolve ')[1].trim();
	const evolveMaturity = line.match(/\s[0-9]?\.[0-9]+[0-9]?/);
	let newPoint = 0.85;
	if (evolveMaturity.length > 0) {
		newPoint = parseFloat(evolveMaturity[0]);
		name = name.split(newPoint)[0].trim();
	}
	return Object.assign(o, { name: name }, { maturity: newPoint });
};

export const setCoords = (o, line) => {
	const positionData = extractLocation(line, {
		visibility: 0.9,
		maturity: 0.1,
	});
	return Object.assign(
		o,
		{ maturity: positionData.maturity },
		{ visibility: positionData.visibility }
	);
};

export const setManyCoords = (o, line) => {
	const positionData = extractManyLocations(line, {
		visibility: 0.9,
		maturity: 0.1,
		visibility2: 0.8,
		maturity2: 0.2,
	});
	return Object.assign(
		o,
		{ maturity: positionData.maturity },
		{ visibility: positionData.visibility },
		{ maturity2: positionData.maturity2 },
		{ visibility2: positionData.visibility2 }
	);
};

const methodDecorator = (o, line) => {
	const meths = ['build', 'buy', 'outsource'];
	let decs = {};
	let parentAttributes = {};
	for (let i = 0; i < meths.length; i++) {
		const element = meths[i];
		if (
			line.indexOf(element) > -1 &&
			line.indexOf('(') < line.indexOf(element) &&
			line.indexOf(')') > line.indexOf(element)
		) {
			decs = Object.assign(decs, { method: element });
			parentAttributes = Object.assign(parentAttributes, {
				increaseLabelSpacing: 2,
			});
		}
	}
	return merge(o, { decorators: decs }, parentAttributes);
};

const marketDecorator = (o, line) => {
	const meths = ['market'];
	let decs = {};
	let parentAttributes = {};
	for (let i = 0; i < meths.length; i++) {
		const element = meths[i];
		if (
			line.indexOf(element) > -1 &&
			line.indexOf('(') < line.indexOf(element) &&
			line.indexOf(')') > line.indexOf(element)
		) {
			decs = Object.assign(decs, { market: true });
			parentAttributes = Object.assign(parentAttributes, {
				increaseLabelSpacing: 2,
			});
		}
	}
	return merge(o, { decorators: decs }, parentAttributes);
};

const ecosystemDecorator = (o, line) => {
	const meths = ['ecosystem'];
	let decs = {};
	let parentAttributes = {};
	for (let i = 0; i < meths.length; i++) {
		const element = meths[i];
		if (
			line.indexOf(element) > -1 &&
			line.indexOf('(') < line.indexOf(element) &&
			line.indexOf(')') > line.indexOf(element)
		) {
			decs = Object.assign(decs, { ecosystem: true });
			parentAttributes = Object.assign(parentAttributes, {
				increaseLabelSpacing: 3,
			});
		}
	}
	return merge(o, { decorators: decs }, parentAttributes);
};

export const decorators = (o, line) => {
	[methodDecorator, marketDecorator, ecosystemDecorator].forEach(d =>
		merge(o, d(o, line))
	);
	return o;
};

export const setLabel = (o, line) => {
	let labelOffset = { ...Defaults.defaultLabelOffset };
	if (o.increaseLabelSpacing)
		labelOffset = {
			x: labelOffset.x * o.increaseLabelSpacing,
			y: labelOffset.y * o.increaseLabelSpacing,
		};

	if (line.indexOf('label ') > -1) {
		let findPos = line.split('label [');
		if (findPos.length > 0 && findPos[1].indexOf(']') > -1) {
			let extractedPos = findPos[1].split(']')[0].split(',');
			labelOffset.x = parseFloat(extractedPos[0].trim());
			labelOffset.y = parseFloat(extractedPos[1].trim());
		}
	}
	return Object.assign(o, { label: labelOffset });
};

export const setEvolve = (o, line) => {
	let newPoint;
	if (line.indexOf('evolve ') > -1) {
		newPoint = line.split('evolve ')[1].trim();
		newPoint = newPoint.replace('inertia', '').trim();
	}
	return Object.assign(
		o,
		{ evolveMaturity: newPoint },
		{ evolving: newPoint !== null && newPoint !== undefined }
	);
};

export const setInertia = (o, line) => {
	return Object.assign(o, { inertia: line.indexOf('inertia') !== -1 });
};

export const setText = (o, line, config) => {
	let text = line
		.substr(
			`${config.keyword} `.length,
			line.length - `${config.keyword} `.length
		)
		.trim()
		.split(' [')[0]
		.trim();
	return Object.assign(o, { text: text });
};

export const setName = (o, line, config) => {
	let name = line
		.split(`${config.keyword} `)[1]
		.trim()
		.split(' [')[0]
		.trim();
	return Object.assign(o, { name: name });
};

export const setUrl = (o, line) => {
	let path = line
		.split('[')[1]
		.trim()
		.split(']')[0]
		.trim();
	return Object.assign(o, { url: path });
};
