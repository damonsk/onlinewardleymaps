export default class ExtractLocation {
	extract(input, defaultValue) {
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
	}
}
