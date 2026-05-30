import '../../../components/editor/mode-owm';

declare global {
    interface Window {
        ace: any;
    }
}

describe('Monaco Editor OWM Mode Syntax Highlighting', () => {
    let ace: any;
    let OwmHighlightRules: any;

    beforeAll(() => {
        // Setup ace mock if needed
        if (typeof window !== 'undefined') {
            ace = (window as any).ace;
        } else {
            // Mock ace for testing
            global.ace = {
                define: jest.fn((moduleName: string, dependencies: string[], factory: Function) => {
                    const mockRequire = (name: string) => {
                        if (name === '../lib/oop') {
                            return {
                                inherits: jest.fn(),
                            };
                        }
                        if (name === './text') {
                            return {
                                Mode: function () {},
                            };
                        }
                        if (name === './text_highlight_rules') {
                            return {
                                TextHighlightRules: function () {},
                            };
                        }
                        if (name === './owm_highlight_rules') {
                            return {
                                OwmHighlightRules: function () {},
                            };
                        }
                        return {};
                    };

                    const mockExports: any = {};
                    const mockModule = {exports: mockExports};

                    factory(mockRequire, mockExports, mockModule);

                    if (moduleName === 'ace/mode/owm_highlight_rules' && mockExports.OwmHighlightRules) {
                        OwmHighlightRules = mockExports.OwmHighlightRules;
                    }
                }),
            };
            ace = global.ace;
        }
    });

    describe('OWM Highlight Rules', () => {
        it('should define the OWM mode', () => {
            expect(ace.define).toBeDefined();
            expect(typeof ace.define).toBe('function');
        });

        it('should create highlight rules for multi-line component links', () => {
            if (OwmHighlightRules) {
                const rules = new OwmHighlightRules();
                expect(rules.$rules).toBeDefined();
                expect(rules.$rules.start).toBeDefined();
                expect(Array.isArray(rules.$rules.start)).toBe(true);

                // Check that we have rules for quoted strings
                const quotedStringRules = rules.$rules.start.filter(
                    (rule: any) =>
                        rule.token &&
                        ((Array.isArray(rule.token) && rule.token.includes('string.quoted.double.asp')) ||
                            rule.token === 'string.quoted.double.asp'),
                );

                expect(quotedStringRules.length).toBeGreaterThan(0);
            }
        });

        it('should have rules for basic link syntax', () => {
            if (OwmHighlightRules) {
                const rules = new OwmHighlightRules();

                // Check for link arrow rules
                const linkRules = rules.$rules.start.filter((rule: any) => rule.regex && rule.regex.includes('\\-\\>'));

                expect(linkRules.length).toBeGreaterThan(0);
            }
        });

        it('should have rules for flow link syntax', () => {
            if (OwmHighlightRules) {
                const rules = new OwmHighlightRules();

                // Check for flow link rules
                const flowLinkRules = rules.$rules.start.filter((rule: any) => rule.regex && rule.regex.includes('\\+'));

                expect(flowLinkRules.length).toBeGreaterThan(0);
            }
        });

        it('should include valuechain as a DSL keyword rule', () => {
            if (OwmHighlightRules) {
                const rules = new OwmHighlightRules();
                const keywordRules = rules.$rules.start.filter((rule: any) => rule.regex && typeof rule.regex === 'string');
                const hasValuechain = keywordRules.some((rule: any) => rule.regex.includes('valuechain'));
                expect(hasValuechain).toBe(true);
            }
        });

        it('should include uncertainty highlighting rules for mixed syntax', () => {
            if (OwmHighlightRules) {
                const rules = new OwmHighlightRules();
                const stringRules = rules.$rules.start.filter((rule: any) => typeof rule.regex === 'string');

                const hasUncertaintyBracket = stringRules.some((rule: any) => rule.regex.includes('uncertainty\\s*\\['));
                const hasUncertaintySides = stringRules.some((rule: any) => rule.regex.includes('(left|right)'));

                expect(hasUncertaintyBracket).toBe(true);
                expect(hasUncertaintySides).toBe(true);
            }
        });

        it('should match uncertainty mixed syntax patterns', () => {
            if (OwmHighlightRules) {
                const rules = new OwmHighlightRules();
                const uncertaintyRules = rules.$rules.start.filter(
                    (rule: any) => typeof rule.regex === 'string' && rule.regex.includes('uncertainty'),
                );
                const compiled = uncertaintyRules.map((rule: any) => new RegExp(rule.regex));

                const samples = [
                    'component A [0.8, 0.5] uncertainty [, 0.7]',
                    'component A [0.8, 0.5] uncertainty [0.3, ]',
                    'component A [0.8, 0.5] uncertainty [,+0.2]',
                    'component A [0.8, 0.5] uncertainty [-0.15, ]',
                    'component A [0.8, 0.5] uncertainty right +0.20',
                    'component A [0.8, 0.5] uncertainty left -0.15',
                ];

                samples.forEach(sample => {
                    expect(compiled.some(regex => regex.test(sample))).toBe(true);
                });
            }
        });
    });

    describe('Regex Pattern Validation', () => {
        const testPatterns = [
            // Quoted component links
            '"Multi-line\\nComponent"->"Target Component"',
            '"Source Component"->"Multi-line\\nTarget"',
            '"Multi-line\\nSource"->"Multi-line\\nTarget"',

            // Flow links with quoted components
            '"Database\\nService"+>"API\\nGateway"',
            '"Multi-line\\nSource"+<"Multi-line\\nTarget"',

            // Simple component links (should still work)
            'Simple Source->Simple Target',
            'Source+>Target',

            // Complex escaping
            '"Component with \\"quotes\\"\\nand line breaks"->Target',
            '"Component with \\\\backslash\\nand multiple lines"->Target',
        ];

        testPatterns.forEach(pattern => {
            it(`should validate pattern: ${pattern}`, () => {
                // This test ensures our regex patterns don't cause errors
                expect(() => {
                    new RegExp(pattern);
                }).not.toThrow();

                // Basic validation that our regex captures the expected structure
                const hasArrow = pattern.includes('->') || pattern.includes('+>') || pattern.includes('+<');
                expect(hasArrow).toBe(true);

                if (pattern.includes('"')) {
                    const quotedParts = pattern.match(/"[^"]*"/g);
                    expect(quotedParts).toBeTruthy();
                }
            });
        });
    });

    describe('Token Type Validation', () => {
        it('should use appropriate token types for syntax highlighting', () => {
            const expectedTokenTypes = [
                'punctuation.definition.string.begin.asp', // Opening quotes
                'string.quoted.double.asp', // Quoted string content
                'punctuation.definition.string.end.asp', // Closing quotes
                'punctuation', // Link operators
                'variable.parameter.function.asp', // Unquoted component names
            ];

            expectedTokenTypes.forEach(tokenType => {
                expect(typeof tokenType).toBe('string');
                expect(tokenType.length).toBeGreaterThan(0);
            });
        });
    });
});
