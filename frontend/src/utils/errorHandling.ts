/**
 * Enhanced error handling utilities for multi-line component name parsing
 * Implements comprehensive error recovery and fallback mechanisms
 * Part of Task 9: Comprehensive error handling and edge cases
 */

export interface ParseRecoveryResult<T = any> {
    success: boolean;
    result?: T;
    errors: ParseError[];
    warnings: ParseWarning[];
    wasRecovered: boolean;
    recoveryStrategy?: string;
}

export interface ParseError {
    type: 'syntax' | 'validation' | 'overflow' | 'encoding' | 'critical';
    message: string;
    line?: number;
    column?: number;
    context?: string;
    originalValue?: string;
    recoveredValue?: string;
}

export interface ParseWarning {
    type: 'performance' | 'formatting' | 'compatibility' | 'best-practice';
    message: string;
    line?: number;
    context?: string;
    suggestion?: string;
}

export interface ParsingContext {
    line: number;
    keyword: string;
    elementType: string;
    fullLine: string;
    position: number;
}

/**
 * Enhanced quote parsing with comprehensive error recovery
 * Handles malformed quoted strings with multiple fallback strategies
 */
export class QuotedStringParser {
    private context: ParsingContext;
    private result: ParseRecoveryResult<string>;

    constructor(context: ParsingContext) {
        this.context = context;
        this.result = {
            success: false,
            errors: [],
            warnings: [],
            wasRecovered: false,
        };
    }

    /**
     * Parse a quoted string with fallback recovery mechanisms
     */
    parseQuotedString(input: string, startIndex: number = 0): ParseRecoveryResult<string> {
        // Reset result for new parsing attempt
        this.result = {
            success: false,
            errors: [],
            warnings: [],
            wasRecovered: false,
        };

        if (!input || typeof input !== 'string') {
            this.addError('validation', 'Input must be a non-empty string');
            // Return absolute fallback for empty input
            this.result.success = true;
            this.result.result = 'Component';
            this.result.wasRecovered = true;
            this.result.recoveryStrategy = 'absolute_fallback';
            return this.result;
        }

        if (!input.startsWith('"', startIndex)) {
            this.addError('syntax', 'Quoted string must start with a quote character');
            return this.result;
        }

        // Strategy 1: Try perfect parsing
        const perfectMatch = this.tryPerfectParsing(input, startIndex);
        if (perfectMatch.success) {
            return perfectMatch;
        }

        // Strategy 2: Try lenient parsing with error recovery
        const lenientMatch = this.tryLenientParsing(input, startIndex);
        if (lenientMatch.success) {
            this.result.wasRecovered = true;
            this.result.recoveryStrategy = 'lenient_parsing';
            return lenientMatch;
        }

        // Strategy 3: Try heuristic recovery
        const heuristicMatch = this.tryHeuristicRecovery(input, startIndex);
        if (heuristicMatch.success) {
            this.result.wasRecovered = true;
            this.result.recoveryStrategy = 'heuristic_recovery';
            return heuristicMatch;
        }

        // Strategy 4: Last resort - extract whatever we can
        return this.lastResortExtraction(input, startIndex);
    }

    private tryPerfectParsing(input: string, startIndex: number): ParseRecoveryResult<string> {
        try {
            const closingQuoteIndex = this.findClosingQuote(input, startIndex + 1);
            if (closingQuoteIndex === -1) {
                this.addError('syntax', 'No closing quote found');
                return this.result;
            }

            const content = input.substring(startIndex + 1, closingQuoteIndex);
            const unescaped = this.unescapeString(content);
            
            if (unescaped.errors.length > 0) {
                this.result.errors.push(...unescaped.errors);
                return this.result;
            }

            this.result.success = true;
            this.result.result = unescaped.result!;
            this.result.warnings.push(...unescaped.warnings);
            return this.result;
        } catch (error) {
            this.addError('critical', `Perfect parsing failed: ${this.getErrorMessage(error)}`);
            return this.result;
        }
    }

    private tryLenientParsing(input: string, startIndex: number): ParseRecoveryResult<string> {
        try {
            // Look for common quote patterns with some flexibility
            const patterns = [
                // Standard closing quote
                /^"((?:[^"\\]|\\.)*)"/,
                // Quote followed by whitespace and coordinates
                /^"((?:[^"\\]|\\.)*?)"\s*\[/,
                // Quote with potential whitespace before closing
                /^"((?:[^"\\]|\\.)*?)\s*"/,
            ];

            for (const pattern of patterns) {
                const match = input.substring(startIndex).match(pattern);
                if (match) {
                    const content = match[1];
                    const unescaped = this.unescapeString(content, true); // Lenient unescaping
                    
                    this.result.success = true;
                    this.result.result = unescaped.result || content;
                    this.result.warnings.push(...unescaped.warnings);
                    this.result.wasRecovered = true;
                    this.result.recoveryStrategy = 'lenient_parsing';
                    this.addWarning('formatting', 'Used lenient parsing for malformed quoted string');
                    return this.result;
                }
            }

            this.addError('syntax', 'Lenient parsing could not find valid quote pattern');
            return this.result;
        } catch (error) {
            this.addError('critical', `Lenient parsing failed: ${this.getErrorMessage(error)}`);
            return this.result;
        }
    }

    private tryHeuristicRecovery(input: string, startIndex: number): ParseRecoveryResult<string> {
        try {
            // Use heuristics to guess the intended string boundaries
            let endIndex = input.length;
            
            // Look for likely boundaries: coordinates, line breaks, or end of string
            const boundaries = [
                input.indexOf('[', startIndex), // Coordinates
                input.indexOf('\n', startIndex), // Line break
                input.indexOf('//', startIndex), // Comment
                input.length // End of string
            ].filter(idx => idx > startIndex).sort((a, b) => a - b);

            if (boundaries.length > 0) {
                endIndex = boundaries[0];
            }

            // Extract content between quotes, handling some escape issues
            let content = input.substring(startIndex + 1, endIndex);
            
            // Clean up common issues
            content = content.replace(/"\s*$/, ''); // Remove trailing quote if present
            content = content.replace(/\\+$/, ''); // Remove trailing backslashes
            
            const unescaped = this.unescapeString(content, true);
            
            this.result.success = true;
            this.result.result = unescaped.result || content;
            this.result.warnings.push(...unescaped.warnings);
            this.result.wasRecovered = true;
            this.result.recoveryStrategy = 'heuristic_recovery';
            this.addWarning('formatting', 'Used heuristic recovery for severely malformed quoted string');
            return this.result;
        } catch (error) {
            this.addError('critical', `Heuristic recovery failed: ${this.getErrorMessage(error)}`);
            return this.result;
        }
    }

    private lastResortExtraction(input: string, startIndex: number): ParseRecoveryResult<string> {
        try {
            // Just take everything after the quote until we hit something that looks like coordinates
            let content = input.substring(startIndex + 1);
            
            // Remove the most obviously problematic parts
            content = content.split('[')[0].trim(); // Stop at coordinates
            content = content.replace(/"+\s*$/, ''); // Remove trailing quotes
            
            if (content.length === 0) {
                content = 'Recovered Component';
            }

            this.result.success = true;
            this.result.result = content;
            this.result.wasRecovered = true;
            this.result.recoveryStrategy = 'last_resort';
            this.addWarning('compatibility', 'Used last resort extraction - original syntax was severely malformed');
            return this.result;
        } catch (error) {
            // Absolute fallback
            this.result.success = true;
            this.result.result = 'Component';
            this.result.wasRecovered = true;
            this.result.recoveryStrategy = 'absolute_fallback';
            this.addError('critical', `All parsing strategies failed: ${this.getErrorMessage(error)}`);
            return this.result;
        }
    }

    private findClosingQuote(str: string, startIndex: number): number {
        let i = startIndex;
        while (i < str.length) {
            if (str[i] === '"') {
                // Check if this quote is escaped
                let backslashCount = 0;
                let j = i - 1;
                while (j >= 0 && str[j] === '\\') {
                    backslashCount++;
                    j--;
                }
                // If even number of backslashes (including 0), the quote is not escaped
                if (backslashCount % 2 === 0) {
                    return i;
                }
            }
            i++;
        }
        return -1;
    }

    private unescapeString(str: string, lenient: boolean = false): ParseRecoveryResult<string> {
        const result: ParseRecoveryResult<string> = {
            success: true,
            result: str,
            errors: [],
            warnings: [],
            wasRecovered: false,
        };

        try {
            let unescaped = str;
            
            // Standard escape sequences
            unescaped = unescaped.replace(/\\n/g, '\n');
            unescaped = unescaped.replace(/\\r/g, '\r');
            unescaped = unescaped.replace(/\\t/g, '\t');
            unescaped = unescaped.replace(/\\"/g, '"');
            unescaped = unescaped.replace(/\\\\/g, '\\');

            if (!lenient) {
                // Check for invalid escape sequences in strict mode
                const invalidEscapes = str.match(/\\[^nrt"\\]/g);
                if (invalidEscapes) {
                    result.errors.push({
                        type: 'syntax',
                        message: `Invalid escape sequences: ${invalidEscapes.join(', ')}`,
                        originalValue: str,
                    });
                    result.success = false;
                }
            } else {
                // In lenient mode, just remove unknown escape sequences
                const invalidEscapes = unescaped.match(/\\[^nrt"\\]/g);
                if (invalidEscapes) {
                    unescaped = unescaped.replace(/\\([^nrt"\\])/g, '$1');
                    result.warnings.push({
                        type: 'formatting',
                        message: `Removed invalid escape sequences: ${invalidEscapes.join(', ')}`,
                        suggestion: 'Use valid escape sequences: \\n, \\r, \\t, \\", \\\\',
                    });
                    result.wasRecovered = true;
                }
            }

            result.result = unescaped;
            return result;
        } catch (error) {
            result.success = false;
            result.errors.push({
                type: 'critical',
                message: `Unescaping failed: ${this.getErrorMessage(error)}`,
                originalValue: str,
            });
            return result;
        }
    }

    private addError(type: ParseError['type'], message: string, originalValue?: string, recoveredValue?: string) {
        this.result.errors.push({
            type,
            message,
            line: this.context.line,
            context: this.context.fullLine,
            originalValue,
            recoveredValue,
        });
    }

    private addWarning(type: ParseWarning['type'], message: string, suggestion?: string) {
        this.result.warnings.push({
            type,
            message,
            line: this.context.line,
            context: this.context.fullLine,
            suggestion,
        });
    }

    private getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
}

/**
 * Enhanced map loading error handler that prevents map corruption
 */
export class MapLoadingErrorHandler {
    private errors: ParseError[] = [];
    private warnings: ParseWarning[] = [];
    private recoveredElements: number = 0;

    /**
     * Safely parse map text with comprehensive error handling
     */
    safeParseMapText(mapText: string, parseFunction: (text: string) => any): ParseRecoveryResult {
        const result: ParseRecoveryResult = {
            success: false,
            errors: [],
            warnings: [],
            wasRecovered: false,
        };

        try {
            // Pre-validate map text
            const preValidation = this.preValidateMapText(mapText);
            if (!preValidation.success && preValidation.errors.some(e => e.type === 'critical')) {
                return preValidation;
            }

            result.warnings.push(...preValidation.warnings);
            result.errors.push(...preValidation.errors.filter(e => e.type !== 'critical'));

            // Attempt normal parsing
            let processedText = mapText;
            if (preValidation.wasRecovered && preValidation.result) {
                processedText = preValidation.result;
            }

            const parseResult = parseFunction(processedText);
            
            result.success = true;
            result.result = parseResult;
            result.wasRecovered = preValidation.wasRecovered;
            
            return result;
        } catch (error) {
            this.addErrorToResult(result, 'critical', `Map parsing failed: ${this.getErrorMessage(error)}`);
            
            // Attempt recovery by parsing line by line
            try {
                const recoveryResult = this.attemptLineByLineRecovery(mapText, parseFunction);
                if (recoveryResult.success) {
                    result.success = true;
                    result.result = recoveryResult.result;
                    result.wasRecovered = true;
                    result.recoveryStrategy = 'line_by_line_recovery';
                    result.errors.push(...recoveryResult.errors);
                    result.warnings.push(...recoveryResult.warnings);
                }
            } catch (recoveryError) {
                this.addErrorToResult(result, 'critical', `Recovery failed: ${this.getErrorMessage(recoveryError)}`);
            }

            return result;
        }
    }

    private preValidateMapText(mapText: string): ParseRecoveryResult<string> {
        const result: ParseRecoveryResult<string> = {
            success: true,
            result: mapText,
            errors: [],
            warnings: [],
            wasRecovered: false,
        };

        // Check for basic validity
        if (!mapText || typeof mapText !== 'string') {
            this.addErrorToResult(result, 'critical', 'Map text must be a non-empty string');
            return result;
        }

        if (mapText.length > 100000) { // 100KB limit for warning
            this.addWarningToResult(result, 'performance', 'Very large map text may cause performance issues');
        }

        // Check for potentially problematic patterns
        let processedText = mapText;
        let wasModified = false;

        // Fix common quote issues
        const quoteIssues = this.detectQuoteIssues(processedText);
        if (quoteIssues.length > 0) {
            processedText = this.fixQuoteIssues(processedText, quoteIssues);
            wasModified = true;
            result.warnings.push({
                type: 'formatting',
                message: `Fixed ${quoteIssues.length} quote-related issues`,
                suggestion: 'Review quoted strings for proper escaping',
            });
        }

        // Check for encoding issues
        if (this.hasEncodingIssues(processedText)) {
            processedText = this.fixEncodingIssues(processedText);
            wasModified = true;
            this.addWarningToResult(result, 'formatting', 'Fixed text encoding issues');
        }

        if (wasModified) {
            result.wasRecovered = true;
            result.result = processedText;
        }

        return result;
    }

    private attemptLineByLineRecovery(mapText: string, parseFunction: (text: string) => any): ParseRecoveryResult {
        const result: ParseRecoveryResult = {
            success: false,
            errors: [],
            warnings: [],
            wasRecovered: true,
            recoveryStrategy: 'line_by_line',
        };

        const lines = mapText.split('\n');
        const recoveredLines: string[] = [];
        let skippedLines = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            try {
                // Try to parse this line independently if it's a component/element line
                if (this.isElementLine(line)) {
                    const testMap = `title Test\n${line}`;
                    parseFunction(testMap);
                }
                recoveredLines.push(line);
            } catch (error) {
                skippedLines++;
                this.addErrorToResult(result, 'syntax', `Skipped malformed line ${i + 1}: ${this.getErrorMessage(error)}`, line);
                // Add a comment indicating the line was problematic
                recoveredLines.push(`// SKIPPED MALFORMED LINE: ${line}`);
            }
        }

        if (skippedLines > 0) {
            this.addWarningToResult(result, 'compatibility', `Recovered map by skipping ${skippedLines} malformed lines`);
        }

        try {
            const recoveredMapText = recoveredLines.join('\n');
            const parseResult = parseFunction(recoveredMapText);
            result.success = true;
            result.result = parseResult;
        } catch (error) {
            this.addErrorToResult(result, 'critical', `Line-by-line recovery failed: ${this.getErrorMessage(error)}`);
        }

        return result;
    }

    private detectQuoteIssues(text: string): Array<{line: number; issue: string; position: number}> {
        const issues: Array<{line: number; issue: string; position: number}> = [];
        const lines = text.split('\n');

        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
            const line = lines[lineNum];
            
            // Check for unmatched quotes
            let inQuotes = false;
            let escaped = false;
            let quoteCount = 0;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"' && !escaped) {
                    quoteCount++;
                    inQuotes = !inQuotes;
                } else if (char === '\\' && !escaped) {
                    escaped = true;
                    continue;
                }
                
                escaped = false;
            }
            
            if (inQuotes) {
                issues.push({
                    line: lineNum + 1,
                    issue: 'unmatched_quote',
                    position: line.lastIndexOf('"')
                });
            }
        }

        return issues;
    }

    private fixQuoteIssues(text: string, issues: Array<{line: number; issue: string; position: number}>): string {
        let lines = text.split('\n');
        
        for (const issue of issues.reverse()) { // Process in reverse to maintain line numbers
            const lineIndex = issue.line - 1;
            if (issue.issue === 'unmatched_quote') {
                // Add a closing quote at the end of the line before coordinates if present
                const line = lines[lineIndex];
                const coordsMatch = line.match(/\s+\[[\d.,\s]+\]\s*$/);
                if (coordsMatch) {
                    const coordsStart = line.lastIndexOf(coordsMatch[0]);
                    lines[lineIndex] = line.substring(0, coordsStart) + '"' + line.substring(coordsStart);
                } else {
                    lines[lineIndex] = line + '"';
                }
            }
        }
        
        return lines.join('\n');
    }

    private hasEncodingIssues(text: string): boolean {
        // Check for common encoding issues
        return /[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text);
    }

    private fixEncodingIssues(text: string): string {
        // Remove/replace problematic characters
        return text
            .replace(/[\uFFFD]/g, '?') // Replace replacement characters
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ''); // Remove control chars
    }

    private isElementLine(line: string): boolean {
        const elementKeywords = ['component', 'note', 'evolve', 'pipeline', 'anchor', 'link', 'market', 'build', 'buy', 'outsource', 'ecosystem'];
        const trimmed = line.trim();
        return elementKeywords.some(keyword => trimmed.startsWith(keyword + ' '));
    }

    private addErrorToResult(result: ParseRecoveryResult, type: ParseError['type'], message: string, context?: string) {
        result.errors.push({
            type,
            message,
            context,
        });
        if (type === 'critical') {
            result.success = false;
        }
    }

    private addWarningToResult(result: ParseRecoveryResult, type: ParseWarning['type'], message: string, suggestion?: string) {
        result.warnings.push({
            type,
            message,
            suggestion,
        });
    }

    private getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
}

/**
 * Utility function to safely parse component names with comprehensive error handling
 */
export const safeParseComponentName = (
    input: string,
    context: ParsingContext,
    fallbackName: string = 'Component'
): ParseRecoveryResult<string> => {
    if (input.trim().startsWith('"')) {
        const parser = new QuotedStringParser(context);
        const result = parser.parseQuotedString(input.trim());
        
        // Only provide fallback for truly critical failures
        if (!result.success && result.errors.some(e => e.type === 'critical')) {
            // Return safe fallback only for critical errors
            return {
                success: true,
                result: fallbackName,
                errors: result.errors,
                warnings: result.warnings,
                wasRecovered: true,
                recoveryStrategy: 'safe_fallback'
            };
        }
        
        return result;
    } else {
        // Simple unquoted name - handle empty case but be less aggressive
        const name = input.split('[')[0].trim(); // Remove coordinates
        if (name.length === 0) {
            // Only return fallback for truly empty names
            return {
                success: true,
                result: '', // Allow empty names to be handled by existing validation
                errors: [{
                    type: 'validation',
                    message: 'Empty component name',
                    context: context.fullLine,
                    line: context.line
                }],
                warnings: [],
                wasRecovered: false, // Don't mark as recovered here
                recoveryStrategy: undefined
            };
        }
        
        return {
            success: true,
            result: name,
            errors: [],
            warnings: [],
            wasRecovered: false,
        };
    }
};