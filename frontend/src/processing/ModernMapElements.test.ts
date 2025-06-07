// Integration test for ModernMapElements
// Part of Phase 4C: Component Interface Modernization

import { ModernMapElements } from '../processing/ModernMapElements';
import {
    UnifiedComponent,
    createUnifiedComponent,
} from '../types/unified/components';
import { PipelineData } from '../types/unified/components';

// Create a mock of UnifiedWardleyMap with only the properties needed for testing
interface TestMap {
    components: UnifiedComponent[];
    anchors: UnifiedComponent[];
    submaps: UnifiedComponent[];
    markets: UnifiedComponent[];
    ecosystems: UnifiedComponent[];
    evolved: any[];
    pipelines: PipelineData[];
}

/**
 * Creates a test Wardley Map with various components
 *
 * @returns A simplified map for testing ModernMapElements
 */
function createTestMap(): TestMap {
    // Create basic components
    const components: UnifiedComponent[] = [
        createUnifiedComponent({
            id: '1',
            name: 'Component1',
            type: 'component',
            maturity: 0.45,
            visibility: 0.65,
            line: 5,
        }),
        createUnifiedComponent({
            id: '2',
            name: 'Component2',
            type: 'component',
            maturity: 0.75,
            visibility: 0.25,
            line: 6,
        }),
        createUnifiedComponent({
            id: '3',
            name: 'Component3',
            type: 'component',
            maturity: 0.15,
            visibility: 0.85,
            line: 7,
            inertia: true,
        }),
    ];

    // Create an anchor
    const anchors: UnifiedComponent[] = [
        createUnifiedComponent({
            id: '4',
            name: 'User',
            type: 'anchor',
            maturity: 0.95,
            visibility: 0.05,
            line: 8,
        }),
    ];

    // Create a submap
    const submaps: UnifiedComponent[] = [
        createUnifiedComponent({
            id: '5',
            name: 'Submap1',
            type: 'submap',
            maturity: 0.55,
            visibility: 0.45,
            line: 9,
        }),
    ];

    // Create evolved data
    const evolved = [
        {
            name: 'Component1',
            maturity: 0.65, // Evolved to the right
            line: 15,
            override: 'Product', // Custom label for evolved component
        },
    ];

    // Create pipelines
    const pipelines: PipelineData[] = [
        {
            id: 'pipeline1',
            name: 'Component2',
            visibility: 0.5,
            components: [
                { id: 'p1', name: 'Phase1', maturity: 0.3, visibility: 0.5 },
                { id: 'p2', name: 'Phase2', maturity: 0.5, visibility: 0.5 },
                { id: 'p3', name: 'Phase3', maturity: 0.7, visibility: 0.5 },
            ],
            line: 20,
        },
    ];

    // Return simplified map with only fields needed for ModernMapElements
    return {
        components,
        anchors,
        submaps,
        markets: [],
        ecosystems: [],
        evolved,
        pipelines,
    };
}

describe('ModernMapElements Integration Tests', () => {
    let mapElements: ModernMapElements;

    beforeEach(() => {
        const testMap = createTestMap();
        mapElements = new ModernMapElements(testMap as any);
    });

    describe('Basic Component Access', () => {
        test('getAllComponents returns all map components', () => {
            const allComponents = mapElements.getAllComponents();
            expect(allComponents.length).toBe(5); // 3 components + 1 anchor + 1 submap
        });

        test('getComponentsByType returns components of specified type', () => {
            const components = mapElements.getComponentsByType('component');
            expect(components.length).toBe(3);

            const anchors = mapElements.getComponentsByType('anchor');
            expect(anchors.length).toBe(1);

            const submaps = mapElements.getComponentsByType('submap');
            expect(submaps.length).toBe(1);
        });

        test('getInertiaComponents returns components with inertia', () => {
            const inertiaComponents = mapElements.getInertiaComponents();
            expect(inertiaComponents.length).toBe(1);
            expect(inertiaComponents[0].name).toBe('Component3');
        });
    });

    describe('Evolution Handling', () => {
        test('getEvolvingComponents returns components that are evolving', () => {
            const evolvingComponents = mapElements.getEvolvingComponents();
            expect(evolvingComponents.length).toBe(1);
            expect(evolvingComponents[0].name).toBe('Component1');
        });

        test('getEvolvedComponents returns evolved versions of components', () => {
            const evolvedComponents = mapElements.getEvolvedComponents();
            expect(evolvedComponents.length).toBe(1);
            expect(evolvedComponents[0].name).toBe('Component1');
            expect(evolvedComponents[0].maturity).toBe(0.65);
            expect(evolvedComponents[0].override).toBe('Product');
        });

        test('getNeitherEvolvedNorEvolvingComponents returns components not involved in evolution', () => {
            const normalComponents =
                mapElements.getNeitherEvolvedNorEvolvingComponents();
            expect(normalComponents.length).toBe(4); // Component2, Component3, User, Submap1
        });

        test('getMergedComponents returns all components for rendering', () => {
            const mergedComponents = mapElements.getMergedComponents();
            expect(mergedComponents.length).toBe(6); // 5 original + 1 evolved

            // Verify we have both the original and evolved versions of Component1
            const component1Instances = mergedComponents.filter(
                (c) => c.name === 'Component1',
            );
            expect(component1Instances.length).toBe(2);

            // One should be evolving and one should be evolved
            expect(component1Instances.some((c) => c.evolving)).toBe(true);
            expect(component1Instances.some((c) => c.evolved)).toBe(true);
        });
    });

    describe('Pipeline Handling', () => {
        test('getPipelineComponents returns pipeline components', () => {
            const pipelineComponents = mapElements.getPipelineComponents();
            expect(pipelineComponents.length).toBe(1);
            expect(pipelineComponents[0].name).toBe('Component2');
            expect(pipelineComponents[0].components.length).toBe(3);
        });
    });

    describe('Legacy Adapter', () => {
        test('getLegacyAdapter provides compatible adapter for legacy code', () => {
            const adapter = mapElements.getLegacyAdapter();

            // Test that adapter methods match original functionality
            expect(adapter.getAllComponents().length).toBe(
                mapElements.getAllComponents().length,
            );
            expect(adapter.getEvolvingComponents().length).toBe(
                mapElements.getEvolvingComponents().length,
            );

            // Test legacy method names
            expect(adapter.getEvolveElements().length).toBe(
                mapElements.getEvolvingComponents().length,
            );
            expect(adapter.getMergedElements().length).toBe(
                mapElements.getMergedComponents().length,
            );
        });
    });
});
