import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {ComponentSelectionProvider} from '../../../components/ComponentSelectionContext';
import PSTBox from '../../../components/map/PSTBox';
import MapComponent from '../../../components/map/MapComponent';
import Note from '../../../components/map/Note';
import Anchor from '../../../components/map/Anchor';
import {PSTElement} from '../../../types/map/pst';
import {UnifiedComponent} from '../../../types/unified';
import {MapNotes} from '../../../types/base';
import {MapDimensions} from '../../../constants/defaults';
import {MapTheme} from '../../../types/map/styles';

// Mock data
const mockMapDimensions: MapDimensions = {
    width: 800,
    height: 600,
};

const mockMapTheme: MapTheme = {
    component: {
        fontSize: '14px',
        fontWeight: 'normal',
        textColor: '#000',
        evolvedTextColor: '#666',
    },
    attitudes: {
        pioneers: {fill: '#ff0000', stroke: '#ff0000'},
        settlers: {fill: '#00ff00', stroke: '#00ff00'},
        townplanners: {fill: '#0000ff', stroke: '#0000ff'},
    },
    methods: {
        buy: {fill: '#ff0000', stroke: '#ff0000'},
        build: {fill: '#00ff00', stroke: '#00ff00'},
        outsource: {fill: '#0000ff', stroke: '#0000ff'},
    },
    annotation: {
        stroke: '#000',
        strokeWidth: 1,
        fill: '#fff',
        text: '#000',
        boxStroke: '#000',
        boxStrokeWidth: 1,
        boxFill: '#fff',
        boxTextColour: '#000',
    },
    note: {
        fontSize: '12px',
        fontWeight: 'normal',
        textColor: '#000',
        evolvedTextColor: '#666',
    },
};

const mockPSTElement: PSTElement = {
    id: 'test-pst-1',
    name: 'Test PST',
    type: 'pioneers',
    coordinates: {
        maturity1: 0.2,
        maturity2: 0.4,
        visibility1: 0.6,
        visibility2: 0.8,
    },
};

const mockComponent: UnifiedComponent = {
    id: 'test-component-1',
    name: 'Test Component',
    type: 'component',
    maturity: 0.5,
    visibility: 0.7,
    evolved: false,
    evolving: false,
    line: 1,
};

const mockNote: MapNotes = {
    id: 'test-note-1',
    text: 'Test Note',
    maturity: 0.3,
    visibility: 0.4,
    line: 2,
};

const mockAnchor: UnifiedComponent = {
    id: 'test-anchor-1',
    name: 'Test Anchor',
    type: 'anchor',
    maturity: 0.6,
    visibility: 0.8,
    evolved: false,
    evolving: false,
    line: 3,
};

const renderWithProvider = (component: React.ReactElement) => {
    return render(
        <ComponentSelectionProvider>
            <svg width="800" height="600">
                {component}
            </svg>
        </ComponentSelectionProvider>,
    );
};

describe('Visual Selection Feedback', () => {
    describe('PSTBox Selection', () => {
        it('should show selection styling when PST element is selected', () => {
            const mockProps = {
                pstElement: mockPSTElement,
                mapDimensions: mockMapDimensions,
                mapStyleDefs: mockMapTheme,
                scaleFactor: 1,
                isHovered: false,
                isResizing: false,
                onResizeStart: jest.fn(),
                onResizeEnd: jest.fn(),
                onHover: jest.fn(),
                mutateMapText: jest.fn(),
                mapText: 'test map text',
            };

            renderWithProvider(<PSTBox {...mockProps} />);

            const pstBox = screen.getByTestId(`pst-box-rect-${mockPSTElement.id}`);

            // Click to select
            fireEvent.click(pstBox);

            // Should show selection outline
            expect(screen.getByTestId(`pst-box-selection-outline-${mockPSTElement.id}`)).toBeInTheDocument();
        });

        it('should show hover indicator when PST element is hovered', () => {
            const mockProps = {
                pstElement: mockPSTElement,
                mapDimensions: mockMapDimensions,
                mapStyleDefs: mockMapTheme,
                scaleFactor: 1,
                isHovered: true,
                isResizing: false,
                onResizeStart: jest.fn(),
                onResizeEnd: jest.fn(),
                onHover: jest.fn(),
                mutateMapText: jest.fn(),
                mapText: 'test map text',
            };

            renderWithProvider(<PSTBox {...mockProps} />);

            // Should show delete indicator when hovered
            expect(screen.getByTestId(`pst-box-delete-indicator-${mockPSTElement.id}`)).toBeInTheDocument();
        });
    });

    describe('MapComponent Selection', () => {
        it('should show selection styling when component is selected', () => {
            const mockProps = {
                mapDimensions: mockMapDimensions,
                component: mockComponent,
                mapText: 'test map text',
                mutateMapText: jest.fn(),
                mapStyleDefs: mockMapTheme,
                setHighlightLine: jest.fn(),
                scaleFactor: 1,
            };

            renderWithProvider(<MapComponent {...mockProps} />);

            const component = screen.getByTestId(`map-component-${mockComponent.id}`);

            // Click to select
            fireEvent.click(component);

            // Should have selection styling applied
            expect(component).toHaveStyle('filter: brightness(1.2) drop-shadow(0 0 6px rgba(33, 150, 243, 0.4))');
        });
    });

    describe('Note Selection', () => {
        it('should show selection styling when note is selected', () => {
            const mockProps = {
                note: mockNote,
                mapDimensions: mockMapDimensions,
                mapText: 'test map text',
                mutateMapText: jest.fn(),
                mapStyleDefs: mockMapTheme,
                setHighlightLine: jest.fn(),
                scaleFactor: 1,
            };

            renderWithProvider(<Note {...mockProps} />);

            const note = screen.getByTestId(`map-note-${mockNote.id}`);

            // Click to select
            fireEvent.click(note);

            // Should have selection styling applied
            expect(note).toHaveStyle('filter: brightness(1.2) drop-shadow(0 0 6px rgba(33, 150, 243, 0.4))');
        });
    });

    describe('Anchor Selection', () => {
        it('should show selection styling when anchor is selected', () => {
            const mockProps = {
                anchor: mockAnchor,
                mapDimensions: mockMapDimensions,
                mapText: 'test map text',
                mutateMapText: jest.fn(),
                mapStyleDefs: mockMapTheme,
                onClick: jest.fn(),
            };

            renderWithProvider(<Anchor {...mockProps} />);

            const anchor = screen.getByTestId(`map-anchor-${mockAnchor.id}`);

            // Click to select
            fireEvent.click(anchor);

            // Should have selection styling applied
            expect(anchor).toHaveStyle('filter: brightness(1.2) drop-shadow(0 0 6px rgba(33, 150, 243, 0.4))');
        });
    });

    describe('Smooth Transitions', () => {
        it('should apply smooth transitions to selection state changes', () => {
            const mockProps = {
                pstElement: mockPSTElement,
                mapDimensions: mockMapDimensions,
                mapStyleDefs: mockMapTheme,
                scaleFactor: 1,
                isHovered: false,
                isResizing: false,
                onResizeStart: jest.fn(),
                onResizeEnd: jest.fn(),
                onHover: jest.fn(),
                mutateMapText: jest.fn(),
                mapText: 'test map text',
            };

            renderWithProvider(<PSTBox {...mockProps} />);

            const pstBox = screen.getByTestId(`pst-box-rect-${mockPSTElement.id}`);

            // Should have transition style applied
            expect(pstBox).toHaveStyle('transition: all 0.2s ease-in-out');
        });
    });
});
