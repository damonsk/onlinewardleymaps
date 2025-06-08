// MapElements.test.ts
import '@testing-library/jest-dom';
import {MapElements} from '../processing/MapElements';
import {UnifiedWardleyMap, createEvolvedElement, createPipeline, createUnifiedComponent} from '../types/unified';

describe('MapElements', () => {
    let testMap: UnifiedWardleyMap;

    beforeEach(() => {
        // Create a test map with some components
        testMap = {
            title: 'Test Map',
            components: [
                createUnifiedComponent({
                    id: 'comp_a',
                    name: 'Component A',
                    type: 'component',
                    maturity: 0.5,
                    visibility: 0.5,
                    line: 1,
                }),
                createUnifiedComponent({
                    id: 'comp_b',
                    name: 'Component B',
                    type: 'component',
                    maturity: 0.6,
                    visibility: 0.7,
                    line: 2,
                }),
                createUnifiedComponent({
                    id: 'comp_c',
                    name: 'Component C',
                    type: 'component',
                    maturity: 0.7,
                    visibility: 0.3,
                    line: 3,
                    inertia: true,
                }),
            ],
            anchors: [
                createUnifiedComponent({
                    id: 'anchor_a',
                    name: 'Anchor A',
                    type: 'anchor',
                    maturity: 0.1,
                    visibility: 0.9,
                    line: 4,
                }),
            ],
            submaps: [],
            markets: [],
            ecosystems: [],
            evolved: [
                createEvolvedElement({
                    name: 'Component A',
                    maturity: 0.8,
                    line: 5,
                }),
            ],
            pipelines: [
                createPipeline({
                    id: 'pipeline_b',
                    name: 'Component B',
                    visibility: 0.7,
                    line: 6,
                    components: [],
                }),
            ],
            links: [],
            annotations: [],
            notes: [],
            methods: [],
            attitudes: [],
            accelerators: [],
            evolution: [],
            urls: [],
            errors: [],
            presentation: {
                style: '',
                annotations: {visibility: 0, maturity: 0},
                size: {width: 0, height: 0},
            },
        };
    });

    test('should initialize correctly', () => {
        const mapElements = new MapElements(testMap);
        expect(mapElements).toBeDefined();
    });

    test('should return all components', () => {
        const mapElements = new MapElements(testMap);
        const allComponents = mapElements.getAllComponents();
        expect(allComponents.length).toBe(4); // 3 components + 1 anchor
    });

    test('should filter components by type', () => {
        const mapElements = new MapElements(testMap);
        const components = mapElements.getComponentsByType('component');
        expect(components.length).toBe(3);
        expect(components[0].name).toBe('Component A');
        expect(components[1].name).toBe('Component B');
        expect(components[2].name).toBe('Component C');

        const anchors = mapElements.getComponentsByType('anchor');
        expect(anchors.length).toBe(1);
        expect(anchors[0].name).toBe('Anchor A');
    });

    test('should mark evolving components', () => {
        const mapElements = new MapElements(testMap);
        const evolvingComponents = mapElements.getEvolvingComponents();
        expect(evolvingComponents.length).toBe(1);
        expect(evolvingComponents[0].name).toBe('Component A');
        expect(evolvingComponents[0].evolving).toBe(true);
        expect(evolvingComponents[0].evolveMaturity).toBe(0.8);
    });

    test('should create evolved components', () => {
        const mapElements = new MapElements(testMap);
        const evolvedComponents = mapElements.getEvolvedComponents();
        expect(evolvedComponents.length).toBe(1);
        expect(evolvedComponents[0].name).toBe('Component A');
        expect(evolvedComponents[0].evolved).toBe(true);
        expect(evolvedComponents[0].maturity).toBe(0.8);
        expect(evolvedComponents[0].id).toBe('comp_a_evolved');
    });

    test('should mark pipeline components', () => {
        const mapElements = new MapElements(testMap);
        const components = mapElements.getComponentsByType('component');
        const pipelineComponent = components.find(c => c.name === 'Component B');
        expect(pipelineComponent).toBeDefined();
        expect(pipelineComponent?.pipeline).toBe(true);
    });

    test('should return merged components', () => {
        const mapElements = new MapElements(testMap);
        const mergedComponents = mapElements.getMergedComponents();
        expect(mergedComponents.length).toBe(5); // 3 original components + 1 anchor + 1 evolved

        // Verify the evolved component is included
        const evolvedComponent = mergedComponents.find(c => c.id === 'comp_a_evolved');
        expect(evolvedComponent).toBeDefined();
        expect(evolvedComponent?.evolved).toBe(true);
    });

    test('should return static components', () => {
        const mapElements = new MapElements(testMap);
        const staticComponents = mapElements.getStaticComponents();
        expect(staticComponents.length).toBe(4); // all components except evolved ones

        // Check no components are marked as evolved
        expect(staticComponents.every(c => !c.evolved)).toBe(true);
    });

    test('should return inertia components', () => {
        const mapElements = new MapElements(testMap);
        const inertiaComponents = mapElements.getInertiaComponents();
        expect(inertiaComponents.length).toBe(1);
        expect(inertiaComponents[0].name).toBe('Component C');
        expect(inertiaComponents[0].inertia).toBe(true);
    });

    test('should return components that are neither evolved nor evolving', () => {
        const mapElements = new MapElements(testMap);
        const components = mapElements.getNeitherEvolvedNorEvolvingComponents();
        expect(components.length).toBe(3); // Component B, C, and Anchor A
        expect(components.some(c => c.name === 'Component A')).toBe(false);
    });

    test('should return non-evolving components', () => {
        const mapElements = new MapElements(testMap);
        const components = mapElements.getNonEvolvingComponents();
        expect(components.length).toBe(3); // Component B, C, and Anchor A
        expect(components.some(c => c.name === 'Component A')).toBe(false);
    });

    test('should return non-evolved components', () => {
        const mapElements = new MapElements(testMap);
        const components = mapElements.getNonEvolvedComponents();
        expect(components.length).toBe(4); // All original components (no evolved components)

        // Check if any returned component has the evolved flag set to true
        expect(components.some(c => c.evolved === true)).toBe(false);
    });

    test('should return components that are either evolved or evolving', () => {
        const mapElements = new MapElements(testMap);
        const components = mapElements.getEitherEvolvedOrEvolvingComponents();
        expect(components.length).toBe(1); // Only Component A is evolving
        expect(components[0].name).toBe('Component A');
    });

    test('should return pipeline components', () => {
        const mapElements = new MapElements(testMap);
        const pipelines = mapElements.getPipelineComponents();
        expect(pipelines.length).toBe(1);
        expect(pipelines[0].name).toBe('Component B');
    });

    test('should handle empty evolved elements', () => {
        // Create a test map with no evolved elements
        const emptyEvolvedMap = {
            ...testMap,
            evolved: [],
        };

        const mapElements = new MapElements(emptyEvolvedMap);
        const evolvedComponents = mapElements.getEvolvedComponents();
        expect(evolvedComponents.length).toBe(0);
    });

    test('should handle empty pipelines', () => {
        // Create a test map with no pipelines
        const emptyPipelinesMap = {
            ...testMap,
            pipelines: [],
        };

        const mapElements = new MapElements(emptyPipelinesMap);
        const components = mapElements.getComponentsByType('component');

        // No component should be marked as a pipeline
        expect(components.every(c => !c.pipeline)).toBe(true);
    });

    test('should correctly handle method components', () => {
        // Add a component with method decorator
        const methodMap = {
            ...testMap,
            components: [
                ...testMap.components,
                createUnifiedComponent({
                    id: 'method_comp',
                    name: 'Method Component',
                    type: 'component',
                    maturity: 0.4,
                    visibility: 0.6,
                    line: 7,
                    decorators: {
                        method: 'build',
                        ecosystem: false,
                        market: false,
                    },
                }),
            ],
        };

        const mapElements = new MapElements(methodMap);
        const allComponents = mapElements.getAllComponents();

        // Find the method component
        const methodComponent = allComponents.find(c => c.name === 'Method Component');
        expect(methodComponent).toBeDefined();
        expect(methodComponent?.decorators?.method).toBe('build');

        // Check label spacing is set for method components
        expect(methodComponent?.increaseLabelSpacing).toBeGreaterThan(0);
    });

    test('should provide a getLegacyAdapter for backward compatibility', () => {
        const mapElements = new MapElements(testMap);
        const adapter = mapElements.getLegacyAdapter();

        // Check that adapter has legacy method names
        expect(adapter.getEvolveElements).toBeDefined();
        expect(adapter.getEvolvedElements).toBeDefined();
        expect(adapter.getMergedElements).toBeDefined();
        expect(adapter.getMapPipelines).toBeDefined();
        expect(adapter.getNoneEvolvedOrEvolvingElements).toBeDefined();

        // Check adapter methods work correctly
        expect(adapter.getEvolveElements().length).toBe(1);
        expect(adapter.getEvolvedElements().length).toBe(1);
        expect(adapter.getMergedElements().length).toBe(5);
        expect(adapter.getMapPipelines().length).toBe(1);
        expect(adapter.getNoneEvolvedOrEvolvingElements().length).toBe(3);

        // Check legacy conversion methods
        const component = testMap.components[0];
        expect(adapter.convertToMapElement(component)).toBe(component);
        expect(adapter.convertToMapElements([component])).toEqual([component]);
    });
});
