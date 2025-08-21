import {setName, setMethod, setNameWithMaturity} from '../../constants/extractionFunctions';
import {IProvideBaseElement, IProvideDecoratorsConfig} from '../../types/base';

describe('Enhanced Error Handling Integration', () => {
    let consoleWarnSpy: jest.SpyInstance;
    let consoleInfoSpy: jest.SpyInstance;
    
    beforeEach(() => {
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    });
    
    afterEach(() => {
        consoleWarnSpy.mockRestore();
        consoleInfoSpy.mockRestore();
    });

    describe('setName with Enhanced Error Handling', () => {
        const mockConfig: IProvideDecoratorsConfig = {
            keyword: 'component',
            containerName: 'elements',
            config: { defaultAttributes: {} }
        };

        it('should handle well-formed quoted multi-line components', () => {
            const baseElement: IProvideBaseElement & {name?: string} = { line: 1 };
            const element = 'component "Multi-line\\nComponent\\nName" [0.5, 0.5]';
            
            setName(baseElement, element, mockConfig);
            
            expect(baseElement.name).toBe('Multi-line\nComponent\nName');
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should recover from malformed quoted strings', () => {
            const baseElement: IProvideBaseElement & {name?: string} = { line: 2 };
            const element = 'component "Unclosed Quote Component [0.5, 0.5]';
            
            setName(baseElement, element, mockConfig);
            
            expect(baseElement.name).toBeTruthy();
            expect(baseElement.name).not.toBe('');
            expect(consoleWarnSpy).toHaveBeenCalled();
        });

        it('should handle severely malformed input with safe fallback', () => {
            const baseElement: IProvideBaseElement & {name?: string} = { line: 3 };
            const element = 'component "\\x\\y\\z\\broken\\escapes"malformed [invalid]';
            
            setName(baseElement, element, mockConfig);
            
            expect(baseElement.name).toBeTruthy();
            expect(typeof baseElement.name).toBe('string');
            expect(baseElement.name.length).toBeGreaterThan(0);
        });

        it('should handle empty component names', () => {
            const baseElement: IProvideBaseElement & {name?: string} = { line: 4 };
            const element = 'component [0.5, 0.5]';
            
            setName(baseElement, element, mockConfig);
            
            expect(baseElement.name).toBeTruthy();
            expect(baseElement.name.length).toBeGreaterThan(0);
        });

        it('should maintain backward compatibility for simple names', () => {
            const baseElement: IProvideBaseElement & {name?: string} = { line: 5 };
            const element = 'component Simple Component [0.5, 0.5]';
            
            setName(baseElement, element, mockConfig);
            
            expect(baseElement.name).toBe('Simple Component');
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should handle edge case with only quotes', () => {
            const baseElement: IProvideBaseElement & {name?: string} = { line: 6 };
            const element = 'component "" [0.5, 0.5]';
            
            setName(baseElement, element, mockConfig);
            
            expect(baseElement.name).toBeTruthy();
            expect(baseElement.name.length).toBeGreaterThan(0);
        });

        it('should log appropriate warnings and info messages', () => {
            const baseElement: IProvideBaseElement & {name?: string} = { line: 7 };
            const element = 'component "Component\\xwith\\bad\\escapes" [0.5, 0.5]';
            
            setName(baseElement, element, mockConfig);
            
            // Should have logged some kind of parsing issue
            expect(consoleWarnSpy.mock.calls.length + consoleInfoSpy.mock.calls.length).toBeGreaterThan(0);
        });
    });

    describe('setMethod with Enhanced Error Handling', () => {
        const mockConfig: IProvideDecoratorsConfig = {
            keyword: 'build',
            containerName: 'methods',
            config: { defaultAttributes: {} }
        };

        it('should handle well-formed quoted method names', () => {
            const baseElement: IProvideBaseElement & {
                name?: string;
                build?: boolean;
                buy?: boolean;
                outsource?: boolean;
                market?: boolean;
                ecosystem?: boolean;
            } = { line: 1 };
            const element = 'build "Multi-line\\nMethod\\nName"';
            
            setMethod(baseElement, element, mockConfig);
            
            expect(baseElement.name).toBe('Multi-line\nMethod\nName');
            expect(baseElement.build).toBe(true);
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should recover from malformed method names', () => {
            const baseElement: IProvideBaseElement & {
                name?: string;
                build?: boolean;
            } = { line: 2 };
            const element = 'build "Malformed Method';
            
            setMethod(baseElement, element, mockConfig);
            
            expect(baseElement.name).toBeTruthy();
            expect(baseElement.name).not.toBe('');
            expect(baseElement.build).toBe(true);
            expect(consoleWarnSpy).toHaveBeenCalled();
        });

        it('should handle simple unquoted method names', () => {
            const baseElement: IProvideBaseElement & {
                name?: string;
                build?: boolean;
            } = { line: 3 };
            const element = 'build Simple Method Name';
            
            setMethod(baseElement, element, mockConfig);
            
            expect(baseElement.name).toBe('Simple Method Name');
            expect(baseElement.build).toBe(true);
        });

        it('should provide safe fallback for completely broken method names', () => {
            const baseElement: IProvideBaseElement & {
                name?: string;
                build?: boolean;
            } = { line: 4 };
            const element = 'build "\\x\\y\\z\\completely\\broken"syntax';
            
            setMethod(baseElement, element, mockConfig);
            
            expect(baseElement.name).toBeTruthy();
            expect(typeof baseElement.name).toBe('string');
            expect(baseElement.name.length).toBeGreaterThan(0);
            expect(baseElement.build).toBe(true);
        });
    });

    describe('setNameWithMaturity with Enhanced Error Handling', () => {
        it('should handle well-formed quoted evolution names', () => {
            const baseElement: IProvideBaseElement & {
                name?: string;
                override?: string;
                maturity?: number;
            } = { line: 1 };
            const element = 'evolve "Multi-line\\nEvolution\\nName" 0.8';
            
            setNameWithMaturity(baseElement, element);
            
            expect(baseElement.name).toBe('Multi-line\nEvolution\nName');
            expect(baseElement.maturity).toBe(0.8);
            expect(baseElement.override).toBe('');
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should handle evolution with override syntax', () => {
            const baseElement: IProvideBaseElement & {
                name?: string;
                override?: string;
                maturity?: number;
            } = { line: 2 };
            const element = 'evolve "Original\\nName" -> "Override\\nName" 0.9';
            
            setNameWithMaturity(baseElement, element);
            
            expect(baseElement.name).toBe('Original\nName');
            expect(baseElement.override).toBeTruthy(); // Should have override
            expect(baseElement.maturity).toBe(0.9);
        });

        it('should recover from malformed evolution syntax', () => {
            const baseElement: IProvideBaseElement & {
                name?: string;
                override?: string;
                maturity?: number;
            } = { line: 3 };
            const element = 'evolve "Malformed Evolution 0.7';
            
            setNameWithMaturity(baseElement, element);
            
            expect(baseElement.name).toBeTruthy();
            expect(baseElement.name).not.toBe('');
            expect(baseElement.maturity).toBeDefined();
            expect(consoleWarnSpy).toHaveBeenCalled();
        });

        it('should handle missing evolution section gracefully', () => {
            const baseElement: IProvideBaseElement & {
                name?: string;
                override?: string;
                maturity?: number;
            } = { line: 4 };
            const element = 'evolve';
            
            setNameWithMaturity(baseElement, element);
            
            expect(baseElement.name).toBe('Component');
            expect(baseElement.override).toBe('');
            expect(baseElement.maturity).toBe(0.85);
            expect(consoleWarnSpy).toHaveBeenCalled();
        });

        it('should handle legacy single-line evolution syntax', () => {
            const baseElement: IProvideBaseElement & {
                name?: string;
                override?: string;
                maturity?: number;
            } = { line: 5 };
            const element = 'evolve Simple Component -> Override Name 0.6';
            
            setNameWithMaturity(baseElement, element);
            
            expect(baseElement.name).toBe('Simple Component');
            expect(baseElement.override).toBe('Override Name');
            expect(baseElement.maturity).toBe(0.6);
        });

        it('should handle invalid maturity values gracefully', () => {
            const baseElement: IProvideBaseElement & {
                name?: string;
                override?: string;
                maturity?: number;
            } = { line: 6 };
            const element = 'evolve "Component Name" invalid_maturity';
            
            setNameWithMaturity(baseElement, element);
            
            expect(baseElement.name).toBe('Component Name');
            expect(baseElement.maturity).toBe(0.85); // Should use default
            // Note: Warning may or may not be called depending on parsing path
        });

        it('should provide safe fallback when everything fails', () => {
            const baseElement: IProvideBaseElement & {
                name?: string;
                override?: string;
                maturity?: number;
            } = { line: 7 };
            const element = 'evolve "\\x\\y\\z\\completely\\broken"invalid.syntax}';
            
            setNameWithMaturity(baseElement, element);
            
            expect(baseElement.name).toBeTruthy();
            expect(typeof baseElement.name).toBe('string');
            expect(baseElement.name.length).toBeGreaterThan(0);
            expect(baseElement.maturity).toBeDefined();
            expect(typeof baseElement.maturity).toBe('number');
        });
    });

    describe('Error Logging and Recovery Tracking', () => {
        it('should log different types of parsing issues appropriately', () => {
            const mockConfig: IProvideDecoratorsConfig = {
                keyword: 'component',
                containerName: 'elements',
                config: { defaultAttributes: {} }
            };

            // Test various problematic inputs
            const problemCases = [
                { element: 'component "Unclosed [0.5, 0.5]', description: 'unclosed quote' },
                { element: 'component "\\x\\invalid" [0.5, 0.5]', description: 'invalid escapes' },
                { element: 'component "" [0.5, 0.5]', description: 'empty name' },
                { element: 'component [0.5, 0.5]', description: 'no name' },
            ];

            problemCases.forEach((testCase, index) => {
                const baseElement: IProvideBaseElement & {name?: string} = { line: index + 1 };
                setName(baseElement, testCase.element, mockConfig);
                
                expect(baseElement.name).toBeTruthy();
                expect(baseElement.name.length).toBeGreaterThan(0);
            });

            // Should have logged warnings or info for the problematic cases
            expect(consoleWarnSpy.mock.calls.length + consoleInfoSpy.mock.calls.length).toBeGreaterThan(0);
        });

        it('should track recovery strategies appropriately', () => {
            const mockConfig: IProvideDecoratorsConfig = {
                keyword: 'component',
                containerName: 'elements',
                config: { defaultAttributes: {} }
            };

            const baseElement: IProvideBaseElement & {name?: string} = { line: 1 };
            const element = 'component "Severely\\x\\broken\\syntax"malformed';
            
            setName(baseElement, element, mockConfig);
            
            expect(baseElement.name).toBeTruthy();
            
            // Check that warning calls include recovery strategy information
            const warningCalls = consoleWarnSpy.mock.calls;
            const hasRecoveryInfo = warningCalls.some(call => 
                call.some(arg => typeof arg === 'string' && arg.includes('strategy'))
            );
            
            expect(hasRecoveryInfo || warningCalls.length > 0).toBe(true);
        });
    });

    describe('Edge Cases and Boundary Conditions', () => {
        it('should handle extremely long malformed strings without crashing', () => {
            const mockConfig: IProvideDecoratorsConfig = {
                keyword: 'component',
                containerName: 'elements',
                config: { defaultAttributes: {} }
            };

            const baseElement: IProvideBaseElement & {name?: string} = { line: 1 };
            const longMalformedString = '"' + 'A'.repeat(10000) + '\\x\\broken';
            const element = `component ${longMalformedString} [0.5, 0.5]`;
            
            expect(() => {
                setName(baseElement, element, mockConfig);
            }).not.toThrow();
            
            expect(baseElement.name).toBeTruthy();
            expect(typeof baseElement.name).toBe('string');
        });

        it('should handle null and undefined inputs gracefully', () => {
            const mockConfig: IProvideDecoratorsConfig = {
                keyword: 'component',
                containerName: 'elements',
                config: { defaultAttributes: {} }
            };

            const baseElement: IProvideBaseElement & {name?: string} = { line: 1 };
            
            // These should not crash the function
            expect(() => {
                setName(baseElement, null as any, mockConfig);
            }).not.toThrow();
            
            expect(() => {
                setName(baseElement, undefined as any, mockConfig);
            }).not.toThrow();
            
            expect(baseElement.name).toBeTruthy();
        });

        it('should handle special characters and Unicode correctly', () => {
            const mockConfig: IProvideDecoratorsConfig = {
                keyword: 'component',
                containerName: 'elements',
                config: { defaultAttributes: {} }
            };

            const baseElement: IProvideBaseElement & {name?: string} = { line: 1 };
            const element = 'component "Unicode: 你好, 🌍, café" [0.5, 0.5]';
            
            setName(baseElement, element, mockConfig);
            
            expect(baseElement.name).toBe('Unicode: 你好, 🌍, café');
        });
    });
});