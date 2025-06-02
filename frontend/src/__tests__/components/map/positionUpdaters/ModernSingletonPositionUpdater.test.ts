import ModernSingletonPositionUpdater from '../../../../components/map/positionUpdaters/ModernSingletonPositionUpdater';

describe('ModernSingletonPositionUpdater', () => {
    let mapText: string;
    let mutator: jest.Mock;
    let updater: ModernSingletonPositionUpdater;
    let successorUpdater: any;

    beforeEach(() => {
        mapText = 'component Foo [0.1, 0.2]\ncomponent Bar [0.3, 0.4]';
        mutator = jest.fn();
        updater = new ModernSingletonPositionUpdater(
            'evolution',
            mapText,
            mutator,
        );
        successorUpdater = {
            update: jest.fn(),
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('creates a new evolution entry when one does not exist', () => {
        updater.update({ param1: 0.5, param2: 0.6 }, 'unused');

        expect(mutator).toHaveBeenCalledWith(
            'component Foo [0.1, 0.2]\ncomponent Bar [0.3, 0.4]\nevolution [0.5, 0.6]',
        );
    });

    test('delegates to successor when evolution entry already exists', () => {
        mapText =
            'component Foo [0.1, 0.2]\nevolution Genesis -> Custom\ncomponent Bar [0.3, 0.4]';
        updater = new ModernSingletonPositionUpdater(
            'evolution',
            mapText,
            mutator,
        );
        updater.setSuccessor(successorUpdater);

        updater.update({ param1: 0.5, param2: 0.6 }, 'unused');

        expect(successorUpdater.update).toHaveBeenCalledWith(
            { param1: 0.5, param2: 0.6 },
            'unused',
        );
        expect(mutator).not.toHaveBeenCalled();
    });

    test('correctly sets successor', () => {
        updater.setSuccessor(successorUpdater);

        // Implementation detail: We're testing that setSuccessor works by checking
        // that update calls the successor when appropriate
        mapText =
            'component Foo [0.1, 0.2]\nevolution Genesis -> Custom\ncomponent Bar [0.3, 0.4]';
        updater = new ModernSingletonPositionUpdater(
            'evolution',
            mapText,
            mutator,
        );
        updater.setSuccessor(successorUpdater);

        updater.update({ param1: 0.7, param2: 0.8 }, 'unused');

        expect(successorUpdater.update).toHaveBeenCalledWith(
            { param1: 0.7, param2: 0.8 },
            'unused',
        );
    });
});
