export default class ParseError extends Error {
    line: number;
    constructor(line: number) {
        super(`ParseError on line ${line}`);
        this.name = 'ParseError';
        this.line = line;
    }
}
