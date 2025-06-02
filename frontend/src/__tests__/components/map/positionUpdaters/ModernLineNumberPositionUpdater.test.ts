import ModernLineNumberPositionUpdater from '../../../../components/map/positionUpdaters/ModernLineNumberPositionUpdater';
import { Replacer } from '../../../../types/base';

describe('ModernLineNumberPositionUpdater', () => {
    let mapText: string;
    let mutator: jest.Mock;
    let replacers: Replacer[];
    let updater: ModernLineNumberPositionUpdater;

    const mockMatcher1: Replacer = {
        matcher: jest.fn().mockImplementation((line, identifier, type) => {
            return line.includes(`${type} ${identifier}`);
        }),
        action: jest.fn().mockImplementation((line, moved) => {
            return `${line.split('[')[0]}[${moved.param1}, ${moved.param2}]`;
        }),
    };

    const mockMatcher2: Replacer = {
        matcher: jest.fn().mockImplementation(() => false),
        action: jest.fn(),
    };

    beforeEach(() => {
        mapText =
            'title My Map\ncomponent Foo [0.1, 0.2]\ncomponent Bar [0.3, 0.4]';
        mutator = jest.fn();
        replacers = [mockMatcher1, mockMatcher2];
        updater = new ModernLineNumberPositionUpdater(
            'component',
            mapText,
            mutator,
            replacers,
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('updates position at specific line when matcher finds a match', () => {
        const moved = { param1: 0.5, param2: 0.6 };
        // Update line 2 (component Foo)
        updater.update(moved, 'Foo', 2);

        expect(mockMatcher1.matcher).toHaveBeenCalledWith(
            'component Foo [0.1, 0.2]',
            'Foo',
            'component',
        );
        expect(mockMatcher1.action).toHaveBeenCalledWith(
            'component Foo [0.1, 0.2]',
            moved,
        );
        expect(mutator).toHaveBeenCalledWith(
            'title My Map\ncomponent Foo [0.5, 0.6]\ncomponent Bar [0.3, 0.4]',
        );
    });

    test('checks all replacers until it finds a match', () => {
        const moved = { param1: 0.7, param2: 0.8 };
        // Update line 3 (component Bar)
        updater.update(moved, 'Bar', 3);

        expect(mockMatcher1.matcher).toHaveBeenCalledWith(
            'component Bar [0.3, 0.4]',
            'Bar',
            'component',
        );
        expect(mockMatcher1.action).toHaveBeenCalledWith(
            'component Bar [0.3, 0.4]',
            moved,
        );
        expect(mockMatcher2.matcher).not.toHaveBeenCalled(); // First matcher succeeded, so second shouldn't be called

        expect(mutator).toHaveBeenCalledWith(
            'title My Map\ncomponent Foo [0.1, 0.2]\ncomponent Bar [0.7, 0.8]',
        );
    });

    test('does nothing if no matcher matches', () => {
        // Override mockMatcher1 to always return false for this test
        mockMatcher1.matcher.mockImplementation(() => false);

        const moved = { param1: 0.9, param2: 1.0 };
        updater.update(moved, 'Baz', 2);

        expect(mockMatcher1.matcher).toHaveBeenCalledWith(
            'component Foo [0.1, 0.2]',
            'Baz',
            'component',
        );
        expect(mockMatcher2.matcher).toHaveBeenCalledWith(
            'component Foo [0.1, 0.2]',
            'Baz',
            'component',
        );
        expect(mockMatcher1.action).not.toHaveBeenCalled();
        expect(mockMatcher2.action).not.toHaveBeenCalled();

        // Mutator should still be called with the original text
        expect(mutator).toHaveBeenCalledWith(
            'title My Map\ncomponent Foo [0.1, 0.2]\ncomponent Bar [0.3, 0.4]',
        );
    });

    test('handles line number that is out of bounds', () => {
        const moved = { param1: 0.9, param2: 1.0 };
        updater.update(moved, 'OutOfBounds', 10);

        // Line 10 doesn't exist, so nothing should happen
        expect(mockMatcher1.matcher).not.toHaveBeenCalled();
        expect(mockMatcher2.matcher).not.toHaveBeenCalled();

        // Mutator should still be called with undefined replacing that line
        expect(mutator).toHaveBeenCalledWith(
            'title My Map\ncomponent Foo [0.1, 0.2]\ncomponent Bar [0.3, 0.4]\n\n\n\n\n\n\nundefined',
        );
    });
});
