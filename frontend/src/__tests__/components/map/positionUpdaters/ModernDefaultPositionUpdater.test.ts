import ModernDefaultPositionUpdater from '../../../../components/map/positionUpdaters/ModernDefaultPositionUpdater';
import { PositionUpdater, Replacer } from '../../../../types/base';

describe('ModernDefaultPositionUpdater', () => {
    let mapText: string;
    let mutator: jest.Mock;
    let replacers: Replacer[];
    let updater: ModernDefaultPositionUpdater;

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
        mapText = 'component Foo [0.1, 0.2]\ncomponent Bar [0.3, 0.4]';
        mutator = jest.fn();
        replacers = [mockMatcher1, mockMatcher2];
        updater = new ModernDefaultPositionUpdater(
            'component',
            mapText,
            mutator,
            replacers,
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('updates position when matcher finds a match', () => {
        const moved = { param1: 0.5, param2: 0.6 };
        updater.update(moved, 'Foo');

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
            'component Foo [0.5, 0.6]\ncomponent Bar [0.3, 0.4]',
        );
    });

    test('checks all replacers until it finds a match', () => {
        const moved = { param1: 0.7, param2: 0.8 };
        updater.update(moved, 'NonExistent');

        expect(mockMatcher1.matcher).toHaveBeenCalledTimes(2); // Once for each line
        expect(mockMatcher2.matcher).toHaveBeenCalledTimes(2); // Once for each line

        // Mutator should still be called with the original text since no replacements were made
        expect(mutator).toHaveBeenCalledWith(mapText);
    });

    test('throws error when trying to set successor', () => {
        const mockSuccessor: PositionUpdater = {
            update: jest.fn(),
            setSuccessor: jest.fn(),
        };

        expect(() => updater.setSuccessor(mockSuccessor)).toThrow(
            'Method not implemented.',
        );
    });
});
