import {UnifiedComponent} from '../../types/unified/components';
import {findNearestComponent, linkExists, addLinkToMapText} from '../../utils/componentDetection';

describe('Linking Cancellation Integration', () => {
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

    it('should handle component deletion during linking process', () => {
        const components = [mockComponent1, mockComponent2];

        // Test that findNearestComponent handles deleted components gracefully
        const nearestBeforeDeletion = findNearestComponent({x: 0.32, y: 0.68}, components, 0.1);
        expect(nearestBeforeDeletion).toBe(mockComponent1);

        // Simulate component deletion by removing it from the array
        const componentsAfterDeletion = [mockComponent2];
        const nearestAfterDeletion = findNearestComponent({x: 0.32, y: 0.68}, componentsAfterDeletion, 0.1);

        // Should not find the deleted component
        expect(nearestAfterDeletion).toBeNull();

        // Should still find other components
        const nearestComponent2 = findNearestComponent({x: 0.72, y: 0.38}, componentsAfterDeletion, 0.1);
        expect(nearestComponent2).toBe(mockComponent2);
    });

    it('should detect duplicate links correctly', () => {
        const existingLinks = [
            {start: 'Component A', end: 'Component B'},
            {start: 'Component B', end: 'Component C'},
        ];

        // Test forward direction duplicate detection
        expect(linkExists(mockComponent1, mockComponent2, existingLinks)).toBe(true);

        // Test reverse direction duplicate detection
        expect(linkExists(mockComponent2, mockComponent1, existingLinks)).toBe(true);

        // Test non-existing link
        const mockComponent3: UnifiedComponent = {...mockComponent1, id: 'comp3', name: 'Component C'};
        expect(linkExists(mockComponent1, mockComponent3, existingLinks)).toBe(false);

        // Test with empty links array
        expect(linkExists(mockComponent1, mockComponent2, [])).toBe(false);
    });

    it('should handle map text updates correctly when adding links', () => {
        const mapText = 'title Test Map\ncomponent Component A [0.7, 0.3]\ncomponent Component B [0.4, 0.7]';

        const updatedMapText = addLinkToMapText(mapText, mockComponent1, mockComponent2);

        expect(updatedMapText).toContain('Component A->Component B');
        expect(updatedMapText.split('\n')).toHaveLength(4); // Original 3 lines + 1 link

        // Link should be after the last component
        const lines = updatedMapText.split('\n');
        const linkLine = lines.find(line => line.includes('Component A->Component B'));
        expect(linkLine).toBe('Component A->Component B');
    });

    it('should handle edge cases in component validation', () => {
        // Create a component with edge case properties
        const edgeCaseComponent: UnifiedComponent = {
            ...mockComponent1,
            id: '',
            name: '',
            maturity: NaN,
            visibility: NaN,
        };

        const components = [edgeCaseComponent, mockComponent2];

        // Test that findNearestComponent handles NaN coordinates gracefully
        const nearestComponent = findNearestComponent({x: 0.72, y: 0.38}, components, 0.1);

        // Should skip the component with NaN coordinates and find the valid one
        expect(nearestComponent).toBe(mockComponent2);

        // Test with invalid mouse position
        const nearestWithInvalidMouse = findNearestComponent({x: NaN, y: NaN}, [mockComponent2], 0.1);
        expect(nearestWithInvalidMouse).toBeNull();
    });

    it('should handle rapid component changes in detection', () => {
        let currentComponents = [mockComponent1, mockComponent2];

        // Simulate rapid component additions and deletions
        for (let i = 0; i < 5; i++) {
            const newComponent: UnifiedComponent = {
                ...mockComponent1,
                id: `comp${i + 3}`,
                name: `Component ${String.fromCharCode(67 + i)}`,
                maturity: 0.1 + i * 0.1,
                visibility: 0.5 + i * 0.05,
            };

            // Add component
            currentComponents = [...currentComponents, newComponent];

            // Test that detection works with the new component
            const nearestAfterAdd = findNearestComponent({x: newComponent.maturity, y: newComponent.visibility}, currentComponents, 0.1);
            expect(nearestAfterAdd).toBe(newComponent);

            // Remove the component immediately
            currentComponents = currentComponents.slice(0, -1);

            // Test that detection no longer finds the removed component
            const nearestAfterRemove = findNearestComponent({x: newComponent.maturity, y: newComponent.visibility}, currentComponents, 0.1);
            expect(nearestAfterRemove).not.toBe(newComponent);
        }

        // Original components should still be detectable
        expect(currentComponents).toContain(mockComponent1);
        expect(currentComponents).toContain(mockComponent2);
    });
});
