import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import PSTBox from '../../../components/map/PSTBox';
import {PSTElement, PSTType} from '../../../types/map/pst';
import {MapDimensions} from '../../../constants/defaults';
import {MapTheme} from '../../../types/map/styles';

// Mock the ResizeHandles component
jest.mock('../../../components/map/ResizeHandles', () => {
    return function MockResizeHandles({isVisible, onResizeStart}: any) {
        return isVisible ? (
            <g data-testid="resize-handles">
                <rect data-testid="resize-handle-top-left" onClick={() => onResizeStart('top-left', {x: 0, y: 0})} />
            </g>
        ) : null;
    };
});

// Mock the coordinate conversion utility
jest.mock('../../../utils/pstCoordinateUtils', () => ({
    convertPSTCoordinatesToBounds: jest.fn(() => ({
        x: 100,
        y: 50,
        width: 150,
        height: 80,
    })),
}));

describe('PSTBox Component', () => {
    const mockMapDimensions: MapDimensions = {
        width: 800,
        height: 600,
    };

    const mockMapStyleDefs: MapTheme = {
        component: {
            stroke: '#000',
            fill: '#fff',
        },
        strokeWidth: '1px',
        fontSize: '12px',
        pioneers: {
            stroke: '#000',
            fill: '#fff',
        },
        settlers: {
            stroke: '#000',
            fill: '#fff',
        },
        townplanners: {
            stroke: '#000',
            fill: '#fff',
        },
    };

    const createMockPSTElement = (type: PSTType = 'pioneers', name?: string): PSTElement => ({
        id: 'test-pst-1',
        type,
        coordinates: {
            maturity1: 0.2,
            visibility1: 0.8,
            maturity2: 0.5,
            visibility2: 0.6,
        },
        line: 1,
        name,
    });

    const defaultProps = {
        pstElement: createMockPSTElement(),
        mapDimensions: mockMapDimensions,
        mapStyleDefs: mockMapStyleDefs,
        scaleFactor: 1,
        isHovered: false,
        isResizing: false,
        onResizeStart: jest.fn(),
        onResizeEnd: jest.fn(),
        onHover: jest.fn(),
        mutateMapText: jest.fn(),
        mapText: 'test map text',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render PST box with correct structure', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} />
                </svg>,
            );

            expect(screen.getByTestId('pst-box-test-pst-1')).toBeInTheDocument();
            expect(screen.getByTestId('pst-box-rect-test-pst-1')).toBeInTheDocument();
            expect(screen.getByTestId('pst-box-label-test-pst-1')).toBeInTheDocument();
        });

        it('should render with correct PST type styling for pioneers', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} pstElement={createMockPSTElement('pioneers')} />
                </svg>,
            );

            const rect = screen.getByTestId('pst-box-rect-test-pst-1');
            expect(rect).toHaveAttribute('fill', '#FF6B6B');
            expect(rect).toHaveAttribute('stroke', '#FF6B6B');

            const label = screen.getByTestId('pst-box-label-test-pst-1');
            expect(label).toHaveTextContent('Pioneers');
        });

        it('should render with correct PST type styling for settlers', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} pstElement={createMockPSTElement('settlers')} />
                </svg>,
            );

            const rect = screen.getByTestId('pst-box-rect-test-pst-1');
            expect(rect).toHaveAttribute('fill', '#4ECDC4');
            expect(rect).toHaveAttribute('stroke', '#4ECDC4');

            const label = screen.getByTestId('pst-box-label-test-pst-1');
            expect(label).toHaveTextContent('Settlers');
        });

        it('should render with correct PST type styling for townplanners', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} pstElement={createMockPSTElement('townplanners')} />
                </svg>,
            );

            const rect = screen.getByTestId('pst-box-rect-test-pst-1');
            expect(rect).toHaveAttribute('fill', '#45B7D1');
            expect(rect).toHaveAttribute('stroke', '#45B7D1');

            const label = screen.getByTestId('pst-box-label-test-pst-1');
            expect(label).toHaveTextContent('Town Planners');
        });

        it('should display custom name when provided', () => {
            const elementWithName = createMockPSTElement('pioneers', 'Custom PST Name');
            render(
                <svg>
                    <PSTBox {...defaultProps} pstElement={elementWithName} />
                </svg>,
            );

            const label = screen.getByTestId('pst-box-label-test-pst-1');
            expect(label).toHaveTextContent('Custom PST Name');
        });

        it('should display default label when no name provided', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} pstElement={createMockPSTElement('settlers')} />
                </svg>,
            );

            const label = screen.getByTestId('pst-box-label-test-pst-1');
            expect(label).toHaveTextContent('Settlers');
        });
    });

    describe('Hover State Management', () => {
        it('should not show resize handles initially', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} />
                </svg>,
            );

            expect(screen.queryByTestId('resize-handles')).not.toBeInTheDocument();
        });

        it('should show resize handles when hovered externally', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} isHovered={true} />
                </svg>,
            );

            expect(screen.getByTestId('resize-handles')).toBeInTheDocument();
        });

        it('should call onHover when mouse enters', async () => {
            const onHover = jest.fn();
            render(
                <svg>
                    <PSTBox {...defaultProps} onHover={onHover} />
                </svg>,
            );

            const rect = screen.getByTestId('pst-box-rect-test-pst-1');
            fireEvent.mouseEnter(rect);

            // Wait for the hover timeout
            await waitFor(
                () => {
                    expect(onHover).toHaveBeenCalledWith(defaultProps.pstElement);
                },
                {timeout: 200},
            );
        });

        it('should call onHover with null when mouse leaves', async () => {
            const onHover = jest.fn();
            render(
                <svg>
                    <PSTBox {...defaultProps} onHover={onHover} />
                </svg>,
            );

            const rect = screen.getByTestId('pst-box-rect-test-pst-1');
            fireEvent.mouseEnter(rect);
            fireEvent.mouseLeave(rect);

            // Wait for the hide timeout
            await waitFor(
                () => {
                    expect(onHover).toHaveBeenCalledWith(null);
                },
                {timeout: 300},
            );
        });

        it('should show hover outline when hovered', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} isHovered={true} />
                </svg>,
            );

            expect(screen.getByTestId('pst-box-hover-outline-test-pst-1')).toBeInTheDocument();
        });

        it('should not show hover outline when not hovered', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} isHovered={false} />
                </svg>,
            );

            expect(screen.queryByTestId('pst-box-hover-outline-test-pst-1')).not.toBeInTheDocument();
        });
    });

    describe('Resize State Management', () => {
        it('should show resize handles when resizing', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} isResizing={true} />
                </svg>,
            );

            expect(screen.getByTestId('resize-handles')).toBeInTheDocument();
        });

        it('should call onResizeStart when resize handle is activated', () => {
            const onResizeStart = jest.fn();
            render(
                <svg>
                    <PSTBox {...defaultProps} onResizeStart={onResizeStart} isHovered={true} />
                </svg>,
            );

            const resizeHandle = screen.getByTestId('resize-handle-top-left');
            fireEvent.click(resizeHandle);

            expect(onResizeStart).toHaveBeenCalledWith(defaultProps.pstElement, 'top-left');
        });

        it('should change cursor style when resizing', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} isResizing={true} />
                </svg>,
            );

            const rect = screen.getByTestId('pst-box-rect-test-pst-1');
            expect(rect).toHaveStyle({cursor: 'grabbing'});
        });

        it('should use pointer cursor when not resizing', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} isResizing={false} />
                </svg>,
            );

            const rect = screen.getByTestId('pst-box-rect-test-pst-1');
            expect(rect).toHaveStyle({cursor: 'pointer'});
        });
    });

    describe('Visual Feedback', () => {
        it('should apply hover styling when hovered', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} isHovered={true} />
                </svg>,
            );

            const rect = screen.getByTestId('pst-box-rect-test-pst-1');
            expect(rect).toHaveAttribute('fill-opacity', '0.8');
            expect(rect).toHaveAttribute('stroke-width', '2');
        });

        it('should apply normal styling when not hovered', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} isHovered={false} />
                </svg>,
            );

            const rect = screen.getByTestId('pst-box-rect-test-pst-1');
            expect(rect).toHaveAttribute('fill-opacity', '0.6');
            expect(rect).toHaveAttribute('stroke-width', '1');
        });

        it('should scale font size based on scale factor', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} scaleFactor={2} />
                </svg>,
            );

            const label = screen.getByTestId('pst-box-label-test-pst-1');
            expect(label).toHaveAttribute('font-size', '10'); // Math.max(10, 12/2)
        });

        it('should maintain minimum font size', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} scaleFactor={0.5} />
                </svg>,
            );

            const label = screen.getByTestId('pst-box-label-test-pst-1');
            expect(label).toHaveAttribute('font-size', '24'); // 12/0.5
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} />
                </svg>,
            );

            const pstBox = screen.getByTestId('pst-box-test-pst-1');
            expect(pstBox).toHaveAttribute('role', 'button');
            expect(pstBox).toHaveAttribute('tabindex', '0');
            expect(pstBox).toHaveAttribute('aria-label', 'Pioneers box: Unnamed');
            expect(pstBox).toHaveAttribute('aria-describedby', 'pst-box-description-test-pst-1');
        });

        it('should include element name in ARIA label when provided', () => {
            const elementWithName = createMockPSTElement('settlers', 'My Settlers');
            render(
                <svg>
                    <PSTBox {...defaultProps} pstElement={elementWithName} />
                </svg>,
            );

            const pstBox = screen.getByTestId('pst-box-test-pst-1');
            expect(pstBox).toHaveAttribute('aria-label', 'Settlers box: My Settlers');
        });

        it('should support keyboard interaction', async () => {
            const onHover = jest.fn();
            render(
                <svg>
                    <PSTBox {...defaultProps} onHover={onHover} />
                </svg>,
            );

            const rect = screen.getByTestId('pst-box-rect-test-pst-1');
            fireEvent.keyDown(rect, {key: 'Enter'});

            await waitFor(
                () => {
                    expect(onHover).toHaveBeenCalledWith(defaultProps.pstElement);
                },
                {timeout: 200},
            );
        });

        it('should support space key interaction', async () => {
            const onHover = jest.fn();
            render(
                <svg>
                    <PSTBox {...defaultProps} onHover={onHover} />
                </svg>,
            );

            const rect = screen.getByTestId('pst-box-rect-test-pst-1');
            fireEvent.keyDown(rect, {key: ' '});

            await waitFor(
                () => {
                    expect(onHover).toHaveBeenCalledWith(defaultProps.pstElement);
                },
                {timeout: 200},
            );
        });

        it('should provide screen reader description', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} />
                </svg>,
            );

            const description = screen.getByText(/Pioneers box positioned at maturity/);
            expect(description).toBeInTheDocument();
            expect(description).toHaveAttribute('aria-hidden', 'true');
        });
    });

    describe('Coordinate Conversion', () => {
        it('should call coordinate conversion utility with correct parameters', () => {
            const {convertPSTCoordinatesToBounds} = require('../../../utils/pstCoordinateUtils');

            render(
                <svg>
                    <PSTBox {...defaultProps} />
                </svg>,
            );

            expect(convertPSTCoordinatesToBounds).toHaveBeenCalledWith(defaultProps.pstElement.coordinates, mockMapDimensions);
        });

        it('should position elements based on converted bounds', () => {
            render(
                <svg>
                    <PSTBox {...defaultProps} />
                </svg>,
            );

            const rect = screen.getByTestId('pst-box-rect-test-pst-1');
            expect(rect).toHaveAttribute('x', '100');
            expect(rect).toHaveAttribute('y', '50');
            expect(rect).toHaveAttribute('width', '150');
            expect(rect).toHaveAttribute('height', '80');
        });
    });

    describe('Timing and Performance', () => {
        it('should debounce hover events to prevent flickering', async () => {
            const onHover = jest.fn();
            render(
                <svg>
                    <PSTBox {...defaultProps} onHover={onHover} />
                </svg>,
            );

            const rect = screen.getByTestId('pst-box-rect-test-pst-1');

            // Rapid mouse enter/leave should not trigger multiple calls
            fireEvent.mouseEnter(rect);
            fireEvent.mouseLeave(rect);
            fireEvent.mouseEnter(rect);

            // Should only call once after the timeout
            await waitFor(
                () => {
                    expect(onHover).toHaveBeenCalledTimes(1);
                },
                {timeout: 200},
            );
        });

        it('should clear timeouts on unmount', () => {
            const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

            const {unmount} = render(
                <svg>
                    <PSTBox {...defaultProps} />
                </svg>,
            );

            const rect = screen.getByTestId('pst-box-rect-test-pst-1');
            fireEvent.mouseEnter(rect);

            unmount();

            expect(clearTimeoutSpy).toHaveBeenCalled();
            clearTimeoutSpy.mockRestore();
        });
    });
});
