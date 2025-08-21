import {
    validateComponentName,
    validateEscapeSequences,
    validateProblematicCharacters,
    sanitizeComponentName,
    validateComponentNameSyntax,
    createComponentNameValidator,
    validateAndRecoverComponentName,
    DEFAULT_VALIDATION_OPTIONS,
} from '../../utils/componentNameValidation';

describe('Component Name Validation', () => {
    describe('validateComponentName', () => {
        it('should validate simple single-line component names', () => {
            const result = validateComponentName('Simple Component');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });

        it('should validate multi-line component names', () => {
            const result = validateComponentName('Multi-line\nComponent\nName');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject empty component names', () => {
            const result = validateComponentName('');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Component name cannot be empty');
        });

        it('should reject whitespace-only component names', () => {
            const result = validateComponentName('   ');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Component name cannot be empty');
        });

        it('should reject non-string input', () => {
            const result = validateComponentName(null as any);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Component name must be a string');
        });

        it('should enforce maximum length limits', () => {
            const longName = 'A'.repeat(600);
            const result = validateComponentName(longName, {maxLength: 500});
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('Component name is too long');
            expect(result.errors[0]).toContain('600 characters');
        });

        it('should enforce maximum line limits', () => {
            const manyLinesName = 'Line1\nLine2\nLine3\nLine4\nLine5\nLine6';
            const result = validateComponentName(manyLinesName, {maxLines: 5});
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('Component name has too many lines');
        });

        it('should enforce maximum line length limits', () => {
            const longLineName = 'Normal\n' + 'A'.repeat(150) + '\nNormal';
            const result = validateComponentName(longLineName, {maxLineLength: 100});
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('Line 2 is too long');
        });

        it('should detect empty lines in multi-line names', () => {
            const emptyLineName = 'First\n\nThird';
            const result = validateComponentName(emptyLineName, {allowEmptyLines: false});
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('Line 2 is empty');
        });

        it('should allow empty lines when configured', () => {
            const emptyLineName = 'First\n\nThird';
            const result = validateComponentName(emptyLineName, {allowEmptyLines: true});
            expect(result.isValid).toBe(true);
        });

        it('should warn about whitespace-only lines', () => {
            const whitespaceLineName = 'First\n   \nThird';
            const result = validateComponentName(whitespaceLineName, {allowEmptyLines: false});
            expect(result.warnings[0]).toContain('Line 2 contains only whitespace');
        });

        it('should provide sanitized values when requested', () => {
            const messyName = '  Multi-line\nComponent  ';
            const result = validateComponentName(messyName, {sanitizeInput: true});
            expect(result.isValid).toBe(true);
            expect(result.sanitizedValue).toBe('Multi-line\nComponent');
        });

        it('should warn about performance impact for long names', () => {
            const longName = 'A'.repeat(250);
            const result = validateComponentName(longName, {maxLineLength: 300}); // Allow longer lines for this test
            expect(result.isValid).toBe(true);
            expect(result.warnings).toContain('Long component names may impact map rendering performance');
        });

        it('should warn about readability impact for many lines', () => {
            const manyLinesName = 'Line1\nLine2\nLine3\nLine4';
            const result = validateComponentName(manyLinesName);
            expect(result.isValid).toBe(true);
            expect(result.warnings).toContain('Many lines in component names may affect map readability');
        });
    });

    describe('validateEscapeSequences', () => {
        it('should accept valid escape sequences', () => {
            const result = validateEscapeSequences('Text with\\nline\\tbreak\\rand\\"quote\\"');
            expect(result.errors).toHaveLength(0);
        });

        it('should detect invalid escape sequences in strict mode', () => {
            const result = validateEscapeSequences('Invalid\\escape\\sequence', true);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]).toContain('Invalid escape sequences found');
        });

        it('should warn about invalid escape sequences in non-strict mode', () => {
            const result = validateEscapeSequences('Invalid\\escape\\sequence', false);
            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.warnings[0]).toContain('Potentially invalid escape sequences');
        });

        it('should detect unescaped quotes in multi-line content', () => {
            const result = validateEscapeSequences('Multi-line\nwith "unescaped" quotes');
            expect(result.errors[0]).toContain('Multi-line component names with quotes must escape them');
        });

        it('should detect incomplete escape sequences', () => {
            const result = validateEscapeSequences('Incomplete escape\\');
            expect(result.errors[0]).toContain('Component name ends with an incomplete escape sequence');
        });

        it('should allow properly escaped backslashes', () => {
            const result = validateEscapeSequences('Proper escape\\\\');
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('validateProblematicCharacters', () => {
        it('should detect syntax-breaking characters', () => {
            const result = validateProblematicCharacters('Component[with]brackets{and}parens()');
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]).toContain('characters that may break map syntax');
        });

        it('should detect control characters', () => {
            const nameWithControlChars = 'Component\x00WithNullChar';
            const result = validateProblematicCharacters(nameWithControlChars);
            expect(result.errors[0]).toContain('contains invalid control characters');
        });

        it('should warn about direction override characters', () => {
            const nameWithDirectionOverride = 'Component\u202AWithOverride';
            const result = validateProblematicCharacters(nameWithDirectionOverride);
            expect(result.warnings[0]).toContain('text direction override characters');
        });

        it('should warn about very long words', () => {
            const longWord = 'A'.repeat(60);
            const result = validateProblematicCharacters(`Normal ${longWord} Component`);
            expect(result.warnings[0]).toContain('very long words that may cause display issues');
        });

        it('should warn about leading/trailing whitespace', () => {
            const result = validateProblematicCharacters('  Component  ');
            expect(result.warnings[0]).toContain('leading or trailing whitespace');
        });

        it('should accept clean component names', () => {
            const result = validateProblematicCharacters('Clean Component Name');
            expect(result.errors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        });
    });

    describe('sanitizeComponentName', () => {
        it('should trim whitespace', () => {
            const result = sanitizeComponentName('  Component  ');
            expect(result).toBe('Component');
        });

        it('should remove control characters but preserve line breaks', () => {
            const nameWithControlChars = 'Component\x00With\nLine\x01Break';
            const result = sanitizeComponentName(nameWithControlChars);
            expect(result).toBe('ComponentWith\nLineBreak');
        });

        it('should remove direction override characters', () => {
            const nameWithOverride = 'Component\u202AWithOverride';
            const result = sanitizeComponentName(nameWithOverride);
            expect(result).toBe('ComponentWithOverride');
        });

        it('should normalize consecutive whitespace', () => {
            const result = sanitizeComponentName('Component   with    spaces');
            expect(result).toBe('Component with spaces');
        });

        it('should remove empty lines', () => {
            const result = sanitizeComponentName('First\n\n\nSecond');
            expect(result).toBe('First\nSecond');
        });
    });

    describe('validateComponentNameSyntax', () => {
        it('should identify when quotes are needed', () => {
            const result = validateComponentNameSyntax('Multi-line\nComponent');
            expect(result.needsQuotes).toBe(true);
            expect(result.canBeParsed).toBe(true);
        });

        it('should identify simple names that do not need quotes', () => {
            const result = validateComponentNameSyntax('Simple Component');
            expect(result.needsQuotes).toBe(false);
            expect(result.canBeParsed).toBe(true);
        });

        it('should detect unparseable syntax', () => {
            const result = validateComponentNameSyntax('Component\x00WithNull');
            expect(result.canBeParsed).toBe(false);
            expect(result.syntaxErrors[0]).toContain('null character');
        });

        it('should identify various characters that need quoting', () => {
            const testCases = [
                'Component with "quotes"',
                'Component with\\backslash',
                '  Component with whitespace  ',
                'Component [with] brackets',
                'Component -> with arrow',
            ];

            testCases.forEach(name => {
                const result = validateComponentNameSyntax(name);
                expect(result.needsQuotes).toBe(true);
            });
        });
    });

    describe('createComponentNameValidator', () => {
        it('should create a validator function for InlineEditor', () => {
            const validator = createComponentNameValidator({maxLength: 100});
            expect(typeof validator).toBe('function');
        });

        it('should return null for valid names', () => {
            const validator = createComponentNameValidator();
            const result = validator('Valid Component');
            expect(result).toBeNull();
        });

        it('should return error message for invalid names', () => {
            const validator = createComponentNameValidator({maxLength: 10});
            const result = validator('This component name is too long');
            expect(result).toContain('too long');
        });

        it('should not block saving for warnings only', () => {
            const validator = createComponentNameValidator({maxLineLength: 300}); // Allow longer lines for this test
            const longName = 'A'.repeat(250); // Should warn but not error
            const result = validator(longName);
            expect(result).toBeNull(); // Warnings don't block saving
        });
    });

    describe('validateAndRecoverComponentName', () => {
        it('should return original name when valid', () => {
            const result = validateAndRecoverComponentName('Valid Component');
            expect(result.processedName).toBe('Valid Component');
            expect(result.wasRecovered).toBe(false);
            expect(result.originalName).toBe('Valid Component');
        });

        it('should sanitize slightly invalid names', () => {
            const result = validateAndRecoverComponentName('  Component  ');
            expect(result.processedName).toBe('Component');
            expect(result.wasRecovered).toBe(false);
        });

        it('should recover completely invalid names', () => {
            const result = validateAndRecoverComponentName('');
            expect(result.processedName).toBe('Recovered Component Name');
            expect(result.wasRecovered).toBe(true);
            expect(result.recoveryMessage).toContain('corrupted');
        });

        it('should recover extremely long names', () => {
            const longName = 'A'.repeat(1000);
            const result = validateAndRecoverComponentName(longName);
            expect(result.processedName).toBe('Recovered Component Name');
            expect(result.wasRecovered).toBe(true);
            expect(result.recoveryMessage).toContain('corrupted');
        });

        it('should handle syntax errors gracefully', () => {
            const badName = 'Component\x00WithNullChar';
            const result = validateAndRecoverComponentName(badName);
            expect(result.processedName).toBe('ComponentWithNullChar'); // Null char is removed by sanitization
            expect(result.wasRecovered).toBe(false); // Sanitization fixes it
        });

        it('should provide recovery message when needed', () => {
            const result = validateAndRecoverComponentName('Component[with]invalid{syntax}');
            expect(result.wasRecovered).toBe(true);
            expect(result.recoveryMessage).toContain('invalid syntax');
        });

        it('should handle edge cases in recovery', () => {
            // Test with a name that passes validation but needs sanitization
            const result = validateAndRecoverComponentName('Valid Name');
            expect(result.processedName).toBe('Valid Name');
            expect(result.wasRecovered).toBe(false);
            expect(result.originalName).toBe('Valid Name');
        });
    });

    describe('Integration with DEFAULT_VALIDATION_OPTIONS', () => {
        it('should use default options when none provided', () => {
            const result = validateComponentName('Test Component');
            expect(result.isValid).toBe(true);
        });

        it('should allow overriding default options', () => {
            const result = validateComponentName('A'.repeat(600), {maxLength: 100});
            expect(result.isValid).toBe(false);
        });

        it('should merge options with defaults', () => {
            const result = validateComponentName('Line1\nLine2\nLine3', {maxLines: 2});
            expect(result.isValid).toBe(false);
            expect(result.errors[0]).toContain('too many lines');
        });
    });

    describe('Error message quality', () => {
        it('should provide specific error messages with context', () => {
            const longName = 'A'.repeat(600);
            const result = validateComponentName(longName, {maxLength: 500});
            expect(result.errors[0]).toContain('600 characters');
            expect(result.errors[0]).toContain('Maximum allowed: 500');
        });

        it('should indicate specific line numbers in multi-line validation', () => {
            const name = 'Line1\n' + 'A'.repeat(150) + '\nLine3';
            const result = validateComponentName(name, {maxLineLength: 100});
            expect(result.errors[0]).toContain('Line 2');
        });

        it('should provide helpful suggestions in warnings', () => {
            const result = validateEscapeSequences('Invalid\\x sequence');
            expect(result.warnings[0]).toContain('Consider using: \\n, \\r, \\t, \\", \\\\');
        });
    });
});
