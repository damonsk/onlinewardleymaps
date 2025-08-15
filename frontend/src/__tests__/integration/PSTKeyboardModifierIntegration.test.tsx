/**
 * Integration tests for PST keyboard modifier functionality
 * Tests Shift key (aspect ratio) and Alt key (resize from center) support
 */

import React from 'react';
import {render, screen, fireEvent, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import PSTBox from '../../components/map/PSTBox';
import {PSTElement, ResizeHandle} from '../../types/map/pst';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';

// Mock the coordinate utilities
jest.mock('../../utils/pstCoordinateUtils', () => ({
    convertPSTCoordinatesToBounds: jest.fn(() => ({
        x: 100,
        y: 100,
        width: 200,
        height: 100,
    })),
    calculateResizedBounds: jest.fn((originalBounds, handle, deltaX, deltaY, constraints, mapDimensions, modifiers) => ({
        x: originalBounds.x + (modifiers?.resizeFromCenter ? -deltaX / 2 : handle.includes('left') ? deltaX : 0),
        y: originalBounds.y + (modifiers?.resizeFromCenter ? -deltaY / 2 : handle.includes('top') ? deltaY : 0),
        width:
            originalBounds.width +
            (modifiers?.resizeFromCenter ? Math.abs(deltaX) : handle.includes('right') ? deltaX : handle.includes('left') ? -deltaX : 0),
        height:
            originalBounds.height +
            (modifiers?.resizeFromCenter ? Math.abs(deltaY) : handle.includes('bottom') ? deltaY : handle.includes('top') ? -deltaY : 0),
    })),
    constrainPSTBounds: jest.fn(bounds => bounds),
}));

describe('PST Keyboard Modifier Integration', () => {
    const mockMapDimensions: MapDimensions = {
        width: 800,
        height: 600,
    };

    const mockMapStyleDefs: MapTheme = {
        attitudes: {
            pioneers: {
                fill: '#FF6B6B',
                stroke: '#FF6B6B',
                fillOpacity: 0.6,
                strokeOpacity: 0.8,
            },
        },
    } as MapTheme;

    const mockPSTElement: PSTElement = {
        id: 'test-pst-1',
        type: 'pioneers',
        coordinates: {
            maturity1: 0.2,
            visibility1: 0.8,
            maturity2: 0.4,
            visibility2: 0.6,
        },
        line: 1,
        name: 'Test PST',
    };

    const defaultProps = {
        pstElement: mockPSTElement,
        mapDimensions: mockMapDimensions,
        mapStyleDefs: mockMapStyleDefs,
        scaleFactor: 1,
        isHovered: true,
        isResizing: false,
        onResizeStart: jest.fn(),
        onResizeMove: jest.fn(),
        onResizeEnd: jest.fn(),
        onHover: jest.fn(),
        mutateMapText: jest.fn(),
        mapText: 'pioneers [0.8, 0.2] [0.6, 0.4]',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should show visual feedback when maintainAspectRatio modifier is active', () => {
        render(
            <svg>
                <PSTBox {...defaultProps} keyboardModifiers={{maintainAspectRatio: true, resizeFromCenter: false}} />
            </svg>,
        );

        // Check that resize handles have modified styling
        const resizeHandle = screen.getByTestId('resize-handle-bottom-right');
        expect(resizeHandle).toHaveAttribute('fill', '#FFC107');
        expect(resizeHandle).toHaveAttribute('stroke', '#FF8F00');
        expect(resizeHandle).toHaveAttribute('stroke-width', '2');

        // Check for modifier indicator text
        expect(screen.getByText('Shift: Aspect Ratio')).toBeInTheDocument();
    });

    it('should show visual feedback when resizeFromCenter modifier is active', () => {
        render(
            <svg>
                <PSTBox {...defaultProps} keyboardModifiers={{maintainAspectRatio: false, resizeFromCenter: true}} />
            </svg>,
        );

        // Check that resize handles have modified styling
        const resizeHandle = screen.getByTestId('resize-handle-bottom-right');
        expect(resizeHandle).toHaveAttribute('fill', '#FFC107');
        expect(resizeHandle).toHaveAttribute('stroke', '#FF8F00');
        expect(resizeHandle).toHaveAttribute('stroke-width', '2');

        // Check for modifier indicator text
        expect(screen.getByText('Alt: Resize from Center')).toBeInTheDocument();
    });

    it('should show both modifiers when both are active', () => {
        render(
            <svg>
                <PSTBox {...defaultProps} keyboardModifiers={{maintainAspectRatio: true, resizeFromCenter: true}} />
            </svg>,
        );

        // Check for both modifier indicator texts
        expect(screen.getByText('Shift: Aspect Ratio')).toBeInTheDocument();
        expect(screen.getByText('Alt: Resize from Center')).toBeInTheDocument();

        // Check that resize handles have modified styling
        const resizeHandle = screen.getByTestId('resize-handle-bottom-right');
        expect(resizeHandle).toHaveAttribute('fill', '#FFC107');
        expect(resizeHandle).toHaveAttribute('stroke', '#FF8F00');
        expect(resizeHandle).toHaveAttribute('stroke-width', '2');
    });

    it('should not show modifier indicators when no modifiers are active', () => {
        render(
            <svg>
                <PSTBox {...defaultProps} keyboardModifiers={{maintainAspectRatio: false, resizeFromCenter: false}} />
            </svg>,
        );

        // Check that modifier texts are not present
        expect(screen.queryByText('Shift: Aspect Ratio')).not.toBeInTheDocument();
        expect(screen.queryByText('Alt: Resize from Center')).not.toBeInTheDocument();

        // Check that resize handles have default styling
        const resizeHandle = screen.getByTestId('resize-handle-bottom-right');
        expect(resizeHandle).toHaveAttribute('fill', '#ffffff');
        expect(resizeHandle).toHaveAttribute('stroke', '#666666');
        expect(resizeHandle).toHaveAttribute('stroke-width', '1');
    });

    it('should pass keyboard modifiers to resize handlers', () => {
        const onResizeMove = jest.fn();

        render(
            <svg>
                <PSTBox
                    {...defaultProps}
                    onResizeMove={onResizeMove}
                    keyboardModifiers={{maintainAspectRatio: true, resizeFromCenter: true}}
                />
            </svg>,
        );

        const resizeHandle = screen.getByTestId('resize-handle-bottom-right');

        // Simulate resize start
        fireEvent.mouseDown(resizeHandle, {clientX: 300, clientY: 200});

        // Simulate resize move
        act(() => {
            fireEvent.mouseMove(document, {clientX: 320, clientY: 220});
        });

        // Verify that resize move handler was called
        expect(onResizeMove).toHaveBeenCalledWith('bottom-right', {x: 320, y: 220});
    });

    it('should handle keyboard modifier changes during resize operation', () => {
        const {rerender} = render(
            <svg>
                <PSTBox {...defaultProps} isResizing={true} keyboardModifiers={{maintainAspectRatio: false, resizeFromCenter: false}} />
            </svg>,
        );

        // Initially no modifiers
        expect(screen.queryByText('Shift: Aspect Ratio')).not.toBeInTheDocument();

        // Update with Shift modifier
        rerender(
            <svg>
                <PSTBox {...defaultProps} isResizing={true} keyboardModifiers={{maintainAspectRatio: true, resizeFromCenter: false}} />
            </svg>,
        );

        // Should now show Shift modifier
        expect(screen.getByText('Shift: Aspect Ratio')).toBeInTheDocument();
        expect(screen.queryByText('Alt: Resize from Center')).not.toBeInTheDocument();

        // Update with both modifiers
        rerender(
            <svg>
                <PSTBox {...defaultProps} isResizing={true} keyboardModifiers={{maintainAspectRatio: true, resizeFromCenter: true}} />
            </svg>,
        );

        // Should show both modifiers
        expect(screen.getByText('Shift: Aspect Ratio')).toBeInTheDocument();
        expect(screen.getByText('Alt: Resize from Center')).toBeInTheDocument();
    });

    it('should position modifier indicators relative to PST box bounds', () => {
        render(
            <svg>
                <PSTBox {...defaultProps} keyboardModifiers={{maintainAspectRatio: true, resizeFromCenter: false}} />
            </svg>,
        );

        // Find the modifier indicator background
        const modifierBackground = screen.getByText('Shift: Aspect Ratio').previousElementSibling;

        // Should be positioned relative to the PST box (bounds.x + bounds.width + 10)
        // Mock bounds are x: 100, width: 200, so indicator should be at x: 310
        expect(modifierBackground).toHaveAttribute('x', '310');
    });
});
