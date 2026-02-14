/**
 * MapTitleManager - Service for managing map title and DSL generation
 *
 * Handles parsing and updating of map title including:
 * - Title extraction from map text
 * - Title DSL generation and updates
 * - Title validation
 */

export interface MapTitleUpdateResult {
    updatedMapText: string;
    titleAdded: boolean;
    titleUpdated: boolean;
    lineNumber?: number;
}

export class MapTitleManager {
    private static readonly TITLE_PATTERN = /^title\s+(.+)$/m;

    /**
     * Get current map title from map text
     */
    static getCurrentTitle(mapText: string): string {
        const match = mapText.match(this.TITLE_PATTERN);
        return match ? match[1].trim() : 'Untitled Map';
    }

    /**
     * Update map title in map text
     */
    static updateMapTitle(mapText: string, newTitle: string): MapTitleUpdateResult {
        if (!this.validateTitle(newTitle)) {
            throw new Error('Invalid title: title cannot be empty and must be less than 200 characters');
        }

        const titleDSL = this.generateTitleDSL(newTitle);
        return this.updateOrAddTitle(mapText, titleDSL);
    }

    /**
     * Generate DSL syntax for map title
     */
    static generateTitleDSL(title: string): string {
        return `title ${title}`;
    }

    /**
     * Update or add title in the map text
     */
    private static updateOrAddTitle(mapText: string, newTitleDSL: string): MapTitleUpdateResult {
        const lines = mapText.split('\n');

        // Find existing title line
        let existingTitleIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (this.TITLE_PATTERN.test(lines[i])) {
                existingTitleIndex = i;
                break;
            }
        }

        if (existingTitleIndex >= 0) {
            // Update existing title
            lines[existingTitleIndex] = newTitleDSL;
            return {
                updatedMapText: lines.join('\n'),
                titleAdded: false,
                titleUpdated: true,
                lineNumber: existingTitleIndex + 1,
            };
        } else {
            // Add new title at the beginning
            lines.unshift(newTitleDSL);
            return {
                updatedMapText: lines.join('\n'),
                titleAdded: true,
                titleUpdated: false,
                lineNumber: 1,
            };
        }
    }

    /**
     * Validate title value
     */
    private static validateTitle(title: string): boolean {
        return typeof title === 'string' && title.trim().length > 0 && title.trim().length <= 200;
    }

    /**
     * Check if map text has a custom title (not default)
     */
    static hasCustomTitle(mapText: string): boolean {
        const currentTitle = this.getCurrentTitle(mapText);
        return currentTitle !== 'Untitled Map';
    }

    /**
     * Get title line number for debugging/editing purposes
     */
    static getTitleLineNumber(mapText: string): number | null {
        const lines = mapText.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (this.TITLE_PATTERN.test(lines[i])) {
                return i + 1;
            }
        }
        return null;
    }

    /**
     * Remove title from map text
     */
    static removeTitle(mapText: string): MapTitleUpdateResult {
        const lines = mapText.split('\n');
        let titleIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            if (this.TITLE_PATTERN.test(lines[i])) {
                titleIndex = i;
                break;
            }
        }

        if (titleIndex >= 0) {
            lines.splice(titleIndex, 1);
            return {
                updatedMapText: lines.join('\n'),
                titleAdded: false,
                titleUpdated: true,
                lineNumber: titleIndex + 1,
            };
        }

        // No title found, return unchanged
        return {
            updatedMapText: mapText,
            titleAdded: false,
            titleUpdated: false,
        };
    }
}

export default MapTitleManager;
