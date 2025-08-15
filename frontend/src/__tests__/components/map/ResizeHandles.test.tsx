import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import ResizeHandles from '../../../components/map/ResizeHandles';
import {PSTBounds} from '../../../types/map/pst';
import {MapTheme} from '../../../types/map/styles';

// Mock map theme
const mockMapTheme: MapTheme = {
    className: 'wardley',
    component: {
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 1,
    },
    attitudes: {
        fill: '#cccccc',
        stroke: '#666666',
        strokeWidth: 1,
    },
    annotations: {
        fill: '#eeeeee',
        stroke: '#999999',
        strokeWidth: 1,
    },
    links: {
        stroke: '#333333',
        strokeWidth: 1,
    },
    text: {
        fill: '#000000',
        fontSize: 12,
    },
};

// Mock bounds for testing
const mockBounds: PSTBounds = {
    x: 100,
    y: 50,
    width: 200,
    height: 100,
};

describe('ResizeHandles Component - Core Functionality', () => {
    let mockOnResizeStart: jest.Mock;
    let mockOnResizeMove: jest.Mock;
    let mockOnResizeEnd: jest.Mock;

    beforeEach(() => {
        mockOnResizeStart = jest.fn();
        mockOnResizeMove = jest.fn();
        mockOnResizeEnd = jest.fn();

        // Update defaultProps with fresh mocks
        Object.assign(defaultProps, {
            onResizeStart: mockOnResizeStart,
            onResizeMove: mockOnResizeMove,
            onResizeEnd: mockOnResizeEnd,
        });
    });

    const defaultProps = {
        bounds: mockBounds,
        isVisible: true,
        onResizeStart: mockOnResizeStart,
        onResizeMove: mockOnResizeMove,
        onResizeEnd: mockOnResizeEnd,
        scaleFactor: 1,
        mapStyleDefs: mockMapTheme,
    };

    // Helper function to render component wrapped in SVG
    const renderResizeHandles = (props = defaultProps) => {
        return render(
            <svg>
                <ResizeHandles {...props} />
            </svg>,
        );
    };

    it('renders all 8 resize handles when visible', () => {
        renderResizeHandles();

        const handles = screen.getAllByRole('button');
        expect(handles).toHaveLength(8);

        // Check specific handles exist
        expect(screen.getByTestId('resize-handle-top-left')).toBeInTheDocument();
        expect(screen.getByTestId('resize-handle-bottom-right')).toBeInTheDocument();
    });

    it('does not render when not visible', () => {
        renderResizeHandles({...defaultProps, isVisible: false});
        expect(screen.queryByTestId('resize-handles')).not.toBeInTheDocument();
    });

    it('calls onResizeStart when mouse down on handle', () => {
        renderResizeHandles();

        const handle = screen.getByTestId('resize-handle-top-left');
        fireEvent.mouseDown(handle, {clientX: 100, clientY: 50});

        expect(mockOnResizeStart).toHaveBeenCalledWith('top-left', {x: 100, y: 50});
    });

    it('applies correct cursor styles', () => {
        renderResizeHandles();

        const topLeft = screen.getByTestId('resize-handle-top-left');
        expect(topLeft).toHaveStyle('cursor: nw-resize');

        const topCenter = screen.getByTestId('resize-handle-top-center');
        expect(topCenter).toHaveStyle('cursor: n-resize');

        const bottomRight = screen.getByTestId('resize-handle-bottom-right');
        expect(bottomRight).toHaveStyle('cursor: se-resize');
    });

    it('positions handles correctly', () => {
        renderResizeHandles();

        // Top-left should be at bounds origin minus offset (4px for 8px handle)
        const topLeft = screen.getByTestId('resize-handle-top-left');
        expect(topLeft).toHaveAttribute('x', '92'); // 100 - 8 (handle size 8, offset 8)
        expect(topLeft).toHaveAttribute('y', '42'); // 50 - 8

        // Bottom-right should be at bounds end minus offset
        const bottomRight = screen.getByTestId('resize-handle-bottom-right');
        expect(bottomRight).toHaveAttribute('x', '292'); // 100 + 200 - 8
        expect(bottomRight).toHaveAttribute('y', '142'); // 50 + 100 - 8
    });

    it('scales handle size based on scale factor', () => {
        // Mock non-touch device for this test
        Object.defineProperty(navigator, 'maxTouchPoints', {
            writable: true,
            value: 0,
        });
        delete (window as any).ontouchstart;

        renderResizeHandles({...defaultProps, scaleFactor: 2});

        const handle = screen.getByTestId('resize-handle-top-left');
        // With scale factor 2, handle size should be 8/2 = 4, but minimum is 6
        expect(handle).toHaveAttribute('width', '6');
        expect(handle).toHaveAttribute('height', '6');
    });

    it('provides accessibility attributes', () => {
        renderResizeHandles();

        const topLeft = screen.getByTestId('resize-handle-top-left');
        expect(topLeft).toHaveAttribute('aria-label', 'Resize handle: top left');
        expect(topLeft).toHaveAttribute('tabindex', '0'); // SVG uses lowercase tabindex
        expect(topLeft).toHaveAttribute('role', 'button');
    });

    it('includes screen reader instructions', () => {
        renderResizeHandles();

        const instructions = screen.getByText('Use arrow keys or drag to resize. Press Escape to cancel.');
        expect(instructions).toBeInTheDocument();
        expect(instructions).toHaveAttribute('aria-hidden', 'true');
    });
});

describe('ResizeHandles Component - Touch Device Support', () => {
    let mockOnResizeStart: jest.Mock;
    let mockOnResizeMove: jest.Mock;
    let mockOnResizeEnd: jest.Mock;

    beforeEach(() => {
        mockOnResizeStart = jest.fn();
        mockOnResizeMove = jest.fn();
        mockOnResizeEnd = jest.fn();

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

    const defaultProps = {
        bounds: mockBounds,
        isVisible: true,
        onResizeStart: mockOnResizeStart,
        onResizeMove: mockOnResizeMove,
        onResizeEnd: mockOnResizeEnd,
        scaleFactor: 1,
        mapStyleDefs: mockMapTheme,
    };

    // Helper function to render component wrapped in SVG
    const renderResizeHandles = (props = defaultProps) => {
        return render(
            <svg>
                <ResizeHandles {...props} />
            </svg>,
        );
    };

    it('uses larger handle size for touch devices', () => {
        renderResizeHandles();

        const handle = screen.getByTestId('resize-handle-top-left');
        // Touch devices should use 16px base size, minimum 12px
        expect(handle).toHaveAttribute('width', '16');
        expect(handle).toHaveAttribute('height', '16');
    });

    it('calls onResizeStart when touch start on handle', () => {
        renderResizeHandles();

        const handle = screen.getByTestId('resize-handle-top-left');
        
        // Create a proper touch event
        fireEvent.touchStart(handle, {
            touches: [
                {
                    clientX: 100,
                    clientY: 50,
                }
            ]
        });

        expect(mockOnResizeStart).toHaveBeenCalledWith('top-left', {x: 100, y: 50});
    });

    it('handles touch move events during resize', () => {
        renderResizeHandles();

        const handle = screen.getByTestId('resize-handle-top-left');
        
        // Start touch
        const touchStartEvent = {
            touches: [{clientX: 100, clientY: 50}],
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
        };
        fireEvent.touchStart(handle, touchStartEvent);

        // Simulate touch move on document
        const touchMoveEvent = {
            touches: [{clientX: 110, clientY: 60}],
            preventDefault: jest.fn(),
        };
        fireEvent.touchMove(document, touchMoveEvent);

        expect(mockOnResizeMove).toHaveBeenCalledWith('top-left', {x: 110, y: 60});
    });

    it('handles touch end events to complete resize', () => {
        renderResizeHandles();

        const handle = screen.getByTestId('resize-handle-top-left');
        
        // Start touch
        const touchStartEvent = {
            touches: [{clientX: 100, clientY: 50}],
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
        };
        fireEvent.touchStart(handle, touchStartEvent);

        // End touch
        const touchEndEvent = {
            preventDefault: jest.fn(),
        };
        fireEvent.touchEnd(document, touchEndEvent);

        expect(mockOnResizeEnd).toHaveBeenCalledWith('top-left');
    });

    it('prevents scrolling during touch resize operations', () => {
        renderResizeHandles();

        const handle = screen.getByTestId('resize-handle-top-left');
        
        // Start touch
        fireEvent.touchStart(handle, {
            touches: [{clientX: 100, clientY: 50}],
        });

        // Check that touch-action is disabled
        expect(document.body.style.touchAction).toBe('none');
    });

    it('restores scrolling after touch resize completes', () => {
        renderResizeHandles();

        const handle = screen.getByTestId('resize-handle-top-left');
        
        // Start and end touch
        fireEvent.touchStart(handle, {
            touches: [{clientX: 100, clientY: 50}],
        });
        fireEvent.touchEnd(document);

        // Check that touch-action is restored
        expect(document.body.style.touchAction).toBe('');
    });

    it('provides touch feedback with larger scale on touch start', () => {
        renderResizeHandles();

        const handle = screen.getByTestId('resize-handle-top-left');
        
        // Simulate touch start
        fireEvent.touchStart(handle, {
            touches: [{clientX: 100, clientY: 50}],
        });

        // Check that touch feedback is applied (scale 1.2)
        expect(handle.style.transform).toBe('scale(1.2)');
    });

    it('handles touch cancel events properly', () => {
        renderResizeHandles();

        const handle = screen.getByTestId('resize-handle-top-left');
        
        // Start touch
        const touchStartEvent = {
            touches: [{clientX: 100, clientY: 50}],
            preventDefault: jest.fn(),
            stopPropagation: jest.fn(),
        };
        fireEvent.touchStart(handle, touchStartEvent);

        // Cancel touch
        const touchCancelEvent = {
            preventDefault: jest.fn(),
        };
        fireEvent.touchCancel(document, touchCancelEvent);

        expect(mockOnResizeEnd).toHaveBeenCalledWith('top-left');
    });
});
