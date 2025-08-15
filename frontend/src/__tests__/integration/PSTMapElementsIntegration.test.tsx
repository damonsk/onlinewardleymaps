/**
 * Integration test for PST elements in the map processing system
 */

import React from 'react';
import {render} from '@testing-library/react';
import {MapElements} from '../../processing/MapElements';
import {UnifiedWardleyMap, createEmptyMap} from '../../types/unified/map';
import UnifiedMapContent from '../../components/map/UnifiedMapContent';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';

// Mock the required dependencies
jest.mock('../../components/map/PSTBox', () => {
    return function MockPSTBox({pstElement}: any) {
        return <g data-testid={`mock-pst-box-${pstElement.id}`}>{pstElement.name || pstElement.type}</g>;
    };
});

jest.mock('../../components/map/Attitude', () => {
    return function MockAttitude() {
        return <g data-testid="mock-attitude" />;
    };
});

jest.mock('../../components/map/MapPipelines', () => {
    return function MockMapPipelines() {
        return <g data-testid="mock-pipelines" />;
    };
});

jest.mock('../../components/map/MethodElement', () => {
    return function MockMethodElement() {
        return <g data-testid="mock-method" />;
    };
});

jest.mock('../../components/map/MapComponent', () => {
    return function MockMapComponent() {
        return <g data-testid="mock-component" />;
    };
});

jest.mock('../../components/map/EvolvingComponentLink', () => {
    return function MockEvolvingComponentLink() {
        return <g data-testid="mock-evolving-link" />;
    };
});

jest.mock('../../components/map/FluidLink', () => {
    return function MockFluidLink() {
        return <g data-testid="mock-fluid-link" />;
    };
});

jest.mock('../../components/symbols/AcceleratorSymbol', () => {
    return function MockAcceleratorSymbol() {
        return <g data-testid="mock-accelerator" />;
    };
});

jest.mock('../../components/map/Note', () => {
    return function MockNote() {
        return <g data-testid="mock-note" />;
    };
});

jest.mock('../../components/map/AnnotationElement', () => {
    return function MockAnnotationElement() {
        return <g data-testid="mock-annotation" />;
    };
});

describe('PST MapElements Integration', () => {
    let mockMap: UnifiedWardleyMap;
    let mockMapDimensions: MapDimensions;
    let mockMapStyleDefs: MapTheme;
    let mockMapElements: MapElements;

    beforeEach(() => {
        mockMap = createEmptyMap();
        mockMap.attitudes = [
            {
                id: 1,
                line: 5,
                attitude: 'pioneers',
                maturity: 0.1,
                visibility: 0.9,
                maturity2: 0.3,
                visibility2: 0.7,
                name: 'Test Pioneers',
            },
            {
                id: 2,
                line: 8,
                attitude: 'settlers',
                maturity: 0.4,
                visibility: 0.8,
                maturity2: 0.6,
                visibility2: 0.6,
                name: 'Test Settlers',
            },
            {
                id: 3,
                line: 12,
                attitude: 'other_attitude', // Non-PST attitude
                maturity: 0.5,
                visibility: 0.5,
                maturity2: 0.7,
                visibility2: 0.3,
            },
        ];

        mockMapDimensions = {
            width: 800,
            height: 600,
        };

        mockMapStyleDefs = {
            attitudes: {},
        } as MapTheme;

        mockMapElements = new MapElements(mockMap);
    });

    it('should render PST elements from MapElements instead of directly from attitudes', () => {
        const mockProps = {
            mapAttitudes: mockMap.attitudes,
            mapDimensions: mockMapDimensions,
            mapStyleDefs: mockMapStyleDefs,
            mapText: 'test map text',
            mutateMapText: jest.fn(),
            scaleFactor: 1,
            mapElementsClicked: [],
            links: [],
            mapElements: mockMapElements,
            setHighlightLine: jest.fn(),
            clicked: jest.fn(),
            enableNewPipelines: false,
            evolutionOffsets: {
                commodity: 0,
                product: 0,
                custom: 0,
                genesis: 0,
            },
            mapAccelerators: [],
            mapNotes: [],
            mapAnnotations: [],
            mapMethods: [],
            mapUrls: [],
        };

        const {container} = render(
            <svg>
                <UnifiedMapContent {...mockProps} />
            </svg>,
        );

        // Should render PST elements (only pioneers and settlers, not other_attitude)
        const pstElements = container.querySelectorAll('[data-testid^="mock-pst-box-"]');
        expect(pstElements).toHaveLength(2);

        // Check that the correct PST elements are rendered
        expect(container.querySelector('[data-testid="mock-pst-box-pst-pioneers-5"]')).toBeInTheDocument();
        expect(container.querySelector('[data-testid="mock-pst-box-pst-settlers-8"]')).toBeInTheDocument();

        // Should not render the non-PST attitude as a PST element
        expect(container.querySelector('[data-testid="mock-pst-box-pst-other_attitude-12"]')).not.toBeInTheDocument();
    });

    it('should include PST components in the unified component system', () => {
        const allComponents = mockMapElements.getAllComponents();
        const pstComponents = allComponents.filter(comp => comp.type === 'pst');

        expect(pstComponents).toHaveLength(2);

        // Check pioneers component
        const pioneersComponent = pstComponents.find(comp => comp.pstType === 'pioneers');
        expect(pioneersComponent).toBeDefined();
        expect(pioneersComponent?.name).toBe('Test Pioneers');
        expect(pioneersComponent?.id).toBe('pst-pioneers-5');

        // Check settlers component
        const settlersComponent = pstComponents.find(comp => comp.pstType === 'settlers');
        expect(settlersComponent).toBeDefined();
        expect(settlersComponent?.name).toBe('Test Settlers');
        expect(settlersComponent?.id).toBe('pst-settlers-8');
    });

    it('should handle empty attitudes array', () => {
        const emptyMap = createEmptyMap();
        emptyMap.attitudes = [];
        const emptyMapElements = new MapElements(emptyMap);

        const mockProps = {
            mapAttitudes: [],
            mapDimensions: mockMapDimensions,
            mapStyleDefs: mockMapStyleDefs,
            mapText: 'test map text',
            mutateMapText: jest.fn(),
            scaleFactor: 1,
            mapElementsClicked: [],
            links: [],
            mapElements: emptyMapElements,
            setHighlightLine: jest.fn(),
            clicked: jest.fn(),
            enableNewPipelines: false,
            evolutionOffsets: {
                commodity: 0,
                product: 0,
                custom: 0,
                genesis: 0,
            },
            mapAccelerators: [],
            mapNotes: [],
            mapAnnotations: [],
            mapMethods: [],
            mapUrls: [],
        };

        const {container} = render(
            <svg>
                <UnifiedMapContent {...mockProps} />
            </svg>,
        );

        // Should not render any PST elements
        const pstElements = container.querySelectorAll('[data-testid^="mock-pst-box-"]');
        expect(pstElements).toHaveLength(0);
    });

    it('should maintain compatibility with existing map elements', () => {
        // Add some regular components to the map
        mockMap.components = [
            {
                id: 'comp1',
                name: 'Test Component',
                type: 'component',
                maturity: 0.5,
                visibility: 0.5,
                line: 10,
                label: {x: 0, y: 0},
                evolving: false,
                evolved: false,
                inertia: false,
                pseudoComponent: false,
                offsetY: 0,
                increaseLabelSpacing: 0,
                decorators: {
                    ecosystem: false,
                    market: false,
                    buy: false,
                    build: false,
                    outsource: false,
                },
            },
        ];

        const mapElementsWithComponents = new MapElements(mockMap);
        const allComponents = mapElementsWithComponents.getAllComponents();

        // Should have both regular components and PST components
        expect(allComponents).toHaveLength(3); // 1 regular component + 2 PST components

        const regularComponents = allComponents.filter(comp => comp.type === 'component');
        const pstComponents = allComponents.filter(comp => comp.type === 'pst');

        expect(regularComponents).toHaveLength(1);
        expect(pstComponents).toHaveLength(2);
    });
});
