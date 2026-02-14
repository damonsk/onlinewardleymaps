import {UnifiedComponent} from '../../types/unified/components';
import {findNearestComponent, linkExists, addLinkToMapText} from '../../utils/componentDetection';

describe('Linking Workflow Test', () => {
    const mockComponent1: UnifiedComponent = {
        id: 'comp1',
        name: 'Component A',
        type: 'component',
        maturity: 0.3,
        visibility: 0.7,
        line: 1,
        label: {x: 0, y: 0},
        evolved: false,
        inertia: false,
        increaseLabelSpacing: 0,
        pseudoComponent: false,
        offsetY: 0,
        evolving: false,
        decorators: {
            buy: false,
            build: false,
            outsource: false,
            ecosystem: false,
            market: false,
        },
    };

    const mockComponent2: UnifiedComponent = {
        id: 'comp2',
        name: 'Component B',
        type: 'component',
        maturity: 0.7,
        visibility: 0.4,
        line: 2,
        label: {x: 0, y: 0},
        evolved: false,
        inertia: false,
        increaseLabelSpacing: 0,
        pseudoComponent: false,
        offsetY: 0,
        evolving: false,
        decorators: {
            buy: false,
            build: false,
            outsource: false,
            ecosystem: false,
            market: false,
        },
    };

    it('should detect components with magnetic linking', () => {
        const components = [mockComponent1, mockComponent2];

        // Test clicking near Component A
        const nearComponent1 = findNearestComponent({x: 0.32, y: 0.68}, components, 0.1);
        expect(nearComponent1).toBe(mockComponent1);

        // Test clicking near Component B
        const nearComponent2 = findNearestComponent({x: 0.72, y: 0.38}, components, 0.1);
        expect(nearComponent2).toBe(mockComponent2);

        // Test clicking far from any component
        const farClick = findNearestComponent({x: 0.1, y: 0.1}, components, 0.1);
        expect(farClick).toBeNull();
    });

    it('should prevent duplicate links', () => {
        const existingLinks = [{start: 'Component A', end: 'Component B'}];

        // Test forward direction
        expect(linkExists(mockComponent1, mockComponent2, existingLinks)).toBe(true);

        // Test reverse direction
        expect(linkExists(mockComponent2, mockComponent1, existingLinks)).toBe(true);

        // Test non-existing link
        const mockComponent3: UnifiedComponent = {...mockComponent1, id: 'comp3', name: 'Component C'};
        expect(linkExists(mockComponent1, mockComponent3, existingLinks)).toBe(false);
    });

    it('should generate correct link syntax and add to map text', () => {
        const mapText = 'title Test Map\ncomponent Component A [0.7, 0.3]\ncomponent Component B [0.4, 0.7]';

        const updatedMapText = addLinkToMapText(mapText, mockComponent1, mockComponent2);

        expect(updatedMapText).toContain('Component A->Component B');
        expect(updatedMapText.split('\n')).toHaveLength(4); // Original 3 lines + 1 link

        // Link should be after the last component
        const lines = updatedMapText.split('\n');
        const linkLine = lines.find(line => line.includes('Component A->Component B'));
        expect(linkLine).toBe('Component A->Component B');
    });

    it('should handle edge cases in component detection', () => {
        const components = [mockComponent1];

        // Test with empty components array
        expect(findNearestComponent({x: 0.5, y: 0.5}, [], 0.1)).toBeNull();

        // Test with exact position match
        expect(findNearestComponent({x: 0.3, y: 0.7}, components, 0.1)).toBe(mockComponent1);

        // Test with very small threshold
        expect(findNearestComponent({x: 0.35, y: 0.75}, components, 0.01)).toBeNull();
        expect(findNearestComponent({x: 0.35, y: 0.75}, components, 0.1)).toBe(mockComponent1);
    });
});
