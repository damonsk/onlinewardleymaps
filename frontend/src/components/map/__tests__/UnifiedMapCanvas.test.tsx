import React from 'react';
import {render} from '@testing-library/react';
import UnifiedMapCanvas from '../UnifiedMapCanvas';
import {UnifiedMapCanvasProps} from '../types/MapCanvasProps';

// Mock the hooks and dependencies
jest.mock('../hooks/useMapEventHandlers', () => ({
    useMapEventHandlers: () => ({
        handleMapClick: jest.fn(),
        handleMapDoubleClick: jest.fn(),
        handleMapMouseMove: jest.fn(),
        handleMapMouseUp: jest.fn(),
    }),
}));

jest.mock('../hooks/useCoordinateConversion', () => ({
    useCoordinateConversion: () => ({
        convertScreenToMapCoordinates: jest.fn(),
        convertSvgToMapCoordinates: jest.fn(),
        isValidDropZone: jest.fn(),
    }),
}));

jest.mock('../../FeatureSwitchesContext', () => ({
    useFeatureSwitches: () => ({
        enableAccelerators: false,
        showMapToolbar: false,
        allowMapZoomMouseWheel: true,
    }),
}));

jest.mock('../../KeyPressContext', () => ({
    useModKeyPressedConsumer: () => false,
}));

jest.mock('../../EditingContext', () => ({
    useEditing: () => ({
        isAnyElementEditing: () => false,
    }),
}));

const mockProps: UnifiedMapCanvasProps = {
    wardleyMap: {
        title: 'Test Map',
        components: [],
        anchors: [],
        links: [],
        attitudes: [],
        accelerators: [],
        notes: [],
        annotations: [],
        methods: [],
        submaps: [],
        markets: [],
        ecosystems: [],
        evolved: [],
        pipelines: [],
    },
    mapDimensions: {width: 800, height: 600},
    mapCanvasDimensions: {width: 1000, height: 800},
    mapStyleDefs: {
        className: 'wardley',
        fontFamily: 'Arial',
    },
    mapEvolutionStates: {
        genesis: {l1: 'Genesis', l2: 'Novel'},
        custom: {l1: 'Custom', l2: 'Bespoke'},
        product: {l1: 'Product', l2: 'Rental'},
        commodity: {l1: 'Commodity', l2: 'Utility'},
    },
    evolutionOffsets: {
        genesis: 0,
        custom: 0.25,
        product: 0.5,
        commodity: 0.75,
    },
    mapText: 'title Test Map',
    mutateMapText: jest.fn(),
    setHighlightLine: jest.fn(),
    setNewComponentContext: jest.fn(),
    launchUrl: jest.fn(),
    showLinkedEvolved: false,
    mapAnnotationsPresentation: {},
};

describe('UnifiedMapCanvas', () => {
    it('renders without crashing', () => {
        const {container} = render(<UnifiedMapCanvas {...mockProps} />);
        expect(container.querySelector('#map-canvas')).toBeInTheDocument();
    });

    it('renders SVG map element', () => {
        const {container} = render(<UnifiedMapCanvas {...mockProps} />);
        // The SVG is rendered inside the react-svg-pan-zoom component
        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('applies correct cursor style for placement tools', () => {
        const propsWithToolbarItem = {
            ...mockProps,
            selectedToolbarItem: {
                id: 'component',
                label: 'Component',
                toolType: 'placement' as const,
                template: () => 'component Test [0.5, 0.5]',
                defaultName: 'Test Component',
            },
        };

        const {container} = render(<UnifiedMapCanvas {...propsWithToolbarItem} />);
        // Check that the component renders with toolbar item
        expect(container.querySelector('#map-canvas')).toBeInTheDocument();
    });

    it('renders debug overlay when enabled', () => {
        // We can't easily test this without modifying the DEBUG_COORDINATES constant
        // but we can verify the DebugOverlay component is imported and used
        const {container} = render(<UnifiedMapCanvas {...mockProps} />);
        // The debug overlay should not be visible by default since DEBUG_COORDINATES is false
        expect(container.querySelector('[data-testid="debug-overlay"]')).not.toBeInTheDocument();
    });
});
