// Test file to validate Phase 1 unified types work correctly
// This ensures our new type system functions as expected

import {
    createEmptyMap,
    createUnifiedComponent,
    isAnchor,
    isComponent,
} from '../types/unified';

describe('Phase 1 Unified Types', () => {
    test('createEmptyMap should create valid map structure', () => {
        const map = createEmptyMap();
        expect(map.title).toBe('');
        expect(map.components).toEqual([]);
        expect(map.anchors).toEqual([]);
        expect(map.submaps).toEqual([]);
        expect(map.markets).toEqual([]);
        expect(map.ecosystems).toEqual([]);
        expect(map.evolved).toEqual([]);
        expect(map.pipelines).toEqual([]);
        expect(map.links).toEqual([]);
        expect(map.annotations).toEqual([]);
        expect(map.notes).toEqual([]);
        expect(map.methods).toEqual([]);
        expect(map.attitudes).toEqual([]);
        expect(map.accelerators).toEqual([]);
        expect(map.urls).toEqual([]);
        expect(map.errors).toEqual([]);
    });

    test('createUnifiedComponent should create valid component', () => {
        const component = createUnifiedComponent({
            id: 'test-1',
            name: 'Test Component',
            type: 'component',
            maturity: 0.5,
            visibility: 0.7,
            label: { x: 0, y: 0 },
        });

        expect(component.id).toBe('test-1');
        expect(component.name).toBe('Test Component');
        expect(component.type).toBe('component');
        expect(component.maturity).toBe(0.5);
        expect(component.visibility).toBe(0.7);
        expect(component.evolved).toBe(false);
        expect(component.evolving).toBe(false);
        expect(component.inertia).toBe(false);
        expect(component.pseudoComponent).toBe(false);
        expect(component.offsetY).toBe(0);
        expect(component.increaseLabelSpacing).toBe(0);
        expect(component.pipeline).toBe(false);
    });

    test('type guards should work correctly', () => {
        const component = createUnifiedComponent({
            id: 'test-1',
            name: 'Test Component',
            type: 'component',
            maturity: 0.5,
            visibility: 0.7,
            label: { x: 0, y: 0 },
        });

        const anchor = createUnifiedComponent({
            id: 'test-2',
            name: 'Test Anchor',
            type: 'anchor',
            maturity: 0.5,
            visibility: 0.7,
            label: { x: 0, y: 0 },
        });

        expect(isComponent(component)).toBe(true);
        expect(isAnchor(component)).toBe(false);
        expect(isComponent(anchor)).toBe(false);
        expect(isAnchor(anchor)).toBe(true);
    });
});
