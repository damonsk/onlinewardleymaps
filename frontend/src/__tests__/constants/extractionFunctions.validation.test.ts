import {setName, setNameWithMaturity} from '../../constants/extractionFunctions';

describe('ExtractionFunctions Validation Integration', () => {
    describe('setName with validation', () => {
        it('should process valid component names normally', () => {
            const baseElement: any = {};
            const element = 'component Valid Component [0.5, 0.7]';
            const config = {keyword: 'component'};

            setName(baseElement, element, config);

            expect(baseElement.name).toBe('Valid Component');
        });

        it('should process multi-line component names correctly', () => {
            const baseElement: any = {};
            const element = 'component "Multi-line\\nComponent\\nName" [0.5, 0.7]';
            const config = {keyword: 'component'};

            setName(baseElement, element, config);

            expect(baseElement.name).toBe('Multi-line\nComponent\nName');
        });

        it('should sanitize problematic component names', () => {
            const baseElement: any = {};
            const element = 'component "  Component  " [0.5, 0.7]';
            const config = {keyword: 'component'};

            setName(baseElement, element, config);

            expect(baseElement.name).toBe('Component');
        });

        it('should recover from malformed component names', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            const baseElement: any = {};
            // This creates an empty component name after parsing
            const element = 'component [0.5, 0.7]';
            const config = {keyword: 'component'};

            setName(baseElement, element, config);

            // Should recover to a default name
            expect(baseElement.name).toBe('Recovered Component Name');
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Component name recovery'),
                expect.objectContaining({
                    original: '',
                    recovered: 'Recovered Component Name',
                }),
            );

            consoleSpy.mockRestore();
        });

        it('should handle component names with actual control characters', () => {
            const baseElement: any = {};
            const nameWithNull = `Component${String.fromCharCode(0)}WithNull`;
            const element = `component "${nameWithNull}" [0.5, 0.7]`;
            const config = {keyword: 'component'};

            setName(baseElement, element, config);

            // Control characters should be removed during sanitization
            expect(baseElement.name).toBe('ComponentWithNull');
        });

        it('should handle extremely long component names', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            const baseElement: any = {};
            const longName = 'A'.repeat(600);
            const element = `component "${longName}" [0.5, 0.7]`;
            const config = {keyword: 'component'};

            setName(baseElement, element, config);

            // Should recover from extremely long name
            expect(baseElement.name).toBe('Recovered Component Name');
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('setNameWithMaturity with validation', () => {
        it('should process valid evolution syntax normally', () => {
            const baseElement: any = {};
            const element = 'evolve Simple Component 0.8';

            setNameWithMaturity(baseElement, element);

            expect(baseElement.name).toBe('Simple Component');
            expect(baseElement.maturity).toBe(0.8);
        });

        it('should process multi-line component names in evolution', () => {
            const baseElement: any = {};
            const element = 'evolve "Multi-line\\nComponent" 0.8';

            setNameWithMaturity(baseElement, element);

            expect(baseElement.name).toBe('Multi-line\nComponent');
            expect(baseElement.maturity).toBe(0.8);
        });

        it('should sanitize problematic names in evolution', () => {
            const baseElement: any = {};
            const element = 'evolve "  Component  " 0.8';

            setNameWithMaturity(baseElement, element);

            expect(baseElement.name).toBe('Component');
            expect(baseElement.maturity).toBe(0.8);
        });

        it('should recover from malformed evolution names', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            const baseElement: any = {};
            // This should create an empty name after processing
            const element = 'evolve ';

            setNameWithMaturity(baseElement, element);

            // Should recover to a default name
            expect(baseElement.name).toBe('Recovered Component Name');
            expect(baseElement.maturity).toBe(0.85); // default maturity
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Evolution component name recovery'), expect.anything());

            consoleSpy.mockRestore();
        });

        it('should handle evolution with override and validation', () => {
            const baseElement: any = {};
            const element = 'evolve "Multi-line\\nComponent" -> Override Component 0.8';

            setNameWithMaturity(baseElement, element);

            expect(baseElement.name).toBe('Multi-line\nComponent');
            expect(baseElement.override).toBe('Override Component');
            expect(baseElement.maturity).toBe(0.8);
        });
    });

    describe('Error recovery behavior', () => {
        it('should maintain parsing functionality even with validation errors', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            // Test various malformed inputs to ensure parsing doesn't break
            const testCases = [
                {element: 'component [0.5, 0.7]', expectedName: 'Recovered Component Name'},
                {element: 'component "" [0.5, 0.7]', expectedName: 'Recovered Component Name'},
                {element: 'component "   " [0.5, 0.7]', expectedName: 'Recovered Component Name'},
                {element: 'component Valid Component [0.5, 0.7]', expectedName: 'Valid Component'},
            ];

            testCases.forEach(({element, expectedName}) => {
                const baseElement: any = {};
                const config = {keyword: 'component'};

                setName(baseElement, element, config);

                expect(baseElement.name).toBe(expectedName);
                expect(baseElement.name).toBeTruthy(); // Ensure we always have a valid name
            });

            consoleSpy.mockRestore();
        });

        it('should provide helpful recovery messages', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

            const baseElement: any = {};
            const element = 'component [0.5, 0.7]'; // Empty name
            const config = {keyword: 'component'};

            setName(baseElement, element, config);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Component name recovery'),
                expect.objectContaining({
                    original: '',
                    recovered: 'Recovered Component Name',
                }),
            );

            consoleSpy.mockRestore();
        });
    });

    describe('Backward compatibility', () => {
        it('should maintain compatibility with existing single-line components', () => {
            const testCases = [
                'component Simple Component [0.5, 0.7]',
                'component Another-Component [0.2, 0.8]',
                'component Component_With_Underscores [0.1, 0.9]',
                'component Component123 [0.3, 0.4]',
            ];

            testCases.forEach(element => {
                const baseElement: any = {};
                const config = {keyword: 'component'};

                setName(baseElement, element, config);

                const expectedName = element.split(' [')[0].replace('component ', '');
                expect(baseElement.name).toBe(expectedName);
            });
        });

        it('should maintain compatibility with existing evolution syntax', () => {
            const testCases = [
                {element: 'evolve Simple Component 0.8', expectedName: 'Simple Component', expectedMaturity: 0.8},
                {element: 'evolve Another Component -> Override 0.6', expectedName: 'Another Component', expectedMaturity: 0.6},
                {element: 'evolve Component Only', expectedName: 'Component Only', expectedMaturity: 0.85},
            ];

            testCases.forEach(({element, expectedName, expectedMaturity}) => {
                const baseElement: any = {};

                setNameWithMaturity(baseElement, element);

                expect(baseElement.name).toBe(expectedName);
                expect(baseElement.maturity).toBe(expectedMaturity);
            });
        });
    });
});
