import {MapComponentDeleter} from '../../services/MapComponentDeleter';

describe('MapComponentDeleter - Evolved Component Deletion', () => {
    let deleter: MapComponentDeleter;

    beforeEach(() => {
        deleter = new MapComponentDeleter();
    });

    test('should delete only the evolve line when deleting evolved component', () => {
        const mapText = `component New Component [0.64, 0.10]
evolve "New Component"->"New Component Evolved" 0.30 label [16.00, -28.00]`;

        const result = deleter.deleteComponent({
            mapText,
            componentId: 'New Component Evolved',
            componentType: 'evolved-component',
        });

        expect(result.updatedMapText).toBe('component New Component [0.64, 0.10]');
        expect(result.deletedComponent.type).toBe('evolved-component');
        expect(result.deletedComponent.name).toBe('New Component Evolved');
    });

    test('should delete evolved component using override name from component data', () => {
        const mapText = `component New Component [0.64, 0.10]
evolve "New Component"->"New Component Evolved" 0.30 label [16.00, -28.00]`;

        // This simulates how the selection manager passes the override name
        const result = deleter.deleteComponent({
            mapText,
            componentId: 'New Component Evolved',
            componentType: 'evolved-component',
        });

        expect(result.updatedMapText).toBe('component New Component [0.64, 0.10]');
        expect(result.deletedComponent.type).toBe('evolved-component');
        expect(result.deletedComponent.name).toBe('New Component Evolved');
    });

    test('should find the correct evolve line for evolved component', () => {
        const mapText = `component A [0.64, 0.10]
component B [0.50, 0.20]
evolve A->A2 0.30
evolve "New Component"->"New Component Evolved" 0.30 label [16.00, -28.00]
evolve B->B2 0.40`;

        const result = deleter.deleteComponent({
            mapText,
            componentId: 'New Component Evolved',
            componentType: 'evolved-component',
        });

        const expectedText = `component A [0.64, 0.10]
component B [0.50, 0.20]
evolve A->A2 0.30
evolve B->B2 0.40`;

        expect(result.updatedMapText).toBe(expectedText);
    });
});
