// Test file to validate Phase 1 unified types work correctly
// This ensures our new type system functions as expected

import {
    createEmptyMap,
    createFlowLink,
    createUnifiedComponent,
    EvolvedElementData,
    getAllMapElements,
    groupComponentsByType,
    isAnchor,
    isComponent,
    PipelineData,
    UnifiedWardleyMap,
} from '../types/unified';

// Test file to validate Phase 1 unified types work correctly
// This ensures our new type system functions as expected

// Test sample map text that we'll use for validation
const testMapText = `
title Test Map for Phase 1 Validation

component Customer [0.95, 0.8]
component Frontend [0.7, 0.6] 
component API [0.5, 0.4]
component Database [0.3, 0.2]

anchor Infrastructure [0.1, 0.1]
submap UserManagement [0.6, 0.7]
market CloudServices [0.2, 0.5]
ecosystem Analytics [0.8, 0.3]

Customer->Frontend
Frontend->API
API->Database

evolve API 0.7

pipeline Development [0.6]
  component API
  component Database
`;

/**
 * Test unified component creation and type guards
 */
export function testUnifiedComponents(): boolean {
    console.log('🧪 Testing Unified Components...');

    try {
        // Test component creation with defaults
        const component1 = createUnifiedComponent({
            id: 'test_component_1',
            name: 'Test Component',
            type: 'component',
        });

        // Verify defaults are applied
        if (component1.maturity !== 0 || component1.visibility !== 0) {
            throw new Error('Default values not applied correctly');
        }

        if (
            !component1.label ||
            component1.label.x !== 0 ||
            component1.label.y !== 0
        ) {
            throw new Error('Default label not applied correctly');
        }

        // Test component creation with custom values
        const component2 = createUnifiedComponent({
            id: 'test_component_2',
            name: 'Custom Component',
            type: 'component',
            maturity: 0.5,
            visibility: 0.7,
            evolved: true,
            inertia: true,
        });

        // Verify custom values
        if (component2.maturity !== 0.5 || component2.visibility !== 0.7) {
            throw new Error('Custom values not applied correctly');
        }

        // Test type guards
        if (!isComponent(component1)) {
            throw new Error('isComponent type guard failed');
        }

        // Test anchor creation
        const anchor = createUnifiedComponent({
            id: 'test_anchor_1',
            name: 'Test Anchor',
            type: 'anchor',
        });

        if (!isAnchor(anchor)) {
            throw new Error('isAnchor type guard failed');
        }

        if (isComponent(anchor)) {
            throw new Error(
                'Type guard incorrectly identified anchor as component',
            );
        }

        console.log('✅ Unified Components test passed');
        return true;
    } catch (error) {
        console.error('❌ Unified Components test failed:', error);
        return false;
    }
}

/**
 * Test unified map structure
 */
export function testUnifiedMap(): boolean {
    console.log('🧪 Testing Unified Map Structure...');

    try {
        // Create empty map
        const emptyMap = createEmptyMap();

        // Verify structure
        if (
            !Array.isArray(emptyMap.components) ||
            !Array.isArray(emptyMap.anchors) ||
            !Array.isArray(emptyMap.links) ||
            !Array.isArray(emptyMap.evolved)
        ) {
            throw new Error('Empty map structure is incorrect');
        }

        // Create populated map
        const testMap: UnifiedWardleyMap = {
            ...emptyMap,
            title: 'Test Map',
            components: [
                createUnifiedComponent({
                    id: 'comp_1',
                    name: 'Component 1',
                    type: 'component',
                    maturity: 0.5,
                    visibility: 0.7,
                }),
                createUnifiedComponent({
                    id: 'comp_2',
                    name: 'Component 2',
                    type: 'component',
                    maturity: 0.3,
                    visibility: 0.4,
                }),
            ],
            anchors: [
                createUnifiedComponent({
                    id: 'anchor_1',
                    name: 'Anchor 1',
                    type: 'anchor',
                    maturity: 0.1,
                    visibility: 0.2,
                }),
            ],
        };

        // Test grouping functions
        const grouped = groupComponentsByType(testMap);
        if (grouped.components.length !== 2 || grouped.anchors.length !== 1) {
            throw new Error('Component grouping failed');
        }

        // Test getAllMapElements
        const allElements = getAllMapElements(testMap);
        if (allElements.length !== 3) {
            throw new Error('getAllMapElements returned incorrect count');
        }

        console.log('✅ Unified Map Structure test passed');
        return true;
    } catch (error) {
        console.error('❌ Unified Map Structure test failed:', error);
        return false;
    }
}

/**
 * Test unified links
 */
export function testUnifiedLinks(): boolean {
    console.log('🧪 Testing Unified Links...');

    try {
        // Test basic link creation
        const basicLink = createFlowLink({
            start: 'Component A',
            end: 'Component B',
        });

        if (
            basicLink.start !== 'Component A' ||
            basicLink.end !== 'Component B'
        ) {
            throw new Error('Basic link creation failed');
        }

        // Verify defaults
        if (
            basicLink.flow !== false ||
            basicLink.future !== false ||
            basicLink.past !== false
        ) {
            throw new Error('Link defaults not applied correctly');
        }

        // Test link with custom properties
        const flowLink = createFlowLink({
            start: 'Component A',
            end: 'Component B',
            flow: true,
            flowValue: '$1M',
            context: 'Business value',
        });

        if (
            !flowLink.flow ||
            flowLink.flowValue !== '$1M' ||
            flowLink.context !== 'Business value'
        ) {
            throw new Error('Custom link properties not applied correctly');
        }

        console.log('✅ Unified Links test passed');
        return true;
    } catch (error) {
        console.error('❌ Unified Links test failed:', error);
        return false;
    }
}

/**
 * Test evolved elements and pipelines
 */
export function testEvolvedAndPipelines(): boolean {
    console.log('🧪 Testing Evolved Elements and Pipelines...');

    try {
        // Test evolved element
        const evolvedElement: EvolvedElementData = {
            name: 'API',
            maturity: 0.7,
            label: { x: 10, y: 20 },
        };

        if (evolvedElement.name !== 'API' || evolvedElement.maturity !== 0.7) {
            throw new Error('Evolved element creation failed');
        }

        // Test pipeline
        const pipeline: PipelineData = {
            name: 'Development',
            visibility: 0.6,
            components: [
                { name: 'API', maturity: 0.5, visibility: 0.6 },
                { name: 'Database', maturity: 0.3, visibility: 0.6 },
            ],
            inertia: false,
            hidden: false,
        };

        if (pipeline.components.length !== 2) {
            throw new Error('Pipeline components not created correctly');
        }

        console.log('✅ Evolved Elements and Pipelines test passed');
        return true;
    } catch (error) {
        console.error('❌ Evolved Elements and Pipelines test failed:', error);
        return false;
    }
}

/**
 * Run all tests
 */
export function runAllUnifiedTypeTests(): boolean {
    console.log('🚀 Running Phase 1 Unified Type Tests...\n');

    const results = [
        testUnifiedComponents(),
        testUnifiedMap(),
        testUnifiedLinks(),
        testEvolvedAndPipelines(),
    ];

    const passed = results.filter((r) => r).length;
    const total = results.length;

    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);

    if (passed === total) {
        console.log('🎉 All Phase 1 unified type tests passed!');
        console.log('✅ Type consolidation is working correctly');
        return true;
    } else {
        console.log('⚠️  Some tests failed - review implementation');
        return false;
    }
}

// Export test map text for use in other tests
export { testMapText };

// If running directly, execute tests
if (require.main === module) {
    runAllUnifiedTypeTests();
}
