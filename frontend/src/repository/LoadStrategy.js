export class LoadStrategy {
    constructor(callback) {
        this.callback = callback;
    }

    async load() {
        throw new Error('Load method must be implemented by subclasses');
    }
}
