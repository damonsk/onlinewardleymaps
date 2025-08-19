import {setText, setName} from '../../constants/extractionFunctions';
import {IProvideBaseElement, IProvideDecoratorsConfig} from '../../types/base';

describe('setText function', () => {
    let baseElement: IProvideBaseElement & {text?: string};
    let config: IProvideDecoratorsConfig;

    beforeEach(() => {
        baseElement = {};
        config = {
            keyword: 'note',
            containerName: 'notes',
            defaultAttributes: {}
        };
    });

    describe('backward compatibility - unquoted strings', () => {
        it('should handle simple single-line notes', () => {
            const element = 'note Simple note text [0.5, 0.7]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Simple note text');
        });

        it('should handle notes with special characters', () => {
            const element = 'note Note with +special &chars! [0.4, 0.6]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Note with +special &chars!');
        });

        it('should handle notes with numbers and symbols', () => {
            const element = 'note Note 123 with symbols: @#$% [0.2, 0.8]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Note 123 with symbols: @#$%');
        });

        it('should handle notes with extra whitespace', () => {
            const element = '   note   Spaced Note Text   [0.1, 0.9]   ';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Spaced Note Text');
        });

        it('should handle notes without coordinates', () => {
            const element = 'note Note without coordinates';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Note without coordinates');
        });

        it('should handle empty note text', () => {
            const element = 'note [0.5, 0.5]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('');
        });

        it('should handle notes with different coordinate formats', () => {
            const element = 'note Test Note [ 0.5 , 0.5 ]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Test Note');
        });
    });

    describe('new functionality - quoted strings', () => {
        it('should handle simple quoted single-line notes', () => {
            const element = 'note "Simple quoted note" [0.5, 0.7]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Simple quoted note');
        });

        it('should handle quoted multi-line notes with \\n', () => {
            const element = 'note "Multi-line\\nnote content\\nwith breaks" [0.3, 0.8]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Multi-line\nnote content\nwith breaks');
        });

        it('should handle escaped quotes within quoted strings', () => {
            const element = 'note "Note with \\"escaped quotes\\" inside" [0.4, 0.6]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Note with "escaped quotes" inside');
        });

        it('should handle escaped backslashes', () => {
            const element = 'note "Note with \\\\ backslash" [0.2, 0.8]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Note with \\ backslash');
        });

        it('should handle complex escaping combinations', () => {
            const element = 'note "Complex \\"quote\\" and \\n newline and \\\\ backslash" [0.1, 0.9]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Complex "quote" and \n newline and \\ backslash');
        });

        it('should handle quoted strings with extra whitespace', () => {
            const element = '   note   "Quoted with spaces"   [0.5, 0.5]   ';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Quoted with spaces');
        });

        it('should handle empty quoted strings', () => {
            const element = 'note "" [0.5, 0.5]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('');
        });

        it('should handle quoted strings without coordinates', () => {
            const element = 'note "Quoted without coordinates"';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Quoted without coordinates');
        });
    });

    describe('edge cases and error handling', () => {
        it('should handle malformed quoted strings - missing closing quote', () => {
            const element = 'note "Unclosed quote [0.5, 0.5]';
            setText(baseElement, element, config);
            // Should fallback to legacy parsing and remove the leading quote
            expect(baseElement.text).toBe('Unclosed quote');
        });

        it('should handle malformed quoted strings - quote in middle', () => {
            const element = 'note "Start quote but no end before [0.5, 0.5]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Start quote but no end before');
        });

        it('should handle multiple quotes in unquoted context', () => {
            const element = 'note Text with "quotes" in middle [0.5, 0.5]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Text with "quotes" in middle');
        });

        it('should handle only escaped quotes', () => {
            const element = 'note "\\"" [0.5, 0.5]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('"');
        });

        it('should handle nested escaping', () => {
            const element = 'note "Text with \\\\\\"nested\\\\\\" escaping" [0.5, 0.5]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Text with \\"nested\\" escaping');
        });

        it('should handle quotes at the end without coordinates', () => {
            const element = 'note "Quote at end"';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Quote at end');
        });
    });

    describe('different keywords', () => {
        it('should work with different keywords', () => {
            config.keyword = 'annotation';
            const element = 'annotation "Multi-line\\nannotation text" [0.3, 0.7]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Multi-line\nannotation text');
        });

        it('should handle keyword at different positions', () => {
            const element = '  note "Indented note" [0.5, 0.5]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Indented note');
        });
    });

    describe('real-world examples', () => {
        it('should handle typical single-line note', () => {
            const element = 'note This is a typical single line note [0.5, 0.7]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('This is a typical single line note');
        });

        it('should handle multi-line documentation note', () => {
            const element = 'note "This is a documentation note\\nwith multiple lines\\nfor detailed explanation" [0.2, 0.8]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('This is a documentation note\nwith multiple lines\nfor detailed explanation');
        });

        it('should handle note with code snippet', () => {
            const element = 'note "Code example:\\nfunction test() {\\n  return \\"hello\\";\\n}" [0.6, 0.4]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Code example:\nfunction test() {\n  return "hello";\n}');
        });

        it('should handle note with mixed content', () => {
            const element = 'note "Mixed content:\\n- Item 1\\n- Item 2\\n\\nSee \\"documentation\\" for details" [0.3, 0.6]';
            setText(baseElement, element, config);
            expect(baseElement.text).toBe('Mixed content:\n- Item 1\n- Item 2\n\nSee "documentation" for details');
        });
    });

    describe('performance and edge cases', () => {
        it('should handle very long quoted strings', () => {
            const longText = 'A'.repeat(1000);
            const element = `note "${longText}" [0.5, 0.5]`;
            setText(baseElement, element, config);
            expect(baseElement.text).toBe(longText);
        });

        it('should handle many line breaks', () => {
            const textWithManyBreaks = Array(50).fill('line').join('\\n');
            const element = `note "${textWithManyBreaks}" [0.5, 0.5]`;
            setText(baseElement, element, config);
            expect(baseElement.text).toBe(Array(50).fill('line').join('\n'));
        });

        it('should handle many escaped quotes', () => {
            const textWithManyQuotes = Array(20).fill('\\"quote\\"').join(' ');
            const element = `note "${textWithManyQuotes}" [0.5, 0.5]`;
            setText(baseElement, element, config);
            expect(baseElement.text).toBe(Array(20).fill('"quote"').join(' '));
        });
    });
});

describe('setName function', () => {
    let baseElement: IProvideBaseElement & {name?: string};
    let config: IProvideDecoratorsConfig;

    beforeEach(() => {
        baseElement = {};
        config = {keyword: 'component'};
    });

    describe('backward compatibility (legacy single-line parsing)', () => {
        it('should parse simple single-line component names', () => {
            const element = 'component Simple Component [0.5, 0.7]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('Simple Component');
        });

        it('should handle component names with special characters', () => {
            const element = 'component Component with +special &chars! [0.4, 0.6]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('Component with +special &chars!');
        });

        it('should handle empty component names', () => {
            const element = 'component [0.5, 0.5]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('');
        });

        it('should handle component names with numbers', () => {
            const element = 'component Component 123 v2.0 [0.3, 0.8]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('Component 123 v2.0');
        });

        it('should handle component names with hyphens and underscores', () => {
            const element = 'component my-component_name [0.6, 0.4]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('my-component_name');
        });
    });

    describe('new multi-line functionality', () => {
        it('should parse quoted single-line component names', () => {
            const element = 'component "Simple Quoted Component" [0.5, 0.7]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('Simple Quoted Component');
        });

        it('should parse quoted multi-line component names with \\n', () => {
            const element = 'component "Multi-line\\nComponent\\nName" [0.3, 0.8]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('Multi-line\nComponent\nName');
        });

        it('should handle escaped quotes within quoted component names', () => {
            const element = 'component "Component with \\"escaped quotes\\" inside" [0.4, 0.6]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('Component with "escaped quotes" inside');
        });

        it('should handle complex escaping combinations', () => {
            const element = 'component "Complex \\"quote\\" and \\n newline and \\\\\\\\ backslash" [0.1, 0.9]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('Complex "quote" and \n newline and \\\\ backslash');
        });

        it('should handle empty quoted component names', () => {
            const element = 'component "" [0.5, 0.5]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('');
        });

        it('should handle multi-line component names with empty lines', () => {
            const element = 'component "Line 1\\n\\nLine 3" [0.2, 0.8]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('Line 1\n\nLine 3');
        });
    });

    describe('edge cases and malformed input', () => {
        it('should handle unclosed quoted strings gracefully', () => {
            const element = 'component "Unclosed quote [0.5, 0.5]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('Unclosed quote');
        });

        it('should handle component names without coordinates', () => {
            const element = 'component "Quoted without coordinates"';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('Quoted without coordinates');
        });

        it('should handle malformed quotes at the beginning', () => {
            const element = 'component "Partial quote content [0.5, 0.5]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('Partial quote content');
        });

        it('should handle component names with only quotes', () => {
            const element = 'component "\\"" [0.5, 0.5]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('"');
        });

        it('should handle component names with only line breaks', () => {
            const element = 'component "\\n\\n\\n" [0.5, 0.5]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('\n\n\n');
        });
    });

    describe('real-world examples', () => {
        it('should handle documentation-style multi-line component names', () => {
            const element = 'component "User Authentication\\nService\\n(OAuth 2.0)" [0.2, 0.8]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('User Authentication\nService\n(OAuth 2.0)');
        });

        it('should handle component names with technical details', () => {
            const element = 'component "Database\\nPostgreSQL 13\\n(Primary)" [0.6, 0.4]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('Database\nPostgreSQL 13\n(Primary)');
        });

        it('should handle component names with version information', () => {
            const element = 'component "API Gateway\\nv2.1.0\\n(Load Balanced)" [0.4, 0.7]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('API Gateway\nv2.1.0\n(Load Balanced)');
        });

        it('should handle component names with special formatting', () => {
            const element = 'component "Frontend App\\n- React 18\\n- TypeScript\\n- PWA" [0.8, 0.3]';
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('Frontend App\n- React 18\n- TypeScript\n- PWA');
        });
    });

    describe('different keywords', () => {
        it('should work with different component types', () => {
            const marketConfig = {keyword: 'market'};
            const element = 'market "Multi-line\\nMarket\\nComponent" [0.1, 0.9]';
            setName(baseElement, element, marketConfig);
            expect(baseElement.name).toBe('Multi-line\nMarket\nComponent');
        });

        it('should work with ecosystem keyword', () => {
            const ecosystemConfig = {keyword: 'ecosystem'};
            const element = 'ecosystem "Cloud\\nEcosystem\\nProvider" [0.0, 1.0]';
            setName(baseElement, element, ecosystemConfig);
            expect(baseElement.name).toBe('Cloud\nEcosystem\nProvider');
        });
    });

    describe('performance and stress tests', () => {
        it('should handle very long quoted component names', () => {
            const longName = 'A'.repeat(500);
            const element = `component "${longName}" [0.5, 0.5]`;
            setName(baseElement, element, config);
            expect(baseElement.name).toBe(longName);
        });

        it('should handle many line breaks', () => {
            const nameWithManyBreaks = Array(20).fill('line').join('\\n');
            const element = `component "${nameWithManyBreaks}" [0.5, 0.5]`;
            setName(baseElement, element, config);
            expect(baseElement.name).toBe(Array(20).fill('line').join('\n'));
        });

        it('should handle many escaped quotes', () => {
            const nameWithManyQuotes = Array(10).fill('\\"quote\\"').join(' ');
            const element = `component "${nameWithManyQuotes}" [0.5, 0.5]`;
            setName(baseElement, element, config);
            expect(baseElement.name).toBe(Array(10).fill('"quote"').join(' '));
        });

        it('should handle complex mixed escaping', () => {
            const complexName = 'Start\\n\\"Quote 1\\"\\n\\\\Backslash\\\\\\n\\"Quote 2\\"\\nEnd';
            const element = `component "${complexName}" [0.5, 0.5]`;
            setName(baseElement, element, config);
            expect(baseElement.name).toBe('Start\n"Quote 1"\n\\Backslash\\\n"Quote 2"\nEnd');
        });
    });
});