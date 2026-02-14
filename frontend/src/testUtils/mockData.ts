/**
 * Mock data utilities for testing
 */

import {MapDimensions} from '../../src/constants/defaults';
import {MapTheme} from '../../src/types/map/styles';
import {UnifiedWardleyMap} from '../../src/types/unified';

export function createMockWardleyMap(): UnifiedWardleyMap {
    return {
        title: 'Test Map',
        components: [],
        anchors: [],
        submaps: [],
        markets: [],
        ecosystems: [],
        links: [],
        evolved: [],
        pipelines: [],
        attitudes: [],
        accelerators: [],
        notes: [],
        annotations: [],
        methods: [],
        presentation: {
            style: '',
            annotations: {visibility: 0, maturity: 0},
            size: {height: 600, width: 800},
        },
        errors: [],
        evolution: [],
        urls: [],
    };
}

export function createMockMapDimensions(): MapDimensions {
    return {
        width: 800,
        height: 600,
    };
}

export function createMockMapStyleDefs(): MapTheme {
    return {
        className: 'wardley',
        fontFamily: 'Arial, sans-serif',
        component: {
            fill: '#ffffff',
            stroke: '#000000',
            strokeWidth: 1,
            fontWeight: '',
            evolvedTextColor: '',
            textColor: '',
        },
        link: {
            stroke: '#000000',
            strokeWidth: 1,
        },
        attitudes: {},
        methods: {
            buy: {},
            build: {},
            outsource: {},
        },
        annotation: {
            stroke: '',
            strokeWidth: 0,
            fill: '',
            text: '',
            boxStroke: '',
            boxStrokeWidth: 0,
            boxFill: '',
            boxTextColour: '',
        },
        note: {
            fontWeight: '',
            evolvedTextColor: '',
            textColor: '',
        },
    };
}
