import {Replacer} from '../../../types/base';

export default class ModernLineNumberPositionUpdater {
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
        const splitArray = this.mapText.split('\n');

        if (line > splitArray.length) {
            const paddingNeeded = line - splitArray.length;
            for (let i = 0; i < paddingNeeded - 1; i++) {
                splitArray.push('');
            }
            splitArray.push('undefined');
            this.mutator(splitArray.join('\n'));
            return;
        }

        const lineIndex = line - 1;
        let getLine = splitArray[lineIndex];

        for (const replacer of this.replacers) {
            if (Boolean(replacer.matcher(getLine, identifier, this.type))) {
                getLine = replacer.action(getLine, moved);
                splitArray[lineIndex] = getLine;
                break; // Stop after first match
            }
        }

        this.mutator(splitArray.join('\n'));
    }
}
