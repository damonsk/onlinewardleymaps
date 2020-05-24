import ExtractLocation from '../conversion/ExtractLocation';

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

export const setCoords = (o, line) => {
	const positionData = new ExtractLocation().extract(line, {
		visibility: 0.9,
		maturity: 0.1,
	});
	return Object.assign(
		o,
		{ maturity: positionData.maturity },
		{ visibility: positionData.visibility }
	);
};

export const setLabel = (o, line) => {
	let labelOffset = { x: 5, y: -10 };
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
