/**
 * Mock data utilities for testing
 */

import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import {UnifiedWardleyMap} from '../../types/unified';

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
        },
        link: {
            stroke: '#000000',
            strokeWidth: 1,
        },
        text: {
            fill: '#000000',
            fontSize: 12,
        },
    };
}
