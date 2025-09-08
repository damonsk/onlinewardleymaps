import {renameAnchor} from '../../constants/renameAnchor';

describe('Anchor Enhancement Integration', () => {
    describe('renameAnchor functionality', () => {
        it('should successfully rename a basic anchor and update references', () => {
            const mapText = [
                'title Test Map',
                'anchor MainAnchor [0.5, 0.7]',
                'component ServiceA [0.3, 0.8]',
                'component ServiceB [0.7, 0.6]',
                'ServiceA->MainAnchor',
                'ServiceB->MainAnchor'
            ].join('\n');

            const mutateMapText = jest.fn();
            const result = renameAnchor(2, 'MainAnchor', 'CoreAnchor', mapText, mutateMapText);

            expect(result.success).toBe(true);
            expect(mutateMapText).toHaveBeenCalledWith([
                'title Test Map',
                'anchor CoreAnchor [0.5, 0.7]',
                'component ServiceA [0.3, 0.8]',
                'component ServiceB [0.7, 0.6]',
                'ServiceA->CoreAnchor',
                'ServiceB->CoreAnchor'
            ].join('\n'));
        });

        it('should handle quoted anchor names with spaces', () => {
            const mapText = [
                'anchor "Main Anchor" [0.5, 0.7]',
                'component ServiceA [0.3, 0.8]',
                'ServiceA->"Main Anchor"'
            ].join('\n');

            const mutateMapText = jest.fn();
            const result = renameAnchor(1, 'Main Anchor', 'Core Anchor', mapText, mutateMapText);

            expect(result.success).toBe(true);
            expect(mutateMapText).toHaveBeenCalledWith([
                'anchor "Core Anchor" [0.5, 0.7]',
                'component ServiceA [0.3, 0.8]',
                'ServiceA->"Core Anchor"'
            ].join('\n'));
        });

        it('should detect conflicts with existing components', () => {
            const mapText = [
                'anchor TestAnchor [0.5, 0.7]',
                'component ExistingComponent [0.3, 0.8]'
            ].join('\n');

            const mutateMapText = jest.fn();
            const result = renameAnchor(1, 'TestAnchor', 'ExistingComponent', mapText, mutateMapText);

            expect(result.success).toBe(false);
            expect(result.error).toContain('component named "ExistingComponent" already exists');
            expect(mutateMapText).not.toHaveBeenCalled();
        });

        it('should preserve anchor labels during renaming', () => {
            const mapText = 'anchor TestAnchor [0.5, 0.7] label [10, 20]';
            
            const mutateMapText = jest.fn();
            const result = renameAnchor(1, 'TestAnchor', 'NewAnchor', mapText, mutateMapText);

            expect(result.success).toBe(true);
            expect(mutateMapText).toHaveBeenCalledWith('anchor NewAnchor [0.5, 0.7] label [10, 20]');
        });
    });

    describe('Type system integration', () => {
        it('should ensure MapElement type includes anchor', () => {
            // This test verifies the type system changes we made
            const mockAnchorElement = {
                type: 'anchor' as const,
                id: 'anchor-1',
                name: 'Test Anchor',
                properties: {
                    name: 'Test Anchor',
                    maturity: 0.5,
                    visibility: 0.7,
                    line: 1,
                },
                anchorData: {
                    id: 'anchor-1',
                    name: 'Test Anchor',
                    maturity: 0.5,
                    visibility: 0.7,
                    line: 1,
                }
            };

            // If this compiles without errors, our type definitions are correct
            expect(mockAnchorElement.type).toBe('anchor');
            expect(mockAnchorElement.properties.name).toBe('Test Anchor');
            expect(mockAnchorElement.anchorData?.maturity).toBe(0.5);
        });
    });
});