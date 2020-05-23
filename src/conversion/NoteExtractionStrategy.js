import ExtractLocation from './ExtractLocation';

export default class NoteExtractionStrategy {
	constructor(data) {
		this.data = data;
	}

	extractLocation(input, defaultValue) {
		return new ExtractLocation().extract(input, defaultValue);
	}

	apply() {
		if (this.data.trim().length < 1) return [];
		let lines = this.data.trim().split('\n');
		var notesArray = [];
		for (let i = 0; i < lines.length; i++) {
			try {
				const element = lines[i];
				if (element.trim().indexOf('note ') === 0) {
					let noteText = element
						.substr('note '.length, element.length - 'note '.length)
						.trim()
						.split(' [')[0]
						.trim();
					let notePosition = this.extractLocation(element, {
						visibility: 0.9,
						maturity: 0.1,
					});
					notesArray.push({
						text: noteText,
						visibility: notePosition.visibility,
						maturity: notePosition.maturity,
						line: 1 + i,
					});
				}
			} catch (err) {
				throw { line: i, err };
			}
		}
		return { notes: notesArray };
	}
}
