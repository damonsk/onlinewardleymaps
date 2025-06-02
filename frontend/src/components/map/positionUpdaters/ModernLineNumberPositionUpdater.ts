import { Replacer } from '../../../types/base';

/**
 * ModernLineNumberPositionUpdater - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This class updates positions for map elements at a specific line number
 * by applying a set of replacers
 */
export default class ModernLineNumberPositionUpdater {
    private type: string;
    private mapText: string;
    private mutator: (text: string) => void;
    private replacers: Replacer[];

    /**
     * Creates a new LineNumberPositionUpdater
     *
     * @param type The type of the element to update
     * @param mapText The current map text content
     * @param mutator A function that updates the map text
     * @param replacers Array of replacers to apply
     */
    constructor(
        type: string,
        mapText: string,
        mutator: (text: string) => void,
        replacers: Replacer[],
    ) {
        this.type = type;
        this.mapText = mapText;
        this.mutator = mutator;
        this.replacers = replacers;
    }

    /**
     * Updates the position of an element in the map text at a specific line
     *
     * @param moved The new position values
     * @param identifier The element identifier
     * @param line The line number to update
     */
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
