export default class TitleExtractionStrategy {
	constructor(data) {
		this.data = data;
	}
	apply() {
		if (this.data.trim().length < 1) return 'Untitled Map';
		let trimmed = this.data.trim();
		let firstLine = trimmed.split('\n')[0];
		if (firstLine.indexOf('title') == 0) {
			return { title: firstLine.split('title ')[1].trim() };
		}
		return { title: 'Untitled Map' };
	}
}
