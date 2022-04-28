export default class TitleExtractionStrategy {
	constructor(data) {
		this.data = data;
	}
	apply() {
		if (this.data.trim().length < 1) return { title: 'Untitled Map' };
		let trimmed = this.data;
		for (let index = 0; index < trimmed.split('\n').length; index++) {
			const element = trimmed.split('\n')[index];
			if (element.indexOf('title') === 0) {
				return { title: element.split('title ')[1].trim() };
			}
		}

		return { title: 'Untitled Map' };
	}
}
