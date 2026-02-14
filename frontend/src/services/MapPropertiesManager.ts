/**
 * MapPropertiesManager - Service for managing map-level properties and DSL generation
 *
 * Handles parsing and updating of map properties including:
 * - Map style (plain, wardley, colour)
 * - Map size (width, height)
 * - Evolution stages (custom stage names)
 */

export interface MapProperties {
    style?: 'plain' | 'wardley' | 'colour';
    size?: {width: number; height: number};
    evolution?: {stage1: string; stage2: string; stage3: string; stage4: string};
}

export interface MapPropertiesUpdateResult {
    updatedMapText: string;
    propertyAdded: boolean;
    propertyUpdated: boolean;
    lineNumber?: number;
}

export class MapPropertiesManager {
    private static readonly DSL_PATTERNS = {
        style: /^style\s+(plain|wardley|colour)\s*$/m,
        size: /^size\s+\[(\d+),\s*(\d+)\]\s*$/m,
        evolution: /^evolution\s+(.+?)->(.+?)->(.+?)->(.+?)\s*$/m,
    };

    private static readonly DEFAULT_EVOLUTION_STAGES = {
        stage1: 'Genesis',
        stage2: 'Custom Built',
        stage3: 'Product',
        stage4: 'Commodity',
    };

    /**
     * Parse all map properties from map text
     */
    static parseMapProperties(mapText: string): MapProperties {
        const properties: MapProperties = {};

        // Parse style
        const styleMatch = mapText.match(this.DSL_PATTERNS.style);
        if (styleMatch) {
            properties.style = styleMatch[1] as 'plain' | 'wardley' | 'colour';
        }

        // Parse size
        const sizeMatch = mapText.match(this.DSL_PATTERNS.size);
        if (sizeMatch) {
            properties.size = {
                width: parseInt(sizeMatch[1], 10),
                height: parseInt(sizeMatch[2], 10),
            };
        }

        // Parse evolution stages
        const evolutionMatch = mapText.match(this.DSL_PATTERNS.evolution);
        if (evolutionMatch) {
            properties.evolution = {
                stage1: evolutionMatch[1].trim(),
                stage2: evolutionMatch[2].trim(),
                stage3: evolutionMatch[3].trim(),
                stage4: evolutionMatch[4].trim(),
            };
        }

        return properties;
    }

    /**
     * Get current map style from map text
     */
    static getCurrentStyle(mapText: string): 'plain' | 'wardley' | 'colour' | null {
        const properties = this.parseMapProperties(mapText);
        return properties.style || null;
    }

    /**
     * Get current map size from map text
     */
    static getCurrentSize(mapText: string): {width: number; height: number} | null {
        const properties = this.parseMapProperties(mapText);
        return properties.size || null;
    }

    /**
     * Get current evolution stages from map text
     */
    static getCurrentEvolutionStages(mapText: string): {stage1: string; stage2: string; stage3: string; stage4: string} | null {
        const properties = this.parseMapProperties(mapText);
        return properties.evolution || null;
    }

    /**
     * Update map style in map text
     */
    static updateMapStyle(mapText: string, style: 'plain' | 'wardley' | 'colour'): MapPropertiesUpdateResult {
        const styleDSL = this.generateStyleDSL(style);
        return this.updateOrAddProperty(mapText, 'style', styleDSL);
    }

    /**
     * Update map size in map text
     */
    static updateMapSize(mapText: string, width: number, height: number): MapPropertiesUpdateResult {
        if (!this.validateSize(width, height)) {
            throw new Error('Invalid map size: width and height must be positive integers between 100 and 5000');
        }

        const sizeDSL = this.generateSizeDSL(width, height);
        return this.updateOrAddProperty(mapText, 'size', sizeDSL);
    }

    /**
     * Update evolution stages in map text
     */
    static updateEvolutionStages(
        mapText: string,
        stages: {stage1: string; stage2: string; stage3: string; stage4: string},
    ): MapPropertiesUpdateResult {
        if (!this.validateEvolutionStages(stages)) {
            throw new Error('Invalid evolution stages: all stage names must be non-empty and 1-50 characters long');
        }

        const evolutionDSL = this.generateEvolutionDSL(stages.stage1, stages.stage2, stages.stage3, stages.stage4);
        return this.updateOrAddProperty(mapText, 'evolution', evolutionDSL);
    }

    /**
     * Generate DSL syntax for map style
     */
    static generateStyleDSL(style: 'plain' | 'wardley' | 'colour'): string {
        return `style ${style}`;
    }

    /**
     * Generate DSL syntax for map size
     */
    static generateSizeDSL(width: number, height: number): string {
        return `size [${width}, ${height}]`;
    }

    /**
     * Generate DSL syntax for evolution stages
     */
    static generateEvolutionDSL(stage1: string, stage2: string, stage3: string, stage4: string): string {
        return `evolution ${stage1}->${stage2}->${stage3}->${stage4}`;
    }

    /**
     * Update or add a property in the map text
     */
    private static updateOrAddProperty(
        mapText: string,
        propertyType: 'style' | 'size' | 'evolution',
        newDSL: string,
    ): MapPropertiesUpdateResult {
        const lines = mapText.split('\n');
        const pattern = this.DSL_PATTERNS[propertyType];

        // Find existing property line
        let existingLineIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
                existingLineIndex = i;
                break;
            }
        }

        if (existingLineIndex >= 0) {
            // Update existing property
            lines[existingLineIndex] = newDSL;
            return {
                updatedMapText: lines.join('\n'),
                propertyAdded: false,
                propertyUpdated: true,
                lineNumber: existingLineIndex + 1,
            };
        } else {
            // Add new property - insert after title if it exists, otherwise at the beginning
            let insertIndex = 0;

            // Look for title line
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith('title ')) {
                    insertIndex = i + 1;
                    break;
                }
            }

            // Insert the new property
            lines.splice(insertIndex, 0, newDSL);

            return {
                updatedMapText: lines.join('\n'),
                propertyAdded: true,
                propertyUpdated: false,
                lineNumber: insertIndex + 1,
            };
        }
    }

    /**
     * Validate map size values
     */
    private static validateSize(width: number, height: number): boolean {
        return Number.isInteger(width) && Number.isInteger(height) && width >= 100 && width <= 5000 && height >= 100 && height <= 5000;
    }

    /**
     * Validate evolution stage names
     */
    private static validateEvolutionStages(stages: {stage1: string; stage2: string; stage3: string; stage4: string}): boolean {
        const stageNames = [stages.stage1, stages.stage2, stages.stage3, stages.stage4];
        return stageNames.every(stage => typeof stage === 'string' && stage.trim().length > 0 && stage.trim().length <= 50);
    }

    /**
     * Get default evolution stages
     */
    static getDefaultEvolutionStages(): {stage1: string; stage2: string; stage3: string; stage4: string} {
        return {...this.DEFAULT_EVOLUTION_STAGES};
    }

    /**
     * Check if map text has any custom properties
     */
    static hasCustomProperties(mapText: string): boolean {
        const properties = this.parseMapProperties(mapText);
        return !!(properties.style || properties.size || properties.evolution);
    }

    /**
     * Get property line numbers for debugging/editing purposes
     */
    static getPropertyLineNumbers(mapText: string): {style?: number; size?: number; evolution?: number} {
        const lines = mapText.split('\n');
        const lineNumbers: {style?: number; size?: number; evolution?: number} = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (this.DSL_PATTERNS.style.test(line)) {
                lineNumbers.style = i + 1;
            } else if (this.DSL_PATTERNS.size.test(line)) {
                lineNumbers.size = i + 1;
            } else if (this.DSL_PATTERNS.evolution.test(line)) {
                lineNumbers.evolution = i + 1;
            }
        }

        return lineNumbers;
    }
}

export default MapPropertiesManager;
