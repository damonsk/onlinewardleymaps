import { PositionUpdater } from './DefaultPositionUpdater';

interface Moved {
    param1: number;
    param2: number;
}

export default class SingletonPositionUpdater implements PositionUpdater {
    private type: string;
    private mutator: (text: string) => void;
    private mapText: string;
    private positionUpdater: PositionUpdater | null;

    constructor(type: string, mapText: string, mutator: (text: string) => void) {
        this.type = type;
        this.mutator = mutator;
        this.mapText = mapText;
        this.positionUpdater = null;
    }
    setSuccessor(positionUpdater: PositionUpdater): void {
        this.positionUpdater = positionUpdater;
    }
    update(moved: Moved, identifier: string): void {
        if (
            this.mapText.indexOf(this.type + ' ') > -1 &&
            this.positionUpdater != null
        ) {
            this.positionUpdater.update(moved, identifier);
        } else {
            this.mutator(
                this.mapText +
                '\n' +
                this.type +
                ` [${moved.param1}, ${moved.param2}]`
            );
        }
    }
}
