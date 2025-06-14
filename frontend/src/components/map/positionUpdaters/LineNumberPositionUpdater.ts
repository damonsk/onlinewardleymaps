import {Replacer} from '../../../types/base';

export default class LineNumberPositionUpdater {
    private type: string;
    private mapText: string;
    private mutator: (text: string) => void;
    private replacers: Replacer[];

    constructor(type: string, mapText: string, mutator: (text: string) => void, replacers: Replacer[]) {
        this.type = type;
        this.mapText = mapText;
        this.mutator = mutator;
        this.replacers = replacers;
    }
    update(moved: any, identifier: string, line: number): void {
        let getLine = this.mapText.split('\n')[line - 1];
        for (let i = 0; i < this.replacers.length; i++) {
            const r = this.replacers[i];
            if (r.matcher(getLine, identifier, this.type)) {
                getLine = r.action(getLine, moved);
            }
        }
        const splitArray = this.mapText.split('\n');
        splitArray[line - 1] = getLine;
        this.mutator(splitArray.join('\n'));
    }
}
