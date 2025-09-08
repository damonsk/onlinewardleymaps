import {renameAnchor} from '../../constants/renameAnchor';

describe('renameAnchor', () => {
    let mutateMapTextSpy: jest.Mock;

    beforeEach(() => {
        mutateMapTextSpy = jest.fn();
    });

    describe('input validation', () => {
        it('should reject invalid map text', () => {
            const result = renameAnchor(1, 'oldName', 'newName', '', mutateMapTextSpy);
            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid map text');
            expect(mutateMapTextSpy).not.toHaveBeenCalled();
        });

        it('should reject empty new name', () => {
            const mapText = 'anchor TestAnchor [0.5, 0.7]';
            const result = renameAnchor(1, 'TestAnchor', '', mapText, mutateMapTextSpy);
            expect(result.success).toBe(false);
            expect(result.error).toContain('cannot be empty');
            expect(mutateMapTextSpy).not.toHaveBeenCalled();
        });

        it('should reject names with forbidden characters', () => {
            const mapText = 'anchor TestAnchor [0.5, 0.7]';
            const forbiddenChars = ['[', ']', '-', '>', ';'];

            forbiddenChars.forEach(char => {
                const result = renameAnchor(1, 'TestAnchor', `new${char}name`, mapText, mutateMapTextSpy);
                expect(result.success).toBe(false);
                expect(result.error).toContain('cannot contain');
            });
        });

        it('should succeed when new name equals old name', () => {
            const mapText = 'anchor TestAnchor [0.5, 0.7]';
            const result = renameAnchor(1, 'TestAnchor', 'TestAnchor', mapText, mutateMapTextSpy);
            expect(result.success).toBe(true);
            expect(mutateMapTextSpy).not.toHaveBeenCalled();
        });
    });

    describe('basic anchor renaming', () => {
        it('should rename a simple anchor', () => {
            const mapText = 'anchor TestAnchor [0.5, 0.7]';
            const result = renameAnchor(1, 'TestAnchor', 'NewAnchor', mapText, mutateMapTextSpy);

            expect(result.success).toBe(true);
            expect(mutateMapTextSpy).toHaveBeenCalledWith('anchor NewAnchor [0.5, 0.7]');
        });

        it('should rename an anchor with label', () => {
            const mapText = 'anchor TestAnchor [0.5, 0.7] label [10, 20]';
            const result = renameAnchor(1, 'TestAnchor', 'NewAnchor', mapText, mutateMapTextSpy);

            expect(result.success).toBe(true);
            expect(mutateMapTextSpy).toHaveBeenCalledWith('anchor NewAnchor [0.5, 0.7] label [10, 20]');
        });

        it('should handle anchor names with spaces', () => {
            const mapText = 'anchor "Test Anchor" [0.5, 0.7]';
            const result = renameAnchor(1, 'Test Anchor', 'New Anchor', mapText, mutateMapTextSpy);

            expect(result.success).toBe(true);
            expect(mutateMapTextSpy).toHaveBeenCalledWith('anchor "New Anchor" [0.5, 0.7]');
        });
    });

    describe('reference updates', () => {
        it('should update anchor references in links', () => {
            const mapText = ['anchor TestAnchor [0.5, 0.7]', 'component ComponentA [0.3, 0.8]', 'ComponentA->TestAnchor'].join('\n');

            const result = renameAnchor(1, 'TestAnchor', 'NewAnchor', mapText, mutateMapTextSpy);

            expect(result.success).toBe(true);
            const expectedText = ['anchor NewAnchor [0.5, 0.7]', 'component ComponentA [0.3, 0.8]', 'ComponentA->NewAnchor'].join('\n');
            expect(mutateMapTextSpy).toHaveBeenCalledWith(expectedText);
        });

        it('should update quoted anchor references', () => {
            const mapText = ['anchor "Test Anchor" [0.5, 0.7]', 'component ComponentA [0.3, 0.8]', 'ComponentA->"Test Anchor"'].join('\n');

            const result = renameAnchor(1, 'Test Anchor', 'New Anchor', mapText, mutateMapTextSpy);

            expect(result.success).toBe(true);
            const expectedText = ['anchor "New Anchor" [0.5, 0.7]', 'component ComponentA [0.3, 0.8]', 'ComponentA->"New Anchor"'].join(
                '\n',
            );
            expect(mutateMapTextSpy).toHaveBeenCalledWith(expectedText);
        });

        it('should not update partial matches', () => {
            const mapText = ['anchor Test [0.5, 0.7]', 'anchor TestLonger [0.3, 0.8]', 'ComponentA->Test'].join('\n');

            const result = renameAnchor(1, 'Test', 'NewTest', mapText, mutateMapTextSpy);

            expect(result.success).toBe(true);
            const expectedText = ['anchor NewTest [0.5, 0.7]', 'anchor TestLonger [0.3, 0.8]', 'ComponentA->NewTest'].join('\n');
            expect(mutateMapTextSpy).toHaveBeenCalledWith(expectedText);
        });
    });

    describe('conflict detection', () => {
        it('should detect conflicts with existing components', () => {
            const mapText = ['anchor TestAnchor [0.5, 0.7]', 'component ExistingComponent [0.3, 0.8]'].join('\n');

            const result = renameAnchor(1, 'TestAnchor', 'ExistingComponent', mapText, mutateMapTextSpy);

            expect(result.success).toBe(false);
            expect(result.error).toContain('component named "ExistingComponent" already exists');
        });

        it('should detect conflicts with existing anchors', () => {
            const mapText = ['anchor TestAnchor [0.5, 0.7]', 'anchor ExistingAnchor [0.3, 0.8]'].join('\n');

            const result = renameAnchor(1, 'TestAnchor', 'ExistingAnchor', mapText, mutateMapTextSpy);

            expect(result.success).toBe(false);
            expect(result.error).toContain('anchor named "ExistingAnchor" already exists');
        });
    });

    describe('error handling', () => {
        it('should handle exceptions gracefully', () => {
            const invalidMapText = null as any;
            const result = renameAnchor(1, 'TestAnchor', 'NewAnchor', invalidMapText, mutateMapTextSpy);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid map text');
        });

        it('should handle regex special characters in names', () => {
            const mapText = ['anchor Test.Anchor [0.5, 0.7]', 'ComponentA->Test.Anchor'].join('\n');

            const result = renameAnchor(1, 'Test.Anchor', 'New.Anchor', mapText, mutateMapTextSpy);

            expect(result.success).toBe(true);
            const expectedText = ['anchor New.Anchor [0.5, 0.7]', 'ComponentA->New.Anchor'].join('\n');
            expect(mutateMapTextSpy).toHaveBeenCalledWith(expectedText);
        });
    });
});
