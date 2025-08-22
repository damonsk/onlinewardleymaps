/**
 * Component name validation utilities for multi-line component names
 * Implements validation requirements from Requirement 10
 */

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    sanitizedValue?: string;
}

export interface ComponentNameValidationOptions {
    maxLength?: number;
    maxLines?: number;
    maxLineLength?: number;
    allowEmptyLines?: boolean;
    sanitizeInput?: boolean;
    strictEscapeValidation?: boolean;
}

export const DEFAULT_VALIDATION_OPTIONS: ComponentNameValidationOptions = {
    maxLength: 500,
    maxLines: 5,
    maxLineLength: 100,
    allowEmptyLines: false,
    sanitizeInput: true,
    strictEscapeValidation: false,
};

/**
 * Validates a component name for multi-line content and special characters
 * @param name - Component name to validate
 * @param options - Validation options
 * @returns Validation result with errors, warnings, and sanitized value
 */
export const validateComponentName = (
    name: string,
    options: ComponentNameValidationOptions = DEFAULT_VALIDATION_OPTIONS,
): ValidationResult => {
    const opts = {...DEFAULT_VALIDATION_OPTIONS, ...options};
    const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
    };

    // Basic type and emptiness checks
    if (typeof name !== 'string') {
        result.errors.push('Component name must be a string');
        result.isValid = false;
        return result;
    }

    if (name.trim().length === 0) {
        result.errors.push('Component name cannot be empty');
        result.isValid = false;
        return result;
    }

    // Length validation
    if (opts.maxLength && name.length > opts.maxLength) {
        result.errors.push(`Component name is too long (${name.length} characters). Maximum allowed: ${opts.maxLength}`);
        result.isValid = false;
    }

    // Multi-line specific validation
    const lines = name.split('\n');

    // Line count validation
    if (opts.maxLines && lines.length > opts.maxLines) {
        result.errors.push(`Component name has too many lines (${lines.length}). Maximum allowed: ${opts.maxLines}`);
        result.isValid = false;
    }

    // Individual line validation
    lines.forEach((line, index) => {
        const lineNumber = index + 1;

        // Empty line validation
        if (line.trim().length === 0 && !opts.allowEmptyLines && lines.length > 1) {
            result.errors.push(`Line ${lineNumber} is empty. Empty lines are not allowed in multi-line component names`);
            result.isValid = false;
        }

        // Line length validation
        if (opts.maxLineLength && line.length > opts.maxLineLength) {
            result.errors.push(
                `Line ${lineNumber} is too long (${line.length} characters). Maximum allowed per line: ${opts.maxLineLength}`,
            );
            result.isValid = false;
        }

        // Whitespace-only line validation (different from empty)
        if (line.length > 0 && line.trim().length === 0) {
            result.warnings.push(`Line ${lineNumber} contains only whitespace`);
        }
    });

    // Escape sequence validation
    const escapeValidation = validateEscapeSequences(name, opts.strictEscapeValidation || false);
    result.errors.push(...escapeValidation.errors);
    result.warnings.push(...escapeValidation.warnings);
    if (escapeValidation.errors.length > 0) {
        result.isValid = false;
    }

    // Problematic character validation
    const characterValidation = validateProblematicCharacters(name);
    result.errors.push(...characterValidation.errors);
    result.warnings.push(...characterValidation.warnings);
    if (characterValidation.errors.length > 0) {
        result.isValid = false;
    }

    // Sanitize input if requested and valid
    if (opts.sanitizeInput && result.isValid) {
        result.sanitizedValue = sanitizeComponentName(name);
    }

    // Performance/memory usage warnings
    if (name.length > 200) {
        result.warnings.push('Long component names may impact map rendering performance');
    }

    if (lines.length > 3) {
        result.warnings.push('Many lines in component names may affect map readability');
    }

    return result;
};

/**
 * Validates escape sequences in component names
 * @param name - Component name to validate
 * @param strict - Whether to use strict validation
 * @returns Validation result for escape sequences
 */
export const validateEscapeSequences = (name: string, strict: boolean = false): Pick<ValidationResult, 'errors' | 'warnings'> => {
    const result = {errors: [], warnings: []} as Pick<ValidationResult, 'errors' | 'warnings'>;

    // Check for potentially malformed escape sequences
    const invalidEscapePattern = /\\[^nrt"\\]/g;
    const invalidEscapes = name.match(invalidEscapePattern);

    if (invalidEscapes) {
        const uniqueEscapes = [...new Set(invalidEscapes)];
        if (strict) {
            result.errors.push(
                `Invalid escape sequences found: ${uniqueEscapes.join(', ')}. Valid sequences are: \\n, \\r, \\t, \\", \\\\`,
            );
        } else {
            result.warnings.push(
                `Potentially invalid escape sequences: ${uniqueEscapes.join(', ')}. Consider using: \\n, \\r, \\t, \\", \\\\`,
            );
        }
    }

    // Check for unescaped quotes in multi-line content
    if (name.includes('\n') || name.includes('\r')) {
        const unescapedQuotes = name.match(/(?<!\\)"/g);
        if (unescapedQuotes) {
            result.errors.push('Multi-line component names with quotes must escape them as \\"');
        }
    }

    // Check for trailing backslashes (often indicates incomplete escaping)
    if (name.endsWith('\\') && !name.endsWith('\\\\')) {
        result.errors.push('Component name ends with an incomplete escape sequence');
    }

    return result;
};

/**
 * Validates for characters that might cause parsing or display issues
 * @param name - Component name to validate
 * @returns Validation result for problematic characters
 */
export const validateProblematicCharacters = (name: string): Pick<ValidationResult, 'errors' | 'warnings'> => {
    const result = {errors: [], warnings: []} as Pick<ValidationResult, 'errors' | 'warnings'>;

    // Characters that break map text DSL syntax
    const syntaxBreakingChars = /[\[\]{}()]/g;
    const syntaxMatches = name.match(syntaxBreakingChars);
    if (syntaxMatches) {
        const uniqueChars = [...new Set(syntaxMatches)];
        result.errors.push(`Component name contains characters that may break map syntax: ${uniqueChars.join(', ')}`);
    }

    // Control characters (except common ones like \n, \r, \t)
    const controlCharPattern = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
    const controlChars = name.match(controlCharPattern);
    if (controlChars) {
        result.errors.push('Component name contains invalid control characters');
    }

    // Unicode direction override characters (can cause display issues)
    const directionOverride = /[\u202A-\u202E\u2066-\u2069]/g;
    if (directionOverride.test(name)) {
        result.warnings.push('Component name contains text direction override characters that may affect display');
    }

    // Very long words that might cause layout issues
    const words = name.split(/\s+/);
    const longWords = words.filter(word => word.length > 50);
    if (longWords.length > 0) {
        result.warnings.push(
            `Component name contains very long words that may cause display issues: ${longWords.slice(0, 3).join(', ')}${longWords.length > 3 ? '...' : ''}`,
        );
    }

    // Leading/trailing whitespace
    if (name !== name.trim()) {
        result.warnings.push('Component name has leading or trailing whitespace');
    }

    return result;
};

/**
 * Sanitizes a component name by fixing common issues
 * @param name - Component name to sanitize
 * @returns Sanitized component name
 */
export const sanitizeComponentName = (name: string): string => {
    let sanitized = name;

    // Only trim regular spaces, not newlines (preserve intentional whitespace structure)  
    sanitized = sanitized.replace(/^[ \t]+|[ \t]+$/g, '');

    // Remove control characters (except \n, \r, \t)
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Remove direction override characters
    sanitized = sanitized.replace(/[\u202A-\u202E\u2066-\u2069]/g, '');

    // Normalize consecutive whitespace within lines
    sanitized = sanitized.replace(/[ \t]+/g, ' ');

    // Preserve all whitespace structure including consecutive empty lines
    // Multi-line component names may intentionally use specific whitespace patterns

    return sanitized;
};

/**
 * Validates component name syntax for DSL parsing
 * @param name - Component name to validate
 * @returns Whether the name needs quotes and any syntax issues
 */
export const validateComponentNameSyntax = (
    name: string,
): {
    needsQuotes: boolean;
    syntaxErrors: string[];
    canBeParsed: boolean;
} => {
    const result: {
        needsQuotes: boolean;
        syntaxErrors: string[];
        canBeParsed: boolean;
    } = {
        needsQuotes: false,
        syntaxErrors: [],
        canBeParsed: true,
    };

    // Determine if quotes are needed
    result.needsQuotes =
        name.includes('\n') ||
        name.includes('\r') ||
        name.includes('"') ||
        name.includes('\\') ||
        name.trim() !== name ||
        name.includes('[') ||
        name.includes(']') ||
        name.includes('->') ||
        name.includes('||') ||
        /^\s*$/.test(name);

    // Validate quoted syntax if quotes are needed
    if (result.needsQuotes) {
        // Check for proper quote balancing when quoted
        const quotedName = `"${name}"`;
        let inQuotes = false;
        let escaped = false;

        for (let i = 0; i < quotedName.length; i++) {
            const char = quotedName[i];
            const prevChar = i > 0 ? quotedName[i - 1] : '';

            if (char === '"' && !escaped) {
                inQuotes = !inQuotes;
            } else if (char === '\\' && !escaped) {
                escaped = true;
                continue;
            }

            escaped = false;
        }

        if (inQuotes) {
            result.syntaxErrors.push('Unmatched quotes in component name');
            result.canBeParsed = false;
        }
    }

    // Check for other syntax issues
    if (name.includes('\0')) {
        result.syntaxErrors.push('Component name contains null character');
        result.canBeParsed = false;
    }

    return result;
};

/**
 * Creates a validation function compatible with InlineEditor
 * @param options - Validation options
 * @returns Validation function for use with InlineEditor
 */
export const createComponentNameValidator = (options: ComponentNameValidationOptions = {}) => {
    return (value: string): string | null => {
        const validation = validateComponentName(value, options);

        if (!validation.isValid) {
            return validation.errors[0] || 'Invalid component name';
        }

        // Return warnings as non-blocking messages
        if (validation.warnings.length > 0) {
            // For now, just return null to not block saving
            // In the future, warnings could be displayed differently
            return null;
        }

        return null;
    };
};

/**
 * Simple component name validation - validation should happen at input time
 * @param rawName - Raw component name from map text
 * @returns Processed name with basic sanitization only
 */
export const validateAndRecoverComponentName = (
    rawName: string,
): {
    processedName: string;
    wasRecovered: boolean;
    originalName: string;
    recoveryMessage?: string;
} => {
    // Handle completely empty or null names
    if (!rawName || typeof rawName !== 'string') {
        return {
            processedName: 'Recovered Component Name',
            wasRecovered: true,
            originalName: rawName,
            recoveryMessage: 'Invalid component name recovered',
        };
    }

    // Handle truly empty strings only - preserve whitespace and special characters
    if (rawName.length === 0) {
        return {
            processedName: 'Recovered Component Name',
            wasRecovered: true,
            originalName: rawName,
            recoveryMessage: 'Empty component name recovered',
        };
    }

    // Check for syntax-breaking characters that require fallback
    // Be very conservative - only consider characters that truly break parsing
    // Note: Square brackets in component names are allowed, they're only syntax-breaking in coordinate context
    const hasSyntaxBreakingChars = false; // Disabled for now - let the parsing layer handle syntax issues
    if (hasSyntaxBreakingChars) {
        return {
            processedName: 'Component',
            wasRecovered: true,
            originalName: rawName,
            recoveryMessage: 'Component name with syntax-breaking characters recovered',
        };
    }

    // Note: Removed complex escaping recovery - let valid multi-line content through

    // For unclosed quotes or malformed quoted strings - be very conservative
    // Only recover if it's clearly a malformed quoted string (starts with quote but has content issues)
    // Allow single quote characters or other patterns as valid component names
    const hasUnclosedQuote = (rawName.match(/"/g) || []).length % 2 !== 0 && rawName.length > 1;
    if (hasUnclosedQuote && rawName.startsWith('"')) {
        // Try to extract meaningful content from the unclosed quote
        const quotedContent = rawName.match(/"([^"]*?)(?:"|\s|$)/)?.[1];
        if (quotedContent && quotedContent.trim()) {
            return {
                processedName: quotedContent.trim(),
                wasRecovered: true,
                originalName: rawName,
                recoveryMessage: 'Unclosed quote recovered with partial content',
            };
        }
        return {
            processedName: 'Component',
            wasRecovered: true,
            originalName: rawName,
            recoveryMessage: 'Malformed quoted string recovered',
        };
    }

    // Basic sanitization for valid names
    const sanitized = sanitizeComponentName(rawName);
    
    return {
        processedName: sanitized,
        wasRecovered: false,
        originalName: rawName,
    };
};
