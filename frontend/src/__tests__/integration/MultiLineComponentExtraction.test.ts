import ComponentExtractionStrategy from '../../conversion/ComponentExtractionStrategy';

describe('Multi-line Component Extraction Integration', () => {
    describe('backward compatibility', () => {
        it('should extract single-line unquoted component names correctly', () => {
            const mapText = 'component Simple Component [0.5, 0.7]';
            const strategy = new ComponentExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.elements).toHaveLength(1);
            expect(result.elements[0].name).toBe('Simple Component');
            expect(result.elements[0].visibility).toBe(0.5);
            expect(result.elements[0].maturity).toBe(0.7);
        });

        it('should extract component names with special characters', () => {
            const mapText = 'component Component with +special &chars! [0.4, 0.6]';
            const strategy = new ComponentExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.elements).toHaveLength(1);
            expect(result.elements[0].name).toBe('Component with +special &chars!');
            expect(result.elements[0].visibility).toBe(0.4);
            expect(result.elements[0].maturity).toBe(0.6);
        });

        it('should recover empty component names gracefully', () => {
            const mapText = 'component [0.5, 0.5]';
            const strategy = new ComponentExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.elements).toHaveLength(1);
            expect(result.elements[0].name).toBe('Recovered Component Name'); // Validation recovery
            expect(result.elements[0].visibility).toBe(0.5);
            expect(result.elements[0].maturity).toBe(0.5);
        });
    });

    describe('new multi-line functionality', () => {
        it('should extract simple quoted single-line component names', () => {
            const mapText = 'component "Simple Quoted Component" [0.5, 0.7]';
            const strategy = new ComponentExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.elements).toHaveLength(1);
            expect(result.elements[0].name).toBe('Simple Quoted Component');
            expect(result.elements[0].visibility).toBe(0.5);
            expect(result.elements[0].maturity).toBe(0.7);
        });

        it('should extract multi-line quoted component names with line breaks', () => {
            const mapText = 'component "Multi-line\\nComponent\\nName" [0.3, 0.8]';
            const strategy = new ComponentExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.elements).toHaveLength(1);
            expect(result.elements[0].name).toBe('Multi-line\nComponent\nName');
            expect(result.elements[0].visibility).toBe(0.3);
            expect(result.elements[0].maturity).toBe(0.8);
        });

        it('should handle escaped quotes within quoted component names', () => {
            const mapText = 'component "Component with \\"escaped quotes\\" inside" [0.4, 0.6]';
            const strategy = new ComponentExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.elements).toHaveLength(1);
            expect(result.elements[0].name).toBe('Component with "escaped quotes" inside');
            expect(result.elements[0].visibility).toBe(0.4);
            expect(result.elements[0].maturity).toBe(0.6);
        });

        it('should handle complex escaping combinations with validation recovery', () => {
            const mapText = 'component "Complex \\"quote\\" and \\n newline and \\\\\\\\ backslash" [0.1, 0.9]';
            const strategy = new ComponentExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.elements).toHaveLength(1);
            // Name gets recovered due to validation of syntax-breaking characters or complexity
            expect(result.elements[0].name).toBe('Component');
            expect(result.elements[0].visibility).toBe(0.1);
            expect(result.elements[0].maturity).toBe(0.9);
        });

        it('should recover empty quoted component names gracefully', () => {
            const mapText = 'component "" [0.5, 0.5]';
            const strategy = new ComponentExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.elements).toHaveLength(1);
            expect(result.elements[0].name).toBe('Recovered Component Name'); // Validation recovery
            expect(result.elements[0].visibility).toBe(0.5);
            expect(result.elements[0].maturity).toBe(0.5);
        });
    });

    describe('mixed content scenarios', () => {
        it('should handle maps with both quoted and unquoted component names', () => {
            const mapText = `title Test Map
component A [0.5, 0.5]
component "Simple quoted component" [0.6, 0.4]
component "Multi-line\\nquoted component\\nwith breaks" [0.2, 0.8]
component B [0.8, 0.2]`;

            const strategy = new ComponentExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.elements).toHaveLength(4);

            // First component (unquoted)
            expect(result.elements[0].name).toBe('A');
            expect(result.elements[0].visibility).toBe(0.5);
            expect(result.elements[0].maturity).toBe(0.5);

            // Second component (quoted single-line)
            expect(result.elements[1].name).toBe('Simple quoted component');
            expect(result.elements[1].visibility).toBe(0.6);
            expect(result.elements[1].maturity).toBe(0.4);

            // Third component (quoted multi-line)
            expect(result.elements[2].name).toBe('Multi-line\nquoted component\nwith breaks');
            expect(result.elements[2].visibility).toBe(0.2);
            expect(result.elements[2].maturity).toBe(0.8);

            // Fourth component (unquoted)
            expect(result.elements[3].name).toBe('B');
            expect(result.elements[3].visibility).toBe(0.8);
            expect(result.elements[3].maturity).toBe(0.2);
        });
    });

    describe('edge cases', () => {
        it('should handle malformed quoted strings gracefully', () => {
            const mapText = 'component "Unclosed quote [0.5, 0.5]';
            const strategy = new ComponentExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.elements).toHaveLength(1);
            expect(result.elements[0].name).toBe('Unclosed quote');
            expect(result.elements[0].visibility).toBe(0.5);
            expect(result.elements[0].maturity).toBe(0.5);
        });

        it('should handle component names without coordinates', () => {
            const mapText = 'component "Quoted without coordinates"';
            const strategy = new ComponentExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.elements).toHaveLength(1);
            expect(result.elements[0].name).toBe('Quoted without coordinates');
            // Should use default coordinates
            expect(result.elements[0].visibility).toBe(0.9);
            expect(result.elements[0].maturity).toBe(0.1);
        });
    });

    describe('real-world examples', () => {
        it('should handle documentation-style multi-line component names with validation recovery', () => {
            const mapText = 'component "User Authentication\\nService\\n(OAuth 2.0)" [0.2, 0.8]';
            const strategy = new ComponentExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.elements).toHaveLength(1);
            // Name gets recovered due to parentheses being syntax-breaking characters
            expect(result.elements[0].name).toBe('Component');
            expect(result.elements[0].visibility).toBe(0.2);
            expect(result.elements[0].maturity).toBe(0.8);
        });

        it('should handle component names with technical details with validation recovery', () => {
            const mapText = 'component "Database\\nPostgreSQL 13\\n(Primary)" [0.6, 0.4]';
            const strategy = new ComponentExtractionStrategy(mapText);
            const result = strategy.apply();

            expect(result.elements).toHaveLength(1);
            // Name gets recovered due to parentheses being syntax-breaking characters
            expect(result.elements[0].name).toBe('Component');
            expect(result.elements[0].visibility).toBe(0.6);
            expect(result.elements[0].maturity).toBe(0.4);
        });
    });
});
