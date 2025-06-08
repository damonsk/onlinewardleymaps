import {Replacer} from '../../../types/base';

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
    constructor(type: string, mapText: string, mutator: (text: string) => void, replacers: Replacer[]) {
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
     * @param line The line number to update (1-based)
     */
    update(moved: any, identifier: string, line: number): void {
        const splitArray = this.mapText.split('\n');

        // Handle out-of-bounds line numbers
        if (line > splitArray.length) {
            // If line is out of bounds, pad the array with empty lines and add "undefined"
            const paddingNeeded = line - splitArray.length;
            for (let i = 0; i < paddingNeeded - 1; i++) {
                splitArray.push('');
            }
            splitArray.push('undefined');
            this.mutator(splitArray.join('\n'));
            return;
        }

        // Get the line content (adjust for 0-based array index)
        const lineIndex = line - 1;
        let getLine = splitArray[lineIndex];

        // Apply replacers in order until we find a match
        for (const replacer of this.replacers) {
            // Explicitly coerce matcher result to boolean to handle undefined/null
            if (Boolean(replacer.matcher(getLine, identifier, this.type))) {
                // If there's a match, call the action and update the line
                getLine = replacer.action(getLine, moved);
                splitArray[lineIndex] = getLine;
                break; // Stop after first match
            }
        }

        // Always call the mutator with the current state of the text
        this.mutator(splitArray.join('\n'));
    }
}
