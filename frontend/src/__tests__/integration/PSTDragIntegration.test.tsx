/**
 * Integration tests for PST drag functionality with map text mutation
 */

import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import PSTContainer from '../../components/map/PSTContainer';
import {PSTElement} from '../../types/map/pst';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import {extractPSTElementsFromMapText} from '../../utils/pstMapTextMutation';

// Mock the coordinate utilities with realistic implementations
jest.mock('../../utils/pstCoordinateUtils', () => ({
    convertPSTCoordinatesToBounds: jest.fn((coordinates, mapDimensions) => ({
        x: coordinates.maturity1 * mapDimensions.width,
        y: (1 - coordinates.visibility1) * mapDimensions.height,
        width: (coordinates.maturity2 - coordinates.maturity1) * mapDimensions.width,
        height: (coordinates.visibility1 - coordinates.visibility2) * mapDimensions.height,
    })),
    convertBoundsToPSTCoordinates: jest.fn((bounds, mapDimensions) => ({
        maturity1: bounds.x / mapDimensions.width,
        visibility1: 1 - bounds.y / mapDimensions.height,
        maturity2: (bounds.x + bounds.width) / mapDimensions.width,
        visibility2: 1 - (bounds.y + bounds.height) / mapDimensions.height,
    })),
    constrainPSTBounds: jest.fn((bounds) => bounds),
    calculateResizedBounds: jest.fn((originalBounds, handle, deltaX, deltaY) => {
        // Simple mock implementation for resize bounds calculation
        let {x, y, width, height} = originalBounds;
        
        switch (handle) {
            case 'top-right':
                y += deltaY;
                width += deltaX;
                height -= deltaY;
                break;
            case 'bottom-right':
                width += deltaX;
                height += deltaY;
                break;
            // Add other handles as needed
            default:
                break;
        }
        
        return {x, y, width, height};
    }),
}));

describe('PST Drag Integration', () => {
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

    const sampleMapText = `title Test Map
pioneers [0.80, 0.10, 0.60, 0.30] Test Pioneers
settlers [0.70, 0.20, 0.50, 0.40] Test Settlers
townplanners [0.60, 0.30, 0.40, 0.50] Test Town Planners`;

    let mockOnMapTextUpdate: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnMapTextUpdate = jest.fn();
    });

    it('should complete full drag workflow and update map text', async () => {
        // Extract PST elements from sample map text
        const pstElements = extractPSTElementsFromMapText(sampleMapText);
        expect(pstElements).toHaveLength(3);

        render(
            <svg>
                <PSTContainer
                    pstElements={pstElements}
                    mapDimensions={mockMapDimensions}
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                    mapText={sampleMapText}
                    onMapTextUpdate={mockOnMapTextUpdate}
                />
            </svg>,
        );

        // Find the pioneers PST box
        const pioneersBox = screen.getByTestId('pst-box-pst-pioneers-1');
        expect(pioneersBox).toBeInTheDocument();

        // Find the main rectangle (not the resize handles)
        const pioneersRect = screen.getByTestId('pst-box-rect-pst-pioneers-1');
        expect(pioneersRect).toBeInTheDocument();

        // Start drag operation on the main rectangle
        fireEvent.mouseDown(pioneersRect, {
            clientX: 100,
            clientY: 100,
        });

        // Simulate mouse move during drag
        fireEvent.mouseMove(document, {
            clientX: 150,
            clientY: 120,
        });

        // End drag operation
        fireEvent.mouseUp(document, {
            clientX: 150,
            clientY: 120,
        });

        // Wait for map text update
        await waitFor(() => {
            expect(mockOnMapTextUpdate).toHaveBeenCalled();
        });

        // Verify that map text was updated with new coordinates
        const updatedMapText = mockOnMapTextUpdate.mock.calls[0][0];
        expect(updatedMapText).toContain('pioneers');
        expect(updatedMapText).toContain('Test Pioneers');
        
        // Verify other elements remain unchanged
        expect(updatedMapText).toContain('settlers [0.70, 0.20, 0.50, 0.40] Test Settlers');
        expect(updatedMapText).toContain('townplanners [0.60, 0.30, 0.40, 0.50] Test Town Planners');
    });

    it('should show drag preview during drag operation', async () => {
        const pstElements = extractPSTElementsFromMapText(sampleMapText);

        render(
            <svg>
                <PSTContainer
                    pstElements={pstElements}
                    mapDimensions={mockMapDimensions}
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                    mapText={sampleMapText}
                    onMapTextUpdate={mockOnMapTextUpdate}
                />
            </svg>,
        );

        const pioneersRect = screen.getByTestId('pst-box-rect-pst-pioneers-1');
        
        // Start drag
        fireEvent.mouseDown(pioneersRect, {
            clientX: 200,
            clientY: 200,
        });

        // Move mouse to drag
        fireEvent.mouseMove(document, {
            clientX: 250,
            clientY: 250,
        });

        // Check that drag preview is shown (the container should exist)
        const container = screen.getByTestId('pst-box-pst-pioneers-1').closest('.pst-container');
        expect(container).toBeInTheDocument();

        // End drag
        fireEvent.mouseUp(document);

        await waitFor(() => {
            expect(mockOnMapTextUpdate).toHaveBeenCalled();
        });
    });

    it('should not start drag during resize operation', async () => {
        const pstElements = extractPSTElementsFromMapText(sampleMapText);

        render(
            <svg>
                <PSTContainer
                    pstElements={pstElements}
                    mapDimensions={mockMapDimensions}
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                    mapText={sampleMapText}
                    onMapTextUpdate={mockOnMapTextUpdate}
                />
            </svg>,
        );

        // Hover over the PST box to show resize handles
        const pioneersBox = screen.getByTestId('pst-box-pst-pioneers-1');
        fireEvent.mouseEnter(pioneersBox);

        await waitFor(() => {
            expect(screen.getByTestId('resize-handles')).toBeInTheDocument();
        });

        // Start resize operation first
        const topRightHandle = screen.getByTestId('resize-handle-top-right');
        fireEvent.mouseDown(topRightHandle, {
            clientX: 100,
            clientY: 100,
        });

        // Try to start drag on main rectangle (should be ignored)
        const pioneersRect = screen.getByTestId('pst-box-rect-pst-pioneers-1');
        fireEvent.mouseDown(pioneersRect, {
            clientX: 200,
            clientY: 200,
        });

        // Complete resize operation
        fireEvent.mouseMove(document, {
            clientX: 120,
            clientY: 80,
        });
        fireEvent.mouseUp(document);

        // Should only have one map text update (from resize, not drag)
        await waitFor(() => {
            expect(mockOnMapTextUpdate).toHaveBeenCalledTimes(1);
        });
    });

    it('should handle multiple PST elements drag independently', async () => {
        const pstElements = extractPSTElementsFromMapText(sampleMapText);

        render(
            <svg>
                <PSTContainer
                    pstElements={pstElements}
                    mapDimensions={mockMapDimensions}
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                    mapText={sampleMapText}
                    onMapTextUpdate={mockOnMapTextUpdate}
                />
            </svg>,
        );

        // Verify all PST elements are rendered
        expect(screen.getByTestId('pst-box-pst-pioneers-1')).toBeInTheDocument();
        expect(screen.getByTestId('pst-box-pst-settlers-2')).toBeInTheDocument();
        expect(screen.getByTestId('pst-box-pst-townplanners-3')).toBeInTheDocument();

        // Test dragging settlers element
        const settlersRect = screen.getByTestId('pst-box-rect-pst-settlers-2');
        
        // Drag settlers
        fireEvent.mouseDown(settlersRect, {clientX: 300, clientY: 300});
        fireEvent.mouseMove(document, {clientX: 350, clientY: 320});
        fireEvent.mouseUp(document);

        await waitFor(() => {
            expect(mockOnMapTextUpdate).toHaveBeenCalled();
        });

        // Verify only settlers line was updated
        const updatedMapText = mockOnMapTextUpdate.mock.calls[0][0];
        expect(updatedMapText).toContain('settlers');
        expect(updatedMapText).toContain('Test Settlers');
        
        // Other elements should remain unchanged
        expect(updatedMapText).toContain('pioneers [0.80, 0.10, 0.60, 0.30] Test Pioneers');
        expect(updatedMapText).toContain('townplanners [0.60, 0.30, 0.40, 0.50] Test Town Planners');
    });

    it('should preserve PST element names during drag', async () => {
        const pstElements = extractPSTElementsFromMapText(sampleMapText);

        render(
            <svg>
                <PSTContainer
                    pstElements={pstElements}
                    mapDimensions={mockMapDimensions}
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                    mapText={sampleMapText}
                    onMapTextUpdate={mockOnMapTextUpdate}
                />
            </svg>,
        );

        // Drag town planners element (has name)
        const townPlannersRect = screen.getByTestId('pst-box-rect-pst-townplanners-3');
        fireEvent.mouseDown(townPlannersRect, {clientX: 400, clientY: 400});
        fireEvent.mouseMove(document, {clientX: 450, clientY: 420});
        fireEvent.mouseUp(document);

        await waitFor(() => {
            expect(mockOnMapTextUpdate).toHaveBeenCalled();
        });

        // Verify name is preserved
        const updatedMapText = mockOnMapTextUpdate.mock.calls[0][0];
        expect(updatedMapText).toContain('townplanners');
        expect(updatedMapText).toContain('Test Town Planners');
    });

    it('should handle drag cancellation on mouse leave', async () => {
        const pstElements = extractPSTElementsFromMapText(sampleMapText);

        render(
            <svg>
                <PSTContainer
                    pstElements={pstElements}
                    mapDimensions={mockMapDimensions}
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                    mapText={sampleMapText}
                    onMapTextUpdate={mockOnMapTextUpdate}
                />
            </svg>,
        );

        const pioneersRect = screen.getByTestId('pst-box-rect-pst-pioneers-1');
        
        // Start drag
        fireEvent.mouseDown(pioneersRect, {clientX: 100, clientY: 100});
        
        // Move mouse
        fireEvent.mouseMove(document, {clientX: 150, clientY: 120});
        
        // Simulate mouse leave (cancel drag)
        fireEvent.mouseLeave(document);

        // Should still update map text (drag end is called on mouse leave)
        await waitFor(() => {
            expect(mockOnMapTextUpdate).toHaveBeenCalled();
        });
    });
});