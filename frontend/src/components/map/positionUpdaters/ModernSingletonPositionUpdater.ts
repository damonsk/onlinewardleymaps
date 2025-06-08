import {Moved, PositionUpdater} from '../../../types/base';

/**
 * ModernSingletonPositionUpdater - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This position updater handles singleton elements in the map DSL.
 * If the element exists, it delegates to a successor updater.
 * If the element doesn't exist, it creates a new entry in the map DSL.
 */
export default class ModernSingletonPositionUpdater implements PositionUpdater {
    private type: string;
    private mutator: (text: string) => void;
    private mapText: string;
    private positionUpdater: PositionUpdater | null;

    /**
     * Creates a new ModernSingletonPositionUpdater
     *
     * @param type The type of the singleton element
     * @param mapText The current map text content
     * @param mutator A function that updates the map text
     */
    constructor(type: string, mapText: string, mutator: (text: string) => void) {
        this.type = type;
        this.mutator = mutator;
        this.mapText = mapText;
        this.positionUpdater = null;
    }

    /**
     * Sets the successor for the Chain of Responsibility pattern
     *
     * @param positionUpdater The next position updater in the chain
     */
    setSuccessor(positionUpdater: PositionUpdater): void {
        this.positionUpdater = positionUpdater;
    }

    /**
     * Updates the position of a singleton element
     * If element exists, delegates to successor
     * If element doesn't exist, creates a new entry
     *
     * @param moved The new position values
     * @param identifier The element identifier (not used for singletons)
     */
    update(moved: Moved, identifier: string): void {
        if (this.mapText.indexOf(this.type + ' ') > -1 && this.positionUpdater != null) {
            this.positionUpdater.update(moved, identifier);
        } else {
            this.mutator(this.mapText + '\n' + this.type + ` [${moved.param1}, ${moved.param2}]`);
        }
    }
}
