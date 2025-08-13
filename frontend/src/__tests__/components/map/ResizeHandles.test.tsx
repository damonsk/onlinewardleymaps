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
            </svg>
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
        expect(topLeft).toHaveAttribute('x', '96'); // 100 - 4
        expect(topLeft).toHaveAttribute('y', '46'); // 50 - 4

        // Bottom-right should be at bounds end minus offset
        const bottomRight = screen.getByTestId('resize-handle-bottom-right');
        expect(bottomRight).toHaveAttribute('x', '296'); // 100 + 200 - 4
        expect(bottomRight).toHaveAttribute('y', '146'); // 50 + 100 - 4
    });

    it('scales handle size based on scale factor', () => {
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