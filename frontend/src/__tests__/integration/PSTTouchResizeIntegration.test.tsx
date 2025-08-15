import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import ResizeHandles from '../../components/map/ResizeHandles';
import {PSTBounds} from '../../types/map/pst';
import {MapTheme} from '../../types/map/styles';

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

describe('PST Touch Resize Integration', () => {
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

    it('should detect touch device and use larger handles', () => {
        const mockOnResizeStart = jest.fn();
        const mockOnResizeMove = jest.fn();
        const mockOnResizeEnd = jest.fn();

        render(
            <svg>
                <ResizeHandles
                    bounds={mockBounds}
                    isVisible={true}
                    onResizeStart={mockOnResizeStart}
                    onResizeMove={mockOnResizeMove}
                    onResizeEnd={mockOnResizeEnd}
                    scaleFactor={1}
                    mapStyleDefs={mockMapTheme}
                />
            </svg>,
        );

        const handle = screen.getByTestId('resize-handle-top-left');
        // Touch devices should use 16px base size
        expect(handle).toHaveAttribute('width', '16');
        expect(handle).toHaveAttribute('height', '16');
    });

    it('should handle basic touch interaction', () => {
        const mockOnResizeStart = jest.fn();
        const mockOnResizeMove = jest.fn();
        const mockOnResizeEnd = jest.fn();

        render(
            <svg>
                <ResizeHandles
                    bounds={mockBounds}
                    isVisible={true}
                    onResizeStart={mockOnResizeStart}
                    onResizeMove={mockOnResizeMove}
                    onResizeEnd={mockOnResizeEnd}
                    scaleFactor={1}
                    mapStyleDefs={mockMapTheme}
                />
            </svg>,
        );

        const handle = screen.getByTestId('resize-handle-top-left');

        // Test that touch events don't throw errors
        expect(() => {
            fireEvent.touchStart(handle, {
                touches: [{clientX: 100, clientY: 50}],
            });
        }).not.toThrow();

        // Test that touch action is disabled during drag
        expect(document.body.style.touchAction).toBe('none');
    });

    it('should prevent default touch behavior', () => {
        const mockOnResizeStart = jest.fn();
        const mockOnResizeMove = jest.fn();
        const mockOnResizeEnd = jest.fn();

        render(
            <svg>
                <ResizeHandles
                    bounds={mockBounds}
                    isVisible={true}
                    onResizeStart={mockOnResizeStart}
                    onResizeMove={mockOnResizeMove}
                    onResizeEnd={mockOnResizeEnd}
                    scaleFactor={1}
                    mapStyleDefs={mockMapTheme}
                />
            </svg>,
        );

        const handle = screen.getByTestId('resize-handle-top-left');

        // Create a mock touch event with preventDefault
        const preventDefault = jest.fn();
        const stopPropagation = jest.fn();

        fireEvent.touchStart(handle, {
            touches: [{clientX: 100, clientY: 50}],
            preventDefault,
            stopPropagation,
        });

        // The event handlers should be called (even if the callbacks aren't)
        expect(preventDefault).toHaveBeenCalled();
        expect(stopPropagation).toHaveBeenCalled();
    });
});
