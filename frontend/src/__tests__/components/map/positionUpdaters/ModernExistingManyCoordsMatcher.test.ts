import {ModernExistingManyCoordsMatcher} from '../../../../components/map/positionUpdaters/ModernExistingManyCoordsMatcher';

describe('ModernExistingManyCoordsMatcher', () => {
    describe('matcher', () => {
        test('returns true when line contains the component', () => {
            const line = 'annotation Box [0.1, 0.2, 0.3, 0.4]';
            const identifier = 'Box';
            const type = 'annotation';

            expect(ModernExistingManyCoordsMatcher.matcher(line, identifier, type)).toBe(true);
        });

        test('returns true when line contains the component with spaces', () => {
            const line = 'annotation My Box [0.1, 0.2, 0.3, 0.4]';
            const identifier = 'My Box';
            const type = 'annotation';

            expect(ModernExistingManyCoordsMatcher.matcher(line, identifier, type)).toBe(true);
        });

        test('returns false when line does not contain the component', () => {
            const line = 'annotation OtherBox [0.1, 0.2, 0.3, 0.4]';
            const identifier = 'Box';
            const type = 'annotation';

            expect(ModernExistingManyCoordsMatcher.matcher(line, identifier, type)).toBe(false);
        });

        test('returns false when line does not contain the correct type', () => {
            const line = 'component Box [0.1, 0.2]';
            const identifier = 'Box';
            const type = 'annotation';

            expect(ModernExistingManyCoordsMatcher.matcher(line, identifier, type)).toBe(false);
        });
    });

    describe('action', () => {
        test('replaces coordinates with new parameters', () => {
            const line = 'annotation Box [0.1, 0.2, 0.3, 0.4]';
            const moved = {
                param1: 0.5,
                param2: 0.6,
                param3: 0.7,
                param4: 0.8,
            };

            const result = ModernExistingManyCoordsMatcher.action(line, moved);

            expect(result).toBe('annotation Box [0.5, 0.6, 0.7, 0.8]');
        });

        test('handles string parameters', () => {
            const line = 'annotation Box [0.1, 0.2, 0.3, 0.4]';
            const moved = {
                param1: '0.5',
                param2: '0.6',
                param3: '0.7',
                param4: '0.8',
            };

            const result = ModernExistingManyCoordsMatcher.action(line, moved);

            expect(result).toBe('annotation Box [0.5, 0.6, 0.7, 0.8]');
        });

        test('handles multiple coordinate groups', () => {
            const line = 'annotation Box [0.1, 0.2, 0.3, 0.4][0.5, 0.6, 0.7, 0.8]';
            const moved = {
                param1: '0.9',
                param2: '1.0',
                param3: '1.1',
                param4: '1.2',
            };

            const result = ModernExistingManyCoordsMatcher.action(line, moved);

            // Note: This shows current behavior which replaces all coordinate groups
            expect(result).toBe('annotation Box [0.9, 1.0, 1.1, 1.2][0.9, 1.0, 1.1, 1.2]');
        });
    });
});
