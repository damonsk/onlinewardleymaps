import ExtractLocation from './ExtractLocation';
import BaseStrategyRunner from './BaseStrategyRunner';

export default class AnchorExtractionStrategy {
	constructor(data) {
		this.data = data;
		this.keyword = 'anchor';
		this.containerName = 'anchors';
		this.baseRunner = new BaseStrategyRunner(data, {
			keyword: this.keyword,
			containerName: this.containerName,
		});

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

		const setName = (o, line) => {
			let name = line
				.split(`${this.keyword} `)[1]
				.trim()
				.split(' [')[0]
				.trim();
			return Object.assign(o, { name: name });
		};

		this.baseRunner.addDecorator(setName);
		this.baseRunner.addDecorator(setCoords);
	}

	addDecorator(fn) {
		this.baseRunner.addDecorator(fn);
	}

	apply() {
		return this.baseRunner.apply();
	}
}
