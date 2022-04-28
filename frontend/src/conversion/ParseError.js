export default class ParseError extends Error {
	constructor(line) {
		super(`ParseError on line ${line}`);
		this.name = 'ParseError';
		this.line = line;
	}
}
