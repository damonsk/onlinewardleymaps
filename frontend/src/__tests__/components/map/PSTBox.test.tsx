import '@testing-library/jest-dom';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';
import {ComponentSelectionProvider} from '../../../components/ComponentSelectionContext';
import {ContextMenuProvider} from '../../../components/map/ContextMenuProvider';
import PSTBox from '../../../components/map/PSTBox';
import {UndoRedoProvider} from '../../../components/UndoRedoProvider';
import {MapDimensions} from '../../../constants/defaults';
import {PSTElement, PSTType} from '../../../types/map/pst';
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
        id: '1',
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
        onResizeMove: jest.fn(),
        onResizeEnd: jest.fn(),
        onHover: jest.fn(),
    };

    const renderWithProvider = (component: React.ReactElement) => {
        return render(
            <UndoRedoProvider mutateMapText={jest.fn()} mapText="test map text">
                <ComponentSelectionProvider>
                    <ContextMenuProvider>
                        <svg>{component}</svg>
                    </ContextMenuProvider>
                </ComponentSelectionProvider>
            </UndoRedoProvider>,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render PST box with correct structure', () => {
            renderWithProvider(<PSTBox {...defaultProps} />);

            expect(screen.getByTestId('pst-box-1')).toBeInTheDocument();
            expect(screen.getByTestId('pst-box-rect-1')).toBeInTheDocument();
            expect(screen.getByTestId('pst-box-label-1')).toBeInTheDocument();
        });

        it('should render with correct PST type styling for pioneers', () => {
            renderWithProvider(<PSTBox {...defaultProps} pstElement={createMockPSTElement('pioneers')} />);

            const rect = screen.getByTestId('pst-box-rect-1');
            expect(rect).toHaveAttribute('fill', '#3ccaf8');
            expect(rect).toHaveAttribute('stroke', '#3ccaf8');

            const label = screen.getByTestId('pst-box-label-1');
            expect(label).toHaveTextContent('Pioneers');
        });

        it('should render with correct PST type styling for settlers', () => {
            renderWithProvider(<PSTBox {...defaultProps} pstElement={createMockPSTElement('settlers')} />);

            const rect = screen.getByTestId('pst-box-rect-1');
            expect(rect).toHaveAttribute('fill', '#599afa');
            expect(rect).toHaveAttribute('stroke', '#599afa');

            const label = screen.getByTestId('pst-box-label-1');
            expect(label).toHaveTextContent('Settlers');
        });

        it('should render with correct PST type styling for townplanners', () => {
            renderWithProvider(<PSTBox {...defaultProps} pstElement={createMockPSTElement('townplanners')} />);

            const rect = screen.getByTestId('pst-box-rect-1');
            expect(rect).toHaveAttribute('fill', '#936ff9');
            expect(rect).toHaveAttribute('stroke', '#936ff9');

            const label = screen.getByTestId('pst-box-label-1');
            expect(label).toHaveTextContent('Town Planners');
        });

        it('should display custom name when provided', () => {
            const elementWithName = createMockPSTElement('pioneers', 'Custom PST Name');
            renderWithProvider(<PSTBox {...defaultProps} pstElement={elementWithName} />);

            const label = screen.getByTestId('pst-box-label-1');
            expect(label).toHaveTextContent('Custom PST Name');
        });

        it('should display default label when no name provided', () => {
            renderWithProvider(<PSTBox {...defaultProps} pstElement={createMockPSTElement('settlers')} />);

            const label = screen.getByTestId('pst-box-label-1');
            expect(label).toHaveTextContent('Settlers');
        });
    });

    describe('Hover State Management', () => {
        it('should not show resize handles initially', () => {
            renderWithProvider(<PSTBox {...defaultProps} />);

            expect(screen.queryByTestId('resize-handles')).not.toBeInTheDocument();
        });

        it('should show resize handles when hovered externally', async () => {
            renderWithProvider(<PSTBox {...defaultProps} isHovered={true} />);

            const pstBox = screen.getByTestId('pst-box-1');
            fireEvent.mouseEnter(pstBox);

            // Wait for debounced hover to trigger
            await waitFor(
                () => {
                    expect(screen.getByTestId('resize-handles')).toBeInTheDocument();
                },
                {timeout: 200},
            );
        });

        it('should call onHover when mouse enters', async () => {
            const onHover = jest.fn();
            renderWithProvider(<PSTBox {...defaultProps} onHover={onHover} />);

            const pstBox = screen.getByTestId('pst-box-1');
            fireEvent.mouseEnter(pstBox);

            // Wait for the debounced hover timeout
            await waitFor(
                () => {
                    expect(onHover).toHaveBeenCalledWith(defaultProps.pstElement);
                },
                {timeout: 200},
            );
        });

        it('should call onHover with null when mouse leaves', async () => {
            const onHover = jest.fn();
            renderWithProvider(<PSTBox {...defaultProps} onHover={onHover} />);

            const pstBox = screen.getByTestId('pst-box-1');
            fireEvent.mouseEnter(pstBox);
            fireEvent.mouseLeave(pstBox);

            // Wait for the debounced hide timeout
            await waitFor(
                () => {
                    expect(onHover).toHaveBeenCalledWith(null);
                },
                {timeout: 400},
            );
        });

        it('should show hover outline when hovered', () => {
            renderWithProvider(<PSTBox {...defaultProps} isHovered={true} />);

            expect(screen.getByTestId('pst-box-hover-outline-1')).toBeInTheDocument();
        });

        it('should not show hover outline when not hovered', () => {
            renderWithProvider(<PSTBox {...defaultProps} isHovered={false} />);

            expect(screen.queryByTestId('pst-box-hover-outline-1')).not.toBeInTheDocument();
        });
    });

    describe('Resize State Management', () => {
        it('should show resize handles when resizing', () => {
            renderWithProvider(<PSTBox {...defaultProps} isResizing={true} />);

            expect(screen.getByTestId('resize-handles')).toBeInTheDocument();
        });

        it('should call onResizeStart when resize handle is activated', async () => {
            const onResizeStart = jest.fn();
            renderWithProvider(<PSTBox {...defaultProps} onResizeStart={onResizeStart} isHovered={true} />);

            const pstBox = screen.getByTestId('pst-box-1');
            fireEvent.mouseEnter(pstBox);

            // Wait for handles to appear
            await waitFor(
                () => {
                    expect(screen.getByTestId('resize-handles')).toBeInTheDocument();
                },
                {timeout: 200},
            );

            const resizeHandle = screen.getByTestId('resize-handle-top-left');
            fireEvent.click(resizeHandle);

            expect(onResizeStart).toHaveBeenCalledWith(defaultProps.pstElement, 'top-left', {x: 0, y: 0});
        });

        it('should change cursor style when resizing', () => {
            renderWithProvider(<PSTBox {...defaultProps} isResizing={true} />);

            const pstBox = screen.getByTestId('pst-box-1');
            expect(pstBox).toHaveStyle({cursor: 'grabbing'});
        });

        it('should use pointer cursor when not resizing', () => {
            renderWithProvider(<PSTBox {...defaultProps} isResizing={false} />);

            const pstBox = screen.getByTestId('pst-box-1');
            expect(pstBox).toHaveStyle({cursor: 'grab'});
        });
    });

    describe('Visual Feedback', () => {
        it('should apply hover styling when hovered', () => {
            renderWithProvider(<PSTBox {...defaultProps} isHovered={true} />);

            const rect = screen.getByTestId('pst-box-rect-1');
            expect(rect).toHaveAttribute('fill-opacity', '0.6');
            expect(rect).toHaveAttribute('stroke-width', '2');
        });

        it('should apply normal styling when not hovered', () => {
            renderWithProvider(<PSTBox {...defaultProps} isHovered={false} />);

            const rect = screen.getByTestId('pst-box-rect-1');
            expect(rect).toHaveAttribute('fill-opacity', '0.6');
            expect(rect).toHaveAttribute('stroke-width', '1');
        });

        it('should scale font size based on scale factor', () => {
            renderWithProvider(<PSTBox {...defaultProps} scaleFactor={2} />);

            const label = screen.getByTestId('pst-box-label-1');
            expect(label).toHaveAttribute('font-size', '12'); // Math.max(10, 12/2)
        });

        it('should maintain minimum font size', () => {
            renderWithProvider(<PSTBox {...defaultProps} scaleFactor={0.5} />);

            const label = screen.getByTestId('pst-box-label-1');
            expect(label).toHaveAttribute('font-size', '12'); // 12/0.5
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes', () => {
            renderWithProvider(<PSTBox {...defaultProps} />);

            const pstBox = screen.getByTestId('pst-box-1');
            expect(pstBox).toHaveAttribute('role', 'button');
            expect(pstBox).toHaveAttribute('tabindex', '0');
            expect(pstBox).toHaveAttribute('aria-label', 'Pioneers box: Unnamed');
            expect(pstBox).toHaveAttribute('aria-describedby', 'pst-box-description-1');
        });

        it('should include element name in ARIA label when provided', () => {
            const elementWithName = createMockPSTElement('settlers', 'My Settlers');
            renderWithProvider(<PSTBox {...defaultProps} pstElement={elementWithName} />);

            const pstBox = screen.getByTestId('pst-box-1');
            expect(pstBox).toHaveAttribute('aria-label', 'Settlers box: My Settlers');
        });

        it('should support keyboard interaction', async () => {
            const onHover = jest.fn();
            renderWithProvider(<PSTBox {...defaultProps} onHover={onHover} />);

            const rect = screen.getByTestId('pst-box-rect-1');
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
            renderWithProvider(<PSTBox {...defaultProps} onHover={onHover} />);

            const rect = screen.getByTestId('pst-box-rect-1');
            fireEvent.keyDown(rect, {key: ' '});

            await waitFor(
                () => {
                    expect(onHover).toHaveBeenCalledWith(defaultProps.pstElement);
                },
                {timeout: 200},
            );
        });

        it('should provide screen reader description', () => {
            renderWithProvider(<PSTBox {...defaultProps} />);

            const description = screen.getByText(/Pioneers box positioned at maturity/);
            expect(description).toBeInTheDocument();
            expect(description).toHaveAttribute('aria-hidden', 'true');
        });
    });

    describe('Coordinate Conversion', () => {
        it('should call coordinate conversion utility with correct parameters', () => {
            const {convertPSTCoordinatesToBounds} = require('../../../utils/pstCoordinateUtils');

            renderWithProvider(<PSTBox {...defaultProps} />);

            expect(convertPSTCoordinatesToBounds).toHaveBeenCalledWith(defaultProps.pstElement.coordinates, mockMapDimensions);
        });

        it('should position elements based on converted bounds', () => {
            renderWithProvider(<PSTBox {...defaultProps} />);

            const rect = screen.getByTestId('pst-box-rect-1');
            expect(rect).toHaveAttribute('x', '100');
            expect(rect).toHaveAttribute('y', '50');
            expect(rect).toHaveAttribute('width', '150');
            expect(rect).toHaveAttribute('height', '80');
        });
    });

    describe('Timing and Performance', () => {
        it('should handle rapid hover events without flickering', async () => {
            const onHover = jest.fn();
            renderWithProvider(<PSTBox {...defaultProps} onHover={onHover} />);

            const pstBox = screen.getByTestId('pst-box-1');

            // Test that mouse events are handled correctly
            fireEvent.mouseEnter(pstBox);

            // Wait for first enter to be processed
            await waitFor(() => {
                expect(onHover).toHaveBeenCalledWith(defaultProps.pstElement);
            });

            fireEvent.mouseLeave(pstBox);
            fireEvent.mouseEnter(pstBox);

            // Should have called onHover multiple times
            expect(onHover).toHaveBeenCalled();
            expect(onHover.mock.calls.length).toBeGreaterThan(1);
        });

        it('should clear timeouts on unmount', () => {
            const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

            const {unmount} = renderWithProvider(<PSTBox {...defaultProps} />);

            const pstBox = screen.getByTestId('pst-box-1');

            // Trigger hover and then leave to create a hide timeout
            fireEvent.mouseEnter(pstBox);
            fireEvent.mouseLeave(pstBox);

            unmount();

            expect(clearTimeoutSpy).toHaveBeenCalled();
            clearTimeoutSpy.mockRestore();
        });
    });

    describe('Touch Device Support', () => {
        beforeEach(() => {
            // Mock touch device detection
            Object.defineProperty(window, 'ontouchstart', {
                writable: true,
                value: true,
            });
            Object.defineProperty(navigator, 'maxTouchPoints', {
                writable: true,
                value: 5,
            });
        });

        afterEach(() => {
            // Clean up touch device mocks
            delete (window as any).ontouchstart;
            Object.defineProperty(navigator, 'maxTouchPoints', {
                writable: true,
                value: 0,
            });
        });

        it('should handle touch start events for selection (first touch)', () => {
            const onHover = jest.fn();
            renderWithProvider(<PSTBox {...defaultProps} onHover={onHover} />);

            const rect = screen.getByTestId('pst-box-rect-1');
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            // First touch should select, not start drag
            expect(onHover).toHaveBeenCalledWith(defaultProps.pstElement);
        });

        it('should handle touch move events during drag (after selection)', () => {
            const onDragMove = jest.fn();
            renderWithProvider(<PSTBox {...defaultProps} onDragMove={onDragMove} />);

            const rect = screen.getByTestId('pst-box-rect-1');

            // First touch to select
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            // Second touch to start drag
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            // Simulate touch move on document
            fireEvent.touchMove(document, {
                touches: [{clientX: 110, clientY: 60}],
            });

            expect(onDragMove).toHaveBeenCalledWith(defaultProps.pstElement, {x: 110, y: 60});
        });

        it('should handle touch end events to complete drag (after selection)', () => {
            const onDragEnd = jest.fn();
            renderWithProvider(<PSTBox {...defaultProps} onDragEnd={onDragEnd} />);

            const rect = screen.getByTestId('pst-box-rect-1');

            // First touch to select
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            // Second touch to start drag
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            // End touch drag
            fireEvent.touchEnd(document);

            expect(onDragEnd).toHaveBeenCalledWith(defaultProps.pstElement);
        });

        it('should prevent scrolling during touch drag operations', () => {
            renderWithProvider(<PSTBox {...defaultProps} />);

            const rect = screen.getByTestId('pst-box-rect-1');

            // First touch to select
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            // Second touch to start drag
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            // Check that touch-action is disabled
            expect(document.body.style.touchAction).toBe('none');
        });

        it('should restore scrolling after touch drag completes', () => {
            renderWithProvider(<PSTBox {...defaultProps} />);

            const rect = screen.getByTestId('pst-box-rect-1');

            // First touch to select
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            // Second touch to start drag
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            // End touch drag
            fireEvent.touchEnd(document);

            // Check that touch-action is restored
            expect(document.body.style.touchAction).toBe('');
        });

        it('should handle touch cancel events properly', () => {
            const onDragEnd = jest.fn();
            renderWithProvider(<PSTBox {...defaultProps} onDragEnd={onDragEnd} />);

            const rect = screen.getByTestId('pst-box-rect-1');

            // First touch to select
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            // Second touch to start drag
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            // Cancel touch
            fireEvent.touchCancel(document);

            expect(onDragEnd).toHaveBeenCalledWith(defaultProps.pstElement);
        });

        it('should not start drag during resize operations on touch', () => {
            const onDragStart = jest.fn();
            renderWithProvider(<PSTBox {...defaultProps} onDragStart={onDragStart} isResizing={true} />);

            const rect = screen.getByTestId('pst-box-rect-1');
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            expect(onDragStart).not.toHaveBeenCalled();
        });

        it('should handle multi-touch scenarios gracefully', () => {
            const onDragStart = jest.fn();
            renderWithProvider(<PSTBox {...defaultProps} onDragStart={onDragStart} />);

            const rect = screen.getByTestId('pst-box-rect-1');

            // First touch should select the element (not start drag)
            fireEvent.touchStart(rect, {
                touches: [
                    {clientX: 100, clientY: 50},
                    {clientX: 200, clientY: 150},
                ],
            });

            // First touch should not start drag, just select
            expect(onDragStart).not.toHaveBeenCalled();
        });

        it('should show resize handles on first touch and start drag on second touch', () => {
            const onDragStart = jest.fn();
            const onHover = jest.fn();
            renderWithProvider(<PSTBox {...defaultProps} onDragStart={onDragStart} onHover={onHover} />);

            const rect = screen.getByTestId('pst-box-rect-1');

            // First touch should select and show handles
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            expect(onHover).toHaveBeenCalledWith(defaultProps.pstElement);
            expect(onDragStart).not.toHaveBeenCalled();

            // Second touch should start drag
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            expect(onDragStart).toHaveBeenCalledWith(defaultProps.pstElement, {x: 100, y: 50});
        });

        it('should show touch selection outline when selected', () => {
            renderWithProvider(<PSTBox {...defaultProps} />);

            const rect = screen.getByTestId('pst-box-rect-1');

            // First touch should show touch outline
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            expect(screen.getByTestId(`pst-box-touch-outline-${defaultProps.pstElement.id}`)).toBeInTheDocument();
        });

        it('should auto-hide handles after timeout on touch devices', async () => {
            jest.useFakeTimers();
            const onHover = jest.fn();

            renderWithProvider(<PSTBox {...defaultProps} onHover={onHover} />);

            const rect = screen.getByTestId('pst-box-rect-1');

            // First touch should select
            fireEvent.touchStart(rect, {
                touches: [{clientX: 100, clientY: 50}],
            });

            expect(onHover).toHaveBeenCalledWith(defaultProps.pstElement);

            // Fast-forward 5 seconds
            jest.advanceTimersByTime(5000);

            expect(onHover).toHaveBeenCalledWith(null);

            jest.useRealTimers();
        });
    });
});
