/**
 * Utility functions for map text generation and mutation
 * This module provides enhanced functionality for task 7: map text generation and mutation
 */

import {ToolbarItem} from '../types/toolbar';
import {UnifiedComponent} from '../types/unified/components';
import {escapeComponentNameForMapText} from './componentNameMatching';

/**
 * Helper functions for multi-line note support
 */

/**
 * Determines if text content requires quoted syntax
 * @param text - Text content to check
 * @returns True if quoting is required
 */
export function requiresQuoting(text: string): boolean {
    return text.includes('\n') || text.includes('"') || text.includes('\\');
}

/**
 * Escapes text content for quoted note syntax
 * @param text - Text to escape
 * @returns Escaped text suitable for quoted syntax
 */
export function escapeNoteText(text: string): string {
    return text
        .replace(/\\/g, '\\\\') // Escape backslashes first
        .replace(/"/g, '\\"') // Escape quotes
        .replace(/\n/g, '\\n'); // Convert line breaks to \n
}

/**
 * Generates properly formatted note text with automatic quoting
 * @param text - Note text content
 * @param y - Y coordinate
 * @param x - X coordinate
 * @returns Formatted note text
 */
export function generateNoteText(text: string, y: string, x: string): string {
    const trimmedText = text.trim();

    if (requiresQuoting(trimmedText)) {
        const escapedText = escapeNoteText(trimmedText);
        return `note "${escapedText}" [${y}, ${x}]`;
    } else {
        // Simple text, use unquoted syntax
        const sanitizedText = trimmedText.replace(/[\[\]]/g, ''); // Remove brackets that could break syntax
        return `note ${sanitizedText} [${y}, ${x}]`;
    }
}

/**
 * Interface for component placement parameters
 */
export interface ComponentPlacementParams {
    item: ToolbarItem;
    position: {x: number; y: number};
    existingComponents: UnifiedComponent[];
    currentMapText: string;
}

/**
 * Interface for component naming options
 */
export interface ComponentNamingOptions {
    baseName: string;
    existingNames: string[];
    maxAttempts?: number;
}

/**
 * Interface for map text formatting options
 */
export interface MapTextFormattingOptions {
    preserveWhitespace?: boolean;
    ensureNewlineAtEnd?: boolean;
    normalizeLineEndings?: boolean;
}

/**
 * Generates a unique component name by appending incremental numbers if needed
 *
 * @param options - Component naming options
 * @returns Unique component name
 */
export function generateUniqueComponentName(options: ComponentNamingOptions): string {
    const {baseName, existingNames, maxAttempts = 1000} = options;

    // Validate input
    if (!baseName || typeof baseName !== 'string') {
        throw new Error('Base name must be a non-empty string');
    }

    if (!Array.isArray(existingNames)) {
        throw new Error('Existing names must be an array');
    }

    let componentName = baseName.trim();
    let counter = 1;
    let attempts = 0;

    // Find a unique name by appending numbers if needed
    while (existingNames.includes(componentName) && attempts < maxAttempts) {
        componentName = `${baseName.trim()} ${counter}`;
        counter++;
        attempts++;
    }

    if (attempts >= maxAttempts) {
        throw new Error(`Could not generate unique name after ${maxAttempts} attempts`);
    }

    return componentName;
}

/**
 * Formats coordinates to ensure consistent precision
 *
 * @param coordinate - Raw coordinate value
 * @param precision - Number of decimal places (default: 2)
 * @returns Formatted coordinate string
 */
export function formatCoordinate(coordinate: number, precision: number = 2): string {
    if (typeof coordinate !== 'number' || isNaN(coordinate)) {
        throw new Error('Coordinate must be a valid number');
    }

    // Clamp coordinate to valid range [0, 1]
    const clampedCoordinate = Math.max(0, Math.min(1, coordinate));

    return clampedCoordinate.toFixed(precision);
}

/**
 * Validates a template function to ensure it can generate valid map text
 *
 * @param template - Template function to validate
 * @param itemId - Item ID for error reporting
 * @returns Validation result
 */
export function validateTemplate(
    template: any,
    itemId: string,
): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!template) {
        errors.push(`Template is missing for item ${itemId}`);
        return {isValid: false, errors};
    }

    if (typeof template !== 'function') {
        errors.push(`Template must be a function for item ${itemId}`);
        return {isValid: false, errors};
    }

    // Test the template with sample data
    try {
        const testResult = template?.('Test Component', '0.50', '0.50');

        if (typeof testResult !== 'string') {
            errors.push(`Template must return a string for item ${itemId}`);
        } else if (!testResult.trim()) {
            errors.push(`Template returns empty string for item ${itemId}`);
        } else if (testResult.length > 1000) {
            errors.push(`Template returns excessively long string for item ${itemId}`);
        }
    } catch (templateError) {
        errors.push(
            `Template throws error for item ${itemId}: ${templateError instanceof Error ? templateError.message : 'Unknown error'}`,
        );
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Creates a fallback template for a given component type
 *
 * @param itemId - Item ID to determine component type
 * @param category - Component category
 * @returns Fallback template function
 */
export function createFallbackTemplate(itemId: string, category: string): (name: string, y: string, x: string) => string {
    return (name: string, y: string, x: string) => {
        // Sanitize inputs and handle escaping for components
        let safeName: string;
        if (category === 'note') {
            // For notes, preserve line breaks and only trim whitespace
            safeName = (name || 'New Note').trim();
        } else {
            // For other components, escape if needed for map text syntax
            const trimmedName = (name || 'New Component').trim();
            safeName = escapeComponentNameForMapText(trimmedName);
        }

        const safeY = formatCoordinate(parseFloat(y) || 0.5);
        const safeX = formatCoordinate(parseFloat(x) || 0.5);

        // Generate appropriate template based on category and item ID
        switch (category) {
            case 'component':
                if (itemId.includes('inertia')) {
                    return `component ${safeName} [${safeY}, ${safeX}] inertia`;
                } else if (itemId.includes('market')) {
                    return `component ${safeName} [${safeY}, ${safeX}] (market)`;
                } else if (itemId.includes('ecosystem')) {
                    return `component ${safeName} [${safeY}, ${safeX}] (ecosystem)`;
                } else {
                    return `component ${safeName} [${safeY}, ${safeX}]`;
                }

            case 'method':
                if (itemId.includes('buy')) {
                    return `component ${safeName} [${safeY}, ${safeX}] (buy)`;
                } else if (itemId.includes('build')) {
                    return `component ${safeName} [${safeY}, ${safeX}] (build)`;
                } else if (itemId.includes('outsource')) {
                    return `component ${safeName} [${safeY}, ${safeX}] (outsource)`;
                } else {
                    return `component ${safeName} [${safeY}, ${safeX}]`;
                }

            case 'note':
                return generateNoteText(safeName, safeY, safeX);

            case 'pipeline':
                // Use the enhanced pipeline generation for fallback
                try {
                    return generatePipelineMapText(safeName, {x: parseFloat(safeX), y: parseFloat(safeY)});
                } catch (error) {
                    console.warn('Failed to generate enhanced pipeline text, using basic fallback:', error);
                    return `pipeline ${safeName} [${safeY}, ${safeX}]`;
                }

            case 'other':
                if (itemId.includes('anchor')) {
                    return `anchor ${safeName} [${safeY}, ${safeX}]`;
                } else {
                    return `component ${safeName} [${safeY}, ${safeX}]`;
                }

            default:
                return `component ${safeName} [${safeY}, ${safeX}]`;
        }
    };
}

/**
 * Generates map text for a new component using the toolbar item template with validation and fallbacks
 *
 * @param item - Toolbar item configuration
 * @param componentName - Unique component name
 * @param position - Component position coordinates
 * @param existingMapText - Existing map text for pipeline global uniqueness
 * @returns Generated map text string
 */
export function generateComponentMapText(
    item: ToolbarItem,
    componentName: string,
    position: {x: number; y: number},
    existingMapText: string = '',
): string {
    if (!item) {
        throw new Error('Toolbar item is required');
    }

    if (!componentName || typeof componentName !== 'string') {
        throw new Error('Component name must be a non-empty string');
    }

    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
        throw new Error('Position must contain valid x and y coordinates');
    }

    // Sanitize component name - preserve line breaks for notes, use proper escaping for components
    let safeName: string;
    if (item.category === 'note') {
        // For notes, preserve line breaks and only trim whitespace
        safeName = componentName.trim();
    } else {
        // For other components, use proper escaping if name contains special characters
        const trimmedName = componentName.trim();
        if (trimmedName.includes('\n') || trimmedName.includes('"') || trimmedName.includes('\\')) {
            // Use escaped format for multi-line or special character names
            safeName = escapeComponentNameForMapText(trimmedName);
        } else {
            // Simple name, use as-is
            safeName = trimmedName;
        }
    }

    if (!safeName) {
        throw new Error('Component name cannot be empty after sanitization');
    }

    try {
        // Format coordinates with consistent precision
        const formattedY = formatCoordinate(position.y);
        const formattedX = formatCoordinate(position.x);

        // Validate the template first
        const templateValidation = item.template
            ? validateTemplate(item.template, item.id)
            : {isValid: false, errors: ['Template is undefined']};

        let template = item.template;

        // Use fallback template if validation fails
        if (!templateValidation.isValid) {
            console.warn(`Template validation failed for ${item.id}:`, templateValidation.errors);
            template = createFallbackTemplate(item.id, item.category);
            console.info(`Using fallback template for ${item.id}`);
        }

        // Generate map text using the template (original or fallback)
        let result: string;
        try {
            // For pipeline templates, pass existing map text for global uniqueness
            if (item.id === 'pipeline' && template && typeof template === 'function') {
                result = (template as any)(safeName, formattedY, formattedX, existingMapText) || '';
            } else {
                result = template?.(safeName, formattedY, formattedX) || '';
            }
        } catch (templateError) {
            console.error(`Template execution failed for ${item.id}:`, templateError);
            // Use basic fallback template as last resort
            const basicTemplate = createFallbackTemplate(item.id, item.category);
            result = basicTemplate(safeName, formattedY, formattedX);
            console.info(`Using basic fallback template for ${item.id}`);
        }

        // Validate the generated result
        if (!result || typeof result !== 'string') {
            throw new Error('Template returned invalid result');
        }

        const trimmedResult = result.trim();
        if (!trimmedResult) {
            throw new Error('Template returned empty result');
        }

        // Additional validation for reasonable length
        if (trimmedResult.length > 1000) {
            console.warn(`Generated map text is unusually long (${trimmedResult.length} characters)`);
        }

        return trimmedResult;
    } catch (error) {
        // Final fallback: create a basic component entry
        console.error(`All template generation methods failed for ${item.id}:`, error);
        const formattedY = formatCoordinate(position.y);
        const formattedX = formatCoordinate(position.x);
        return `component ${safeName} [${formattedY}, ${formattedX}]`;
    }
}

/**
 * Formats and normalizes map text structure
 *
 * @param mapText - Current map text
 * @param options - Formatting options
 * @returns Formatted map text
 */
export function formatMapText(mapText: string, options: MapTextFormattingOptions = {}): string {
    const {preserveWhitespace = false, ensureNewlineAtEnd = false, normalizeLineEndings = true} = options;

    if (typeof mapText !== 'string') {
        return '';
    }

    let formatted = mapText;

    // Normalize line endings if requested
    if (normalizeLineEndings) {
        formatted = formatted.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    // Trim whitespace if not preserving it
    if (!preserveWhitespace) {
        formatted = formatted.trim();
    }

    // Ensure newline at end if requested and text is not empty
    if (ensureNewlineAtEnd && formatted.length > 0 && !formatted.endsWith('\n')) {
        formatted += '\n';
    }

    return formatted;
}

/**
 * Adds a new component to existing map text with proper formatting
 *
 * @param currentMapText - Current map text
 * @param newComponentText - New component text to add
 * @param options - Formatting options
 * @returns Updated map text
 */
export function addComponentToMapText(currentMapText: string, newComponentText: string, options: MapTextFormattingOptions = {}): string {
    if (typeof newComponentText !== 'string' || !newComponentText.trim()) {
        throw new Error('New component text must be a non-empty string');
    }

    const formattedCurrentText = formatMapText(currentMapText || '', options);
    const formattedNewText = newComponentText.trim();

    // If current text is empty, just return the new component text
    if (!formattedCurrentText) {
        return formattedNewText;
    }

    // Add new component with proper line separation
    return formattedCurrentText + '\n' + formattedNewText;
}

/**
 * Main function to handle complete component placement workflow
 *
 * @param params - Component placement parameters
 * @param options - Formatting options
 * @returns Object containing the new component name and updated map text
 */
export function placeComponent(
    params: ComponentPlacementParams,
    options: MapTextFormattingOptions = {},
): {componentName: string; updatedMapText: string} {
    const {item, position, existingComponents, currentMapText} = params;

    // Validate input parameters
    if (!item || !item.defaultName || !item.template) {
        throw new Error('Invalid toolbar item: missing defaultName or template');
    }

    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
        throw new Error('Invalid position: must contain numeric x and y coordinates');
    }

    if (!Array.isArray(existingComponents)) {
        throw new Error('Existing components must be an array');
    }

    try {
        // Generate unique component name using all existing component names from map text
        const existingNames = extractAllComponentNames(currentMapText);
        const componentName = generateUniqueComponentName({
            baseName: item.defaultName,
            existingNames,
        });

        // Generate component map text
        const newComponentText = generateComponentMapText(item, componentName, position, currentMapText);

        // Add component to map text with proper formatting
        const updatedMapText = addComponentToMapText(currentMapText, newComponentText, options);

        return {
            componentName,
            updatedMapText,
        };
    } catch (error) {
        throw new Error(`Failed to place component: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Calculates optimal positions for default pipeline components with proper spacing
 *
 * @param baseMaturity - Base maturity position where pipeline was placed
 * @param spacing - Desired spacing between components (default: 0.3)
 * @returns Object containing calculated component positions
 */
export function calculatePipelineComponentPositions(baseMaturity: number, spacing: number = 0.3): {component1: number; component2: number} {
    if (typeof baseMaturity !== 'number' || isNaN(baseMaturity)) {
        throw new Error('Base maturity must be a valid number');
    }

    if (typeof spacing !== 'number' || isNaN(spacing) || spacing <= 0) {
        throw new Error('Spacing must be a positive number');
    }

    // Calculate ideal positions with half spacing on each side
    const halfSpacing = spacing / 2;
    let component1 = baseMaturity - halfSpacing;
    let component2 = baseMaturity + halfSpacing;

    // Handle edge cases where components would go outside valid range [0, 1]
    if (component1 < 0) {
        // Shift both components to the right
        const adjustment = -component1;
        component1 = 0;
        component2 = Math.min(1, component2 + adjustment);
    } else if (component2 > 1) {
        // Shift both components to the left
        const adjustment = component2 - 1;
        component2 = 1;
        component1 = Math.max(0, component1 - adjustment);
    }

    // Ensure minimum separation if both components end up at extremes
    if (component2 - component1 < 0.1) {
        if (baseMaturity <= 0.5) {
            component1 = Math.max(0, baseMaturity - 0.05);
            component2 = Math.min(1, baseMaturity + 0.25);
        } else {
            component1 = Math.max(0, baseMaturity - 0.25);
            component2 = Math.min(1, baseMaturity + 0.05);
        }
    }

    return {
        component1: parseFloat(component1.toFixed(2)),
        component2: parseFloat(component2.toFixed(2)),
    };
}

/**
 * Generates a complete pipeline block with default components
 *
 * @param pipelineName - Name of the pipeline
 * @param baseMaturity - Base maturity position for component spacing
 * @returns Formatted pipeline block string
 */
export function generatePipelineBlock(pipelineName: string, baseMaturity: number): string {
    if (!pipelineName || typeof pipelineName !== 'string') {
        throw new Error('Pipeline name must be a non-empty string');
    }

    const positions = calculatePipelineComponentPositions(baseMaturity);

    return `pipeline ${pipelineName}
{
    component Pipeline Component 1 [${positions.component1.toFixed(2)}]
    component Pipeline Component 2 [${positions.component2.toFixed(2)}]
}`;
}

/**
 * Generates complete pipeline map text including both component line and pipeline block
 *
 * @param pipelineName - Name of the pipeline
 * @param position - Position coordinates {x: maturity, y: visibility}
 * @returns Complete pipeline map text
 */
export function generatePipelineMapText(pipelineName: string, position: {x: number; y: number}): string {
    if (!pipelineName || typeof pipelineName !== 'string') {
        throw new Error('Pipeline name must be a non-empty string');
    }

    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
        throw new Error('Position must contain valid x and y coordinates');
    }

    const formattedY = formatCoordinate(position.y);
    const formattedX = formatCoordinate(position.x);

    // Generate component line
    const componentLine = `component ${pipelineName} [${formattedY}, ${formattedX}]`;

    // Generate pipeline block
    const pipelineBlock = generatePipelineBlock(pipelineName, position.x);

    return `${componentLine}\n${pipelineBlock}`;
}

/**
 * Inserts a component into an existing pipeline block
 *
 * @param mapText - Current map text
 * @param pipelineName - Name of the target pipeline
 * @param componentName - Name of the component to add
 * @param maturity - Maturity position for the component
 * @param labelOffset - Optional label offset
 * @returns Updated map text with inserted component
 */
export function insertPipelineComponent(
    mapText: string,
    pipelineName: string,
    componentName: string,
    maturity: number,
    labelOffset?: {x: number; y: number},
): string {
    if (!mapText || typeof mapText !== 'string') {
        throw new Error('Map text must be a non-empty string');
    }

    if (!pipelineName || typeof pipelineName !== 'string') {
        throw new Error('Pipeline name must be a non-empty string');
    }

    if (!componentName || typeof componentName !== 'string') {
        throw new Error('Component name must be a non-empty string');
    }

    if (typeof maturity !== 'number' || isNaN(maturity) || maturity < 0 || maturity > 1) {
        throw new Error('Maturity must be a number between 0 and 1');
    }

    const lines = mapText.split('\n');
    const pipelineBlockStart = findPipelineBlockStart(lines, pipelineName);

    if (pipelineBlockStart === -1) {
        throw new Error(`Pipeline "${pipelineName}" not found in map text`);
    }

    // Format the new component line
    const formattedMaturity = formatCoordinate(maturity);
    let componentLine = `    component ${componentName} [${formattedMaturity}]`;

    if (labelOffset) {
        componentLine += ` label [${labelOffset.x}, ${labelOffset.y}]`;
    }

    // Insert the component line at the beginning of the pipeline block (after the opening brace)
    const insertIndex = pipelineBlockStart + 1;
    lines.splice(insertIndex, 0, componentLine);

    return lines.join('\n');
}

/**
 * Finds the start line index of a pipeline block
 *
 * @param lines - Array of map text lines
 * @param pipelineName - Name of the pipeline to find
 * @returns Line index of pipeline block start, or -1 if not found
 */
function findPipelineBlockStart(lines: string[], pipelineName: string): number {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Look for pipeline declaration
        if (line.startsWith(`pipeline ${pipelineName}`)) {
            // Find the opening brace on the same or next line
            for (let j = i; j < Math.min(i + 3, lines.length); j++) {
                if (lines[j].trim() === '{') {
                    return j;
                }
            }
        }
    }
    return -1;
}

/**
 * Interface for pipeline bounds information
 */
export interface PipelineBounds {
    name: string;
    minMaturity: number;
    maxMaturity: number;
    visibility: number;
    line?: number;
}

/**
 * Calculates the maturity bounds of a pipeline based on its components
 *
 * @param pipeline - Pipeline data
 * @returns Pipeline bounds information
 */
export function calculatePipelineBounds(pipeline: any): PipelineBounds {
    if (!pipeline || !pipeline.name) {
        throw new Error('Pipeline must have a name');
    }

    if (!pipeline.components || !Array.isArray(pipeline.components) || pipeline.components.length === 0) {
        // For pipelines with no components, use a small default range around the pipeline position
        const defaultMaturity = pipeline.maturity1 || pipeline.maturity2 || 0.5;
        return {
            name: pipeline.name,
            minMaturity: Math.max(0, defaultMaturity - 0.1),
            maxMaturity: Math.min(1, defaultMaturity + 0.1),
            visibility: pipeline.visibility || 0.5,
            line: pipeline.line,
        };
    }

    const maturities = pipeline.components.map((c: any) => c.maturity || 0).filter((m: number) => !isNaN(m));

    if (maturities.length === 0) {
        throw new Error('Pipeline has no valid component maturities');
    }

    return {
        name: pipeline.name,
        minMaturity: Math.min(...maturities),
        maxMaturity: Math.max(...maturities),
        visibility: pipeline.visibility || 0.5,
        line: pipeline.line,
    };
}

/**
 * Checks if a position is within pipeline bounds with asymmetric tolerance
 *
 * @param position - Position to check
 * @param pipelineBounds - Pipeline bounds
 * @param tolerance - Base tolerance for visibility matching (default: 0.1)
 * @returns True if position is within bounds
 */
export function isPositionWithinPipelineBounds(
    position: {x: number; y: number},
    pipelineBounds: PipelineBounds,
    tolerance: number = 0.1,
): boolean {
    // Check maturity bounds (x-axis)
    const withinMaturityRange = position.x >= pipelineBounds.minMaturity && position.x <= pipelineBounds.maxMaturity;

    // Check visibility proximity (y-axis) with asymmetric tolerance
    // In Wardley Maps: higher visibility = higher on screen = "above" the pipeline visually
    // We want smaller tolerance above the pipeline to fix excessive capture area
    const visibilityDifference = position.y - pipelineBounds.visibility;

    let actualTolerance = tolerance;
    if (visibilityDifference > 0) {
        // Position is above the pipeline (higher visibility)
        // Reduce tolerance significantly to prevent excessive capture area above
        actualTolerance = tolerance * 0.3; // 30% of normal tolerance
    }
    // Position is below the pipeline (lower visibility) - use full tolerance

    const withinVisibilityTolerance = Math.abs(visibilityDifference) <= actualTolerance;

    return withinMaturityRange && withinVisibilityTolerance;
}

/**
 * Extracts all component names from map text, including pipeline components
 * This ensures global uniqueness across the entire map
 *
 * @param mapText - Complete map text to parse
 * @returns Array of all component names found in the map
 */
export function extractAllComponentNames(mapText: string): string[] {
    if (!mapText || typeof mapText !== 'string') {
        return [];
    }

    const componentNames = new Set<string>();
    const lines = mapText.split('\n');
    let inPipelineBlock = false;

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Check if we're entering a pipeline block
        if (trimmedLine.includes('{')) {
            inPipelineBlock = true;
            continue;
        }

        // Check if we're exiting a pipeline block
        if (trimmedLine === '}') {
            inPipelineBlock = false;
            continue;
        }

        // Match components inside pipeline blocks: component Name [maturity]
        if (inPipelineBlock) {
            const pipelineComponentMatch = trimmedLine.match(/^component\s+(.+?)\s*\[/);
            if (pipelineComponentMatch) {
                const name = pipelineComponentMatch[1].trim();
                if (name) {
                    componentNames.add(name);
                }
                continue;
            }
        }

        // Match regular components: component Name [coordinates]
        const componentMatch = trimmedLine.match(/^component\s+(.+?)\s*\[/);
        if (componentMatch) {
            const name = componentMatch[1].trim();
            if (name) {
                componentNames.add(name);
            }
            continue;
        }

        // Match anchors: anchor Name [coordinates]
        const anchorMatch = trimmedLine.match(/^anchor\s+(.+?)\s*\[/);
        if (anchorMatch) {
            const name = anchorMatch[1].trim();
            if (name) {
                componentNames.add(name);
            }
            continue;
        }

        // Match notes: note "Text" [coordinates] or note Text [coordinates]
        const noteMatch = trimmedLine.match(/^note\s+(.+?)\s*\[/);
        if (noteMatch) {
            let name = noteMatch[1].trim();
            // Remove quotes if present
            if (name.startsWith('"') && name.endsWith('"')) {
                name = name.slice(1, -1);
            }
            if (name) {
                componentNames.add(name);
            }
        }
    }

    return Array.from(componentNames);
}

/**
 * Enhanced pipeline map text generation with global component name uniqueness
 *
 * @param pipelineName - Name of the pipeline
 * @param position - Position coordinates {x: maturity, y: visibility}
 * @param existingMapText - Existing map text for global uniqueness checking
 * @returns Complete pipeline map text with globally unique component names
 */
export function generatePipelineMapTextWithGlobalUniqueness(
    pipelineName: string,
    position: {x: number; y: number},
    existingMapText: string = '',
): string {
    if (!pipelineName || typeof pipelineName !== 'string') {
        throw new Error('Pipeline name must be a non-empty string');
    }

    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
        throw new Error('Position must contain valid x and y coordinates');
    }

    const formattedY = formatCoordinate(position.y);
    const formattedX = formatCoordinate(position.x);

    // Generate component line
    const componentLine = `component ${pipelineName} [${formattedY}, ${formattedX}]`;

    // Get all existing component names for global uniqueness
    const existingNames = extractAllComponentNames(existingMapText);

    // Generate pipeline block with globally unique component names
    const pipelineBlock = generatePipelineBlockWithUniqueness(pipelineName, position.x, existingNames);

    return `${componentLine}\n${pipelineBlock}`;
}

/**
 * Generates a pipeline block with globally unique component names
 *
 * @param pipelineName - Name of the pipeline
 * @param baseMaturity - Base maturity position for component spacing
 * @param existingNames - Array of existing component names for uniqueness checking
 * @returns Formatted pipeline block string with unique component names
 */
export function generatePipelineBlockWithUniqueness(pipelineName: string, baseMaturity: number, existingNames: string[] = []): string {
    if (!pipelineName || typeof pipelineName !== 'string') {
        throw new Error('Pipeline name must be a non-empty string');
    }

    const positions = calculatePipelineComponentPositions(baseMaturity);

    // Generate unique names for pipeline components
    const component1Name = generateUniqueComponentName({
        baseName: 'Pipeline Component 1',
        existingNames: existingNames,
    });

    // Update existing names to include the first component
    const updatedExistingNames = [...existingNames, component1Name];

    const component2Name = generateUniqueComponentName({
        baseName: 'Pipeline Component 2',
        existingNames: updatedExistingNames,
    });

    return `pipeline ${pipelineName}
{
    component ${component1Name} [${positions.component1.toFixed(2)}]
    component ${component2Name} [${positions.component2.toFixed(2)}]
}`;
}

/**
 * Validates component placement parameters
 *
 * @param params - Component placement parameters
 * @returns Validation result with any error messages
 */
export function validateComponentPlacement(params: ComponentPlacementParams): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Validate toolbar item
    if (!params.item) {
        errors.push('Toolbar item is required');
    } else {
        if (!params.item.defaultName) {
            errors.push('Toolbar item must have a default name');
        }
        if (!params.item.template) {
            errors.push('Toolbar item must have a template function');
        }
    }

    // Validate position
    if (!params.position) {
        errors.push('Position is required');
    } else {
        if (typeof params.position.x !== 'number' || isNaN(params.position.x)) {
            errors.push('Position x must be a valid number');
        } else if (params.position.x < 0 || params.position.x > 1) {
            errors.push('Position x must be between 0 and 1');
        }

        if (typeof params.position.y !== 'number' || isNaN(params.position.y)) {
            errors.push('Position y must be a valid number');
        } else if (params.position.y < 0 || params.position.y > 1) {
            errors.push('Position y must be between 0 and 1');
        }
    }

    // Validate existing components
    if (!Array.isArray(params.existingComponents)) {
        errors.push('Existing components must be an array');
    }

    // Validate current map text
    if (params.currentMapText !== undefined && typeof params.currentMapText !== 'string') {
        errors.push('Current map text must be a string');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
