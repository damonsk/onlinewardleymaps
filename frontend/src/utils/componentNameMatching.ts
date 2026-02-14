/**
 * Utility functions for normalizing and matching component names,
 * particularly for multi-line component names with different formatting
 */

/**
 * Normalize a component name for matching purposes
 * This handles:
 * - Converting line breaks to spaces
 * - Trimming extra whitespace
 * - Converting to lowercase for case-insensitive matching
 * - Normalizing multiple spaces to single spaces
 */
export const normalizeComponentName = (name: string): string => {
    if (!name || typeof name !== 'string') {
        return '';
    }

    return name
        .replace(/\n/g, ' ') // Convert line breaks to spaces
        .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
        .trim() // Remove leading/trailing whitespace
        .toLowerCase(); // Case insensitive matching
};

/**
 * Check if two component names match using normalized comparison
 * This allows matching between:
 * - "Multi-line\nComponent" and "Multi-line Component"
 * - "Database\nService" and "database service"
 * - "  API Gateway  \n  v2.0  " and "API Gateway v2.0"
 */
export const componentNamesMatch = (name1: string, name2: string): boolean => {
    if (!name1 || !name2) {
        return false;
    }

    // First try exact match for performance
    if (name1 === name2) {
        return true;
    }

    // Then try normalized match
    const normalized1 = normalizeComponentName(name1);
    const normalized2 = normalizeComponentName(name2);

    return normalized1 === normalized2 && normalized1.length > 0;
};

/**
 * Find a component by name using normalized matching
 * This is the core function that replaces exact string matching
 */
export const findComponentByName = <T extends {name: string}>(components: T[], targetName: string): T | undefined => {
    if (!components || !targetName) {
        return undefined;
    }

    // First try exact match for performance
    const exactMatch = components.find(component => component.name === targetName);
    if (exactMatch) {
        return exactMatch;
    }

    // Then try normalized match
    const normalizedTarget = normalizeComponentName(targetName);
    if (normalizedTarget.length === 0) {
        return undefined;
    }

    return components.find(component => normalizeComponentName(component.name) === normalizedTarget);
};

/**
 * Check if a component name is valid for normalization
 * Used for validation and error handling
 */
export const isValidComponentName = (name: string): boolean => {
    return typeof name === 'string' && name.trim().length > 0;
};

/**
 * Get the display format of a component name
 * Useful for debugging and logging
 */
export const getComponentNameDisplayFormat = (name: string): string => {
    if (!name) {
        return '<empty>';
    }

    return name
        .replace(/\n/g, '\\n') // Show line breaks as \n
        .replace(/\t/g, '\\t') // Show tabs as \t
        .replace(/\r/g, '\\r'); // Show carriage returns as \r
};

/**
 * Check if a component name needs to be quoted for map text syntax
 * Multi-line names or names with special characters need quotes
 */
export const needsQuotes = (name: string): boolean => {
    if (!name || typeof name !== 'string') {
        return false;
    }

    // Check for line breaks, special characters that break parsing
    return (
        name.includes('\n') ||
        name.includes('\r') ||
        name.includes('"') ||
        name.includes('->') ||
        name.includes('\\') || // Backslashes
        name.trim() !== name || // Leading/trailing whitespace
        name.includes('[') ||
        name.includes(']')
    );
};

/**
 * Escape a component name for safe inclusion in map text
 * Multi-line names get quoted and escaped, simple names stay as-is
 */
export const escapeComponentNameForMapText = (name: string): string => {
    if (!name || typeof name !== 'string') {
        return name;
    }

    // If name doesn't need quotes, return as-is
    if (!needsQuotes(name)) {
        return name;
    }

    // Escape the content and wrap in quotes
    const escaped = name
        .replace(/\\/g, '\\\\') // Escape backslashes first
        .replace(/"/g, '\\"') // Escape quotes
        .replace(/\n/g, '\\n') // Escape line breaks
        .replace(/\r/g, '\\r') // Escape carriage returns
        .replace(/\t/g, '\\t') // Escape tabs
        .replace(/\[/g, '\\[') // Escape left brackets
        .replace(/\]/g, '\\]'); // Escape right brackets

    return `"${escaped}"`;
};

/**
 * Unescape a component name from map text parsing
 * Converts escaped sequences back to actual characters
 * This is the inverse of escapeComponentNameForMapText
 */
export const unescapeComponentNameFromMapText = (name: string): string => {
    if (!name || typeof name !== 'string') {
        return name;
    }

    let result = name;

    // Remove surrounding quotes if present
    if (result.startsWith('"') && result.endsWith('"')) {
        result = result.slice(1, -1);
    }

    // Unescape sequences (order matters - backslashes last)
    result = result
        .replace(/\\n/g, '\n') // Unescape line breaks
        .replace(/\\r/g, '\r') // Unescape carriage returns
        .replace(/\\t/g, '\t') // Unescape tabs
        .replace(/\\"/g, '"') // Unescape quotes
        .replace(/\\]/g, ']') // Unescape right brackets
        .replace(/\\\[/g, '[') // Unescape left brackets
        .replace(/\\\\/g, '\\'); // Unescape backslashes (must be last)

    return result;
};

/**
 * Find a component line in map text by matching component name
 * This handles both single-line and multi-line component names properly
 * Returns the line index and the matched line content
 */
export const findComponentLineInMapText = (
    mapText: string,
    targetComponentName: string,
): {lineIndex: number; line: string; parsedName: string} | null => {
    if (!mapText || !targetComponentName) {
        return null;
    }

    const lines = mapText.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip non-component lines
        if (!line.startsWith('component ')) {
            continue;
        }

        // Extract component name from the line
        // Handle both quoted and unquoted component names
        const componentMatch = line.match(/^component\s+(.+?)\s*\[/);
        if (!componentMatch) {
            continue;
        }

        const rawName = componentMatch[1];
        let parsedName: string;

        // Check if the name is quoted (multi-line format)
        if (rawName.startsWith('"') && rawName.endsWith('"')) {
            // Parse quoted multi-line component name
            parsedName = unescapeComponentNameFromMapText(rawName);
        } else {
            // Single-line component name
            parsedName = rawName;
        }

        // Use normalized component name matching
        if (componentNamesMatch(parsedName, targetComponentName)) {
            return {
                lineIndex: i,
                line: line,
                parsedName: parsedName,
            };
        }
    }

    return null;
};

/**
 * Parse a component line to extract its parts for modification
 * This handles both single-line and multi-line component syntax
 */
export const parseComponentLine = (
    line: string,
): {
    name: string;
    coordinates: string;
    method?: string;
    inertia?: string;
    rest?: string;
} | null => {
    if (!line || !line.trim().startsWith('component ')) {
        return null;
    }

    // Updated regex to handle quoted multi-line component names
    // This matches: component "Name" [coords] (method) inertia rest
    // OR: component Name [coords] (method) inertia rest
    const componentRegex = /^component\s+(.+?)\s*(\[.+?\])(\s*\([^)]+\))?(\s+inertia)?(.*)$/;
    const match = line.match(componentRegex);

    if (!match) {
        return null;
    }

    const [, rawName, coordinates, method, inertia, rest] = match;

    // Parse the component name (handle quotes)
    let name: string;
    if (rawName.startsWith('"') && rawName.endsWith('"')) {
        name = unescapeComponentNameFromMapText(rawName);
    } else {
        name = rawName;
    }

    return {
        name,
        coordinates,
        method: method?.trim(),
        inertia: inertia?.trim(),
        rest: rest?.trim(),
    };
};

/**
 * Rebuild a component line with the same format as the original
 * This maintains the proper quoting for multi-line component names
 */
export const buildComponentLine = (originalName: string, coordinates: string, method?: string, inertia?: string, rest?: string): string => {
    // Determine if we need to quote the name
    const nameForMapText = escapeComponentNameForMapText(originalName);

    // Build the line components
    const parts = ['component', nameForMapText, coordinates];

    if (method) {
        parts.push(method);
    }

    if (inertia) {
        parts.push(inertia);
    }

    if (rest && rest.trim()) {
        parts.push(rest);
    }

    return parts.join(' ');
};
