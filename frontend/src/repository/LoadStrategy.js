export class LoadStrategy {
	constructor(callback) {
		this.callback = callback;
	}

	// eslint-disable-next-line no-unused-vars
	async load(id) {
		throw new Error('Load method must be implemented by subclasses');
	}
}
