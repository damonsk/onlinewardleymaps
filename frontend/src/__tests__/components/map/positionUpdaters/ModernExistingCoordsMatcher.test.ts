import { ModernExistingCoordsMatcher } from '../../../../components/map/positionUpdaters/ModernExistingCoordsMatcher';

describe('ModernExistingCoordsMatcher', () => {
    describe('matcher', () => {
        test('returns true when line contains the component', () => {
            const line = 'component Name [0.1, 0.2]';
            const identifier = 'Name';
            const type = 'component';

            expect(
                ModernExistingCoordsMatcher.matcher(line, identifier, type),
            ).toBe(true);
        });

        test('returns true when line contains the component with spaces', () => {
            const line = 'component My Component [0.1, 0.2]';
            const identifier = 'My Component';
            const type = 'component';

            expect(
                ModernExistingCoordsMatcher.matcher(line, identifier, type),
            ).toBe(true);
        });

        test('returns false when line does not contain the component', () => {
            const line = 'component OtherName [0.1, 0.2]';
            const identifier = 'Name';
            const type = 'component';

            expect(
                ModernExistingCoordsMatcher.matcher(line, identifier, type),
            ).toBe(false);
        });

        test('returns false when line does not contain the correct type', () => {
            const line = 'note Name [0.1, 0.2]';
            const identifier = 'Name';
            const type = 'component';

            expect(
                ModernExistingCoordsMatcher.matcher(line, identifier, type),
            ).toBe(false);
        });
    });

    describe('action', () => {
        test('replaces coordinates with numeric parameters', () => {
            const line = 'component Name [0.1, 0.2]';
            const moved = { param1: 0.3, param2: 0.4 };

            const result = ModernExistingCoordsMatcher.action(line, moved);

            expect(result).toBe('component Name [0.3, 0.4]');
        });

        test('replaces coordinates with string parameters', () => {
            const line = 'component Name [0.1, 0.2]';
            const moved = { param1: '0.3', param2: '0.4' };

            const result = ModernExistingCoordsMatcher.action(line, moved);

            expect(result).toBe('component Name [0.3, 0.4]');
        });

        test('handles multiple coordinate pairs', () => {
            const line = 'component Name [0.1, 0.2][0.3, 0.4]';
            const moved = { param1: '0.5', param2: '0.6' };

            const result = ModernExistingCoordsMatcher.action(line, moved);

            // Note: This shows current behavior which replaces all coordinate pairs
            // If this is not desired, the replacement regex would need to be modified
            expect(result).toBe('component Name [0.5, 0.6][0.5, 0.6]');
        });
    });
});
