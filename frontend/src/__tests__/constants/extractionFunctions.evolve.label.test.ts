import {setNameWithMaturity} from '../../constants/extractionFunctions';

describe('extractionFunctions - Evolve with Label', () => {
    describe('setEvolutionElement with label positioning', () => {
        it('should parse evolve syntax with quoted names and label correctly', () => {
            const baseElement: any = {
                name: '',
                override: '',
                maturity: 0,
                line: 1,
            };

            const element = 'evolve "New Component"->"New Component Evolved" 0.66 label [-16.00, 77.00]';

            setNameWithMaturity(baseElement, element);

            expect(baseElement.name).toBe('New Component'); // Source component name for matching
            expect(baseElement.override).toBe('New Component Evolved'); // Evolved component name for display
            expect(baseElement.maturity).toBe(0.66); // Should correctly parse maturity despite label
        });

        it('should parse evolve syntax with quoted multi-line names and label', () => {
            const baseElement: any = {
                name: '',
                override: '',
                maturity: 0,
                line: 1,
            };

            const element = 'evolve "Source\\nComponent"->"Evolved\\nComponent" 0.55 label [-19.00, 46.00]';

            setNameWithMaturity(baseElement, element);

            expect(baseElement.name).toBe('Source\nComponent'); // Source component name for matching
            expect(baseElement.override).toBe('Evolved\nComponent'); // Evolved component name for display
            expect(baseElement.maturity).toBe(0.55); // Should correctly parse maturity despite label
        });

        it('should parse evolve syntax without label correctly (regression test)', () => {
            const baseElement: any = {
                name: '',
                override: '',
                maturity: 0,
                line: 1,
            };

            const element = 'evolve "New Component"->"New Component Evolved" 0.78';

            setNameWithMaturity(baseElement, element);

            expect(baseElement.name).toBe('New Component');
            expect(baseElement.override).toBe('New Component Evolved');
            expect(baseElement.maturity).toBe(0.78);
        });

        it('should parse evolve syntax with no space before maturity and label', () => {
            const baseElement: any = {
                name: '',
                override: '',
                maturity: 0,
                line: 1,
            };

            const element = 'evolve "New Component"->"New Component Evolved"0.55 label [-19.00, 46.00]';

            setNameWithMaturity(baseElement, element);

            expect(baseElement.name).toBe('New Component');
            expect(baseElement.override).toBe('New Component Evolved');
            expect(baseElement.maturity).toBe(0.55); // Should correctly parse maturity despite no space
        });

        it('should parse evolve syntax with maturity at end of line (no label)', () => {
            const baseElement: any = {
                name: '',
                override: '',
                maturity: 0,
                line: 1,
            };

            const element = 'evolve "Component A"->"Component B" 0.75';

            setNameWithMaturity(baseElement, element);

            expect(baseElement.name).toBe('Component A');
            expect(baseElement.override).toBe('Component B');
            expect(baseElement.maturity).toBe(0.75); // Should correctly parse maturity at end of line
        });
    });
});
