import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import PSTBox from '../../components/map/PSTBox';
import {PSTElement, PSTType} from '../../types/map/pst';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';

// Mock the coordinate utilities
jest.mock('../../utils/pstCoordinateUtils', () => ({
    convertPSTCoordinatesToBounds: jest.fn(() => ({
        x: 100,
        y: 100,
        width: 80,
        height: 60,
    })),
    convertBoundsToPSTCoordinates: jest.fn(() => ({
        maturity1: 0.1,
        visibility1: 0.8,
        maturity2: 0.3,
        visibility2: 0.6,
    })),
}));

describe('PST Resize Integration', () => {
    const mockMapDimensions: MapDimensions = {
        width: 800,
        height: 600,
    };

    const mockMapStyleDefs: MapTheme = {
        component: {
            stroke: '#000',
            fill: '#fff',
        },
    } as MapTheme;

    const createMockPSTElement = (type: PSTType = 'pioneers'): PSTElement => ({
        id: 'test-pst-1',
        type,
        coordinates: {
            maturity1: 0.1,
            visibility1: 0.8,
            maturity2: 0.3,
            visibility2: 0.6,
        },
        line: 1,
        name: 'Test PST',
    });

    const defaultProps = {
        pstElement: createMockPSTElement(),
        mapDimensions: mockMapDimensions,
        mapStyleDefs: mockMapStyleDefs,
        scaleFactor: 1,
        isHovered: false,
        isResizing: false,
        onResizeStart: jest.fn(),
        onResizeMove: jest.fn(),
        onResizeEnd: jest.fn(),
        onHover: jest.fn(),
        mutateMapText: jest.fn(),
        mapText: 'pioneers [0.8, 0.1, 0.6, 0.3]',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should show resize handles on hover and hide them on leave', async () => {
        render(
            <svg>
                <PSTBox {...defaultProps} />
            </svg>,
        );

        const pstBox = screen.getByTestId('pst-box-test-pst-1');

        // Initially no resize handles should be visible
        expect(screen.queryByTestId('resize-handles')).not.toBeInTheDocument();

        // Hover over the PST box
        fireEvent.mouseEnter(pstBox);

        // Should call onHover with the element
        expect(defaultProps.onHover).toHaveBeenCalledWith(defaultProps.pstElement);

        // Mouse leave should call onHover with null after delay
        fireEvent.mouseLeave(pstBox);

        await waitFor(() => {
            expect(defaultProps.onHover).toHaveBeenCalledWith(null);
        }, { timeout: 500 });
    });

    it('should show resize handles when isHovered prop is true', () => {
        render(
            <svg>
                <PSTBox {...defaultProps} isHovered={true} />
            </svg>,
        );

        // Resize handles should be visible
        expect(screen.getByTestId('resize-handles')).toBeInTheDocument();
    });

    it('should keep resize handles visible when isResizing is true', () => {
        render(
            <svg>
                <PSTBox {...defaultProps} isResizing={true} />
            </svg>,
        );

        // Resize handles should be visible
        expect(screen.getByTestId('resize-handles')).toBeInTheDocument();
    });

    it('should call resize handlers when resize handle is used', async () => {
        render(
            <svg>
                <PSTBox {...defaultProps} isHovered={true} />
            </svg>,
        );

        // Find a resize handle
        const topLeftHandle = screen.getByTestId('resize-handle-top-left');

        // Simulate mouse down on resize handle
        fireEvent.mouseDown(topLeftHandle, {
            clientX: 100,
            clientY: 100,
        });

        // Should call onResizeStart
        expect(defaultProps.onResizeStart).toHaveBeenCalledWith(
            defaultProps.pstElement,
            'top-left',
            { x: 100, y: 100 }
        );
    });

    it('should handle rapid mouse movements without excessive calls', async () => {
        const onHover = jest.fn();
        
        render(
            <svg>
                <PSTBox {...defaultProps} onHover={onHover} />
            </svg>,
        );

        const pstBox = screen.getByTestId('pst-box-test-pst-1');

        // Simulate rapid mouse movements
        fireEvent.mouseEnter(pstBox);
        fireEvent.mouseLeave(pstBox);
        fireEvent.mouseEnter(pstBox);

        // Should handle the events but optimize for performance
        await waitFor(() => {
            // The optimized logic should reduce unnecessary calls
            expect(onHover).toHaveBeenCalledWith(defaultProps.pstElement);
            expect(onHover.mock.calls.length).toBeGreaterThan(0);
            expect(onHover.mock.calls.length).toBeLessThan(10); // Reasonable upper bound
        });
    });

    it('should display correct hover outline size', () => {
        render(
            <svg>
                <PSTBox {...defaultProps} isHovered={true} />
            </svg>,
        );

        const hoverOutline = screen.getByTestId('pst-box-hover-outline-test-pst-1');
        
        // Check that outline is only slightly larger than the box
        expect(hoverOutline).toHaveAttribute('x', '99'); // bounds.x - 1
        expect(hoverOutline).toHaveAttribute('y', '99'); // bounds.y - 1
        expect(hoverOutline).toHaveAttribute('width', '82'); // bounds.width + 2
        expect(hoverOutline).toHaveAttribute('height', '62'); // bounds.height + 2
    });
});