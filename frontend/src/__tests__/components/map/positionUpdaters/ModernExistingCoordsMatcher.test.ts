import {ModernExistingCoordsMatcher} from '../../../../components/map/positionUpdaters/ModernExistingCoordsMatcher';

describe('ModernExistingCoordsMatcher', () => {
    describe('matcher - simple component names', () => {
        test('returns true when line contains the component', () => {
            const line = 'component Name [0.1, 0.2]';
            const identifier = 'Name';
            const type = 'component ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(true);
        });

        test('returns true when line contains the component with spaces', () => {
            const line = 'component My Component [0.1, 0.2]';
            const identifier = 'My Component';
            const type = 'component ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(true);
        });

        test('returns false when line does not contain the component', () => {
            const line = 'component OtherName [0.1, 0.2]';
            const identifier = 'Name';
            const type = 'component ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(false);
        });

        test('returns false when line does not contain the correct type', () => {
            const line = 'note Name [0.1, 0.2]';
            const identifier = 'Name';
            const type = 'component ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(false);
        });

        test('returns true when line contains component with label', () => {
            const line = 'component My Component [0.1, 0.2] label Example';
            const identifier = 'My Component';
            const type = 'component ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(true);
        });

        test('returns false when line does not have coordinates', () => {
            const line = 'component My Component';
            const identifier = 'My Component';
            const type = 'component ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(false);
        });
    });

    describe('matcher - multi-line component names', () => {
        test('returns true when line contains quoted multi-line component', () => {
            const line = 'component "Multi-line\\nComponent" [0.1, 0.2]';
            const identifier = 'Multi-line\nComponent';
            const type = 'component ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(true);
        });

        test('returns true for complex multi-line component with escaped quotes', () => {
            const line = 'component "Component with \\"quotes\\"\\nand line breaks" [0.3, 0.8]';
            const identifier = 'Component with "quotes"\nand line breaks';
            const type = 'component ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(true);
        });

        test('returns true for normalized multi-line component matching', () => {
            const line = 'component "Database\\nService" [0.5, 0.7]';
            const identifier = 'database service'; // lowercase and space-normalized
            const type = 'component ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(true);
        });

        test('returns true for multi-line component with labels', () => {
            const line = 'component "Database\\nService" [0.6, 0.4] label DB API';
            const identifier = 'Database\nService';
            const type = 'component ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(true);
        });

        test('returns false for different multi-line component names', () => {
            const line = 'component "Different\\nComponent" [0.6, 0.4]';
            const identifier = 'Multi-line\nComponent';
            const type = 'component ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(false);
        });

        test('returns false for multi-line component without coordinates', () => {
            const line = 'component "Multi-line\\nComponent"';
            const identifier = 'Multi-line\nComponent';
            const type = 'component ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(false);
        });

        test('handles complex documentation-style multi-line components', () => {
            const line = 'component "User Authentication\\nService\\n(OAuth 2.0)" [0.2, 0.9]';
            const identifier = 'User Authentication\nService\n(OAuth 2.0)';
            const type = 'component ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(true);
        });
    });

    describe('matcher - other component types', () => {
        test('returns true for note components with multi-line names', () => {
            const line = 'note "Multi-line\\nNote" [0.1, 0.9]';
            const identifier = 'Multi-line\nNote';
            const type = 'note ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(true);
        });

        test('returns true for anchor components with multi-line names', () => {
            const line = 'anchor "Multi-line\\nAnchor" [0.8, 0.2]';
            const identifier = 'Multi-line\nAnchor';
            const type = 'anchor ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(true);
        });

        test('returns false for wrong component type', () => {
            const line = 'note "Multi-line\\nNote" [0.1, 0.9]';
            const identifier = 'Multi-line\nNote';
            const type = 'component ';

            expect(ModernExistingCoordsMatcher.matcher(line, identifier, type)).toBe(false);
        });
    });

    describe('action - coordinate replacement', () => {
        test('replaces coordinates with numeric parameters for simple names', () => {
            const line = 'component Name [0.1, 0.2]';
            const moved = {param1: 0.3, param2: 0.4};

            const result = ModernExistingCoordsMatcher.action(line, moved);

            expect(result).toBe('component Name [0.3, 0.4]');
        });

        test('replaces coordinates with string parameters for simple names', () => {
            const line = 'component Name [0.1, 0.2]';
            const moved = {param1: '0.3', param2: '0.4'};

            const result = ModernExistingCoordsMatcher.action(line, moved);

            expect(result).toBe('component Name [0.3, 0.4]');
        });

        test('replaces coordinates for multi-line component names', () => {
            const line = 'component "Multi-line\\nComponent" [0.6, 0.4]';
            const moved = {param1: 0.7, param2: 0.5};

            const result = ModernExistingCoordsMatcher.action(line, moved);

            expect(result).toBe('component "Multi-line\\nComponent" [0.7, 0.5]');
        });

        test('preserves labels when replacing coordinates', () => {
            const line = 'component "Database\\nService" [0.6, 0.4] label DB API';
            const moved = {param1: 0.9, param2: 0.1};

            const result = ModernExistingCoordsMatcher.action(line, moved);

            expect(result).toBe('component "Database\\nService" [0.9, 0.1] label DB API');
        });

        test('handles complex multi-line components with escaped quotes', () => {
            const line = 'component "Component with \\"quotes\\"\\nand line breaks" [0.3, 0.8]';
            const moved = {param1: 0.4, param2: 0.9};

            const result = ModernExistingCoordsMatcher.action(line, moved);

            expect(result).toBe('component "Component with \\"quotes\\"\\nand line breaks" [0.4, 0.9]');
        });

        test('handles multiple coordinate pairs (replaces all)', () => {
            const line = 'component Name [0.1, 0.2][0.3, 0.4]';
            const moved = {param1: '0.5', param2: '0.6'};

            const result = ModernExistingCoordsMatcher.action(line, moved);

            // Note: This shows current behavior which replaces all coordinate pairs
            // If this is not desired, the replacement regex would need to be modified
            expect(result).toBe('component Name [0.5, 0.6][0.5, 0.6]');
        });

        test('handles decimal precision correctly', () => {
            const line = 'component "Multi-line\\nComponent" [0.6, 0.4]';
            const moved = {param1: 0.75, param2: 0.25};

            const result = ModernExistingCoordsMatcher.action(line, moved);

            expect(result).toBe('component "Multi-line\\nComponent" [0.75, 0.25]');
        });

        test('handles note components with multi-line names', () => {
            const line = 'note "Multi-line\\nNote" [0.1, 0.9]';
            const moved = {param1: 0.2, param2: 0.8};

            const result = ModernExistingCoordsMatcher.action(line, moved);

            expect(result).toBe('note "Multi-line\\nNote" [0.2, 0.8]');
        });
    });
});
