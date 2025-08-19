/**
 * Utility functions for map text generation and mutation
 * This module provides enhanced functionality for task 7: map text generation and mutation
 */

import {ToolbarItem} from '../types/toolbar';
import {UnifiedComponent} from '../types/unified/components';

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
        // Sanitize inputs - preserve line breaks for notes
        let safeName: string;
        if (category === 'note') {
            // For notes, preserve line breaks and only trim whitespace
            safeName = (name || 'New Note').trim();
        } else {
            // For other components, replace line breaks with spaces
            safeName = (name || 'New Component')
                .trim()
                .replace(/[\r\n]+/g, ' ')
                .replace(/\s+/g, ' ');
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
                return `pipeline ${safeName} [${safeY}, ${safeX}]`;

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
 * @returns Generated map text string
 */
export function generateComponentMapText(item: ToolbarItem, componentName: string, position: {x: number; y: number}): string {
    if (!item) {
        throw new Error('Toolbar item is required');
    }

    if (!componentName || typeof componentName !== 'string') {
        throw new Error('Component name must be a non-empty string');
    }

    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
        throw new Error('Position must contain valid x and y coordinates');
    }

    // Sanitize component name - preserve line breaks for notes
    let safeName: string;
    if (item.category === 'note') {
        // For notes, preserve line breaks and only trim whitespace
        safeName = componentName.trim();
    } else {
        // For other components, replace line breaks with spaces
        safeName = componentName
            .trim()
            .replace(/[\r\n]+/g, ' ')
            .replace(/\s+/g, ' ');
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
            result = template?.(safeName, formattedY, formattedX) || '';
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
        // Generate unique component name
        const existingNames = existingComponents.map(comp => comp.name);
        const componentName = generateUniqueComponentName({
            baseName: item.defaultName,
            existingNames,
        });

        // Generate component map text
        const newComponentText = generateComponentMapText(item, componentName, position);

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
