import { PositionUpdater, Replacer } from '../../../types/base';

/**
 * ModernDefaultPositionUpdater - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This class updates positions for map elements by applying a set of replacers
 * to each line of text in the map DSL representation
 */
export default class ModernDefaultPositionUpdater implements PositionUpdater {
    type: string;
    mapText: string;
    mutator: (updatedText: string) => void;
    replacers: Replacer[];

    /**
     * Creates a new DefaultPositionUpdater
     *
     * @param type The type of the element to update
     * @param mapText The current map text content
     * @param mutator A function that updates the map text
     * @param replacers Array of replacers to apply
     */
    constructor(
        type: string,
        mapText: string,
        mutator: (updatedText: string) => void,
        replacers: Replacer[],
    ) {
        this.type = type;
        this.mapText = mapText;
        this.mutator = mutator;
        this.replacers = replacers;
    }

    /**
     * Not implemented in this updater
     */
    //eslint-disable-next-line
    setSuccessor(_positionUpdater: PositionUpdater) {
        throw new Error('Method not implemented.');
    }

    /**
     * Updates the position of an element in the map text
     *
     * @param moved The new position values
     * @param identifier The element identifier
     */
    update(moved: any, identifier: string): void {
        const updatedText = this.mapText
            .split('\n')
            .map((line) => {
                for (let i = 0; i < this.replacers.length; i++) {
                    const r = this.replacers[i];
                    if (r.matcher(line, identifier, this.type)) {
                        return r.action(line, moved);
                    }
                }
                return line;
            })
            .join('\n');

        this.mutator(updatedText);
    }
}
