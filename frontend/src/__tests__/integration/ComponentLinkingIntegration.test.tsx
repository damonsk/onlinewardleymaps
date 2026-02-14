import {UnifiedComponent} from '../../types/unified/components';
import {findNearestComponent, linkExists, addLinkToMapText, generateLinkSyntax} from '../../utils/componentDetection';

describe('Component Linking Integration', () => {
    const mockComponent1: UnifiedComponent = {
        id: 'comp1',
        name: 'Component 1',
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
        name: 'Component 2',
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

    describe('findNearestComponent', () => {
        it('should find the nearest component within range', () => {
            const components = [mockComponent1, mockComponent2];
            const mousePosition = {x: 0.32, y: 0.68}; // Close to component1

            const nearest = findNearestComponent(mousePosition, components, 0.1);
            expect(nearest).toBe(mockComponent1);
        });

        it('should return null when no component is within range', () => {
            const components = [mockComponent1, mockComponent2];
            const mousePosition = {x: 0.1, y: 0.1}; // Far from both components

            const nearest = findNearestComponent(mousePosition, components, 0.05);
            expect(nearest).toBeNull();
        });

        it('should handle empty component array', () => {
            const components: UnifiedComponent[] = [];
            const mousePosition = {x: 0.5, y: 0.5};

            const nearest = findNearestComponent(mousePosition, components);
            expect(nearest).toBeNull();
        });
    });

    describe('linkExists', () => {
        it('should detect existing link in forward direction', () => {
            const existingLinks = [{start: 'Component 1', end: 'Component 2'}];

            const exists = linkExists(mockComponent1, mockComponent2, existingLinks);
            expect(exists).toBe(true);
        });

        it('should detect existing link in reverse direction', () => {
            const existingLinks = [{start: 'Component 2', end: 'Component 1'}];

            const exists = linkExists(mockComponent1, mockComponent2, existingLinks);
            expect(exists).toBe(true);
        });

        it('should return false when link does not exist', () => {
            const existingLinks = [{start: 'Other Component', end: 'Another Component'}];

            const exists = linkExists(mockComponent1, mockComponent2, existingLinks);
            expect(exists).toBe(false);
        });
    });

    describe('generateLinkSyntax', () => {
        it('should generate correct link syntax', () => {
            const syntax = generateLinkSyntax(mockComponent1, mockComponent2);
            expect(syntax).toBe('Component 1->Component 2');
        });
    });

    describe('addLinkToMapText', () => {
        it('should add link to map text after component definitions', () => {
            const mapText = 'title Test Map\ncomponent Component 1 [0.7, 0.3]\ncomponent Component 2 [0.4, 0.7]';

            const updatedMapText = addLinkToMapText(mapText, mockComponent1, mockComponent2);
            expect(updatedMapText).toContain('Component 1->Component 2');

            // Link should be added after the last component
            const lines = updatedMapText.split('\n');
            const linkLineIndex = lines.findIndex(line => line.includes('Component 1->Component 2'));
            const lastComponentIndex = lines.findIndex(line => line.includes('component Component 2'));

            expect(linkLineIndex).toBeGreaterThan(lastComponentIndex);
        });

        it('should handle empty map text', () => {
            const mapText = '';

            const updatedMapText = addLinkToMapText(mapText, mockComponent1, mockComponent2);
            expect(updatedMapText.trim()).toBe('Component 1->Component 2');
        });

        it('should handle map text without components', () => {
            const mapText = 'title Test Map\nnote Some note [0.5, 0.5]';

            const updatedMapText = addLinkToMapText(mapText, mockComponent1, mockComponent2);
            expect(updatedMapText).toContain('Component 1->Component 2');

            // Link should be added at the end
            const lines = updatedMapText.split('\n');
            expect(lines[lines.length - 1]).toBe('Component 1->Component 2');
        });
    });
});
