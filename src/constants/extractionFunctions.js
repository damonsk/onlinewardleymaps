export const setNumber = (o, line, config) => {
	let number = line
		.split(`${config.keyword} `)[1]
		.trim()
		.split(' [')[0]
		.trim();
	return Object.assign(o, { number: parseInt(number) });
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

export const setMethod = (o, line, config) => {
	let name = line.split(`${config.keyword} `)[1].trim();
	return Object.assign(o, { name: name }, { method: config.keyword });
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
