export abstract class LoadStrategy {
    protected callback: (strategy: string, data: any) => void;
    constructor(callback: () => void) {
        this.callback = callback;
    }

    abstract load(id: string): Promise<void>;
}
