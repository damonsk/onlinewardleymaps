import ExtractLocation from './ExtractLocation';
import BaseStrategyRunner from './BaseStrategyRunner';

export default class ExtendableComponentExtractionStrategy {
	constructor(data, config) {
		this.data = data;
		this.keyword = config.keyword;
		this.containerName = config.containerName;
		this.baseRunner = new BaseStrategyRunner(data, config);

		const setName = (o, line) => {
			let name = line
				.split(`${this.keyword} `)[1]
				.trim()
				.split(' [')[0]
				.trim();
			return Object.assign(o, { name: name });
		};
		const setLabel = (o, line) => {
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
		const setCoords = (o, line) => {
			const positionData = new ExtractLocation().extract(line, {
				visibility: 0.95,
				maturity: 0.05,
			});
			return Object.assign(
				o,
				{ maturity: positionData.maturity },
				{ visibility: positionData.visibility }
			);
		};
		const setInertia = (o, line) => {
			return Object.assign(o, { inertia: line.indexOf('inertia') !== -1 });
		};
		const setEvolve = (o, line) => {
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
		this.baseRunner.addDecorator(setName);
		this.baseRunner.addDecorator(setLabel);
		this.baseRunner.addDecorator(setCoords);
		this.baseRunner.addDecorator(setInertia);
		this.baseRunner.addDecorator(setEvolve);
	}

	addDecorator(fn) {
		this.BaseStrategyRunner.addDecorator(fn);
	}

	apply() {
		return this.baseRunner.apply();
	}
}
