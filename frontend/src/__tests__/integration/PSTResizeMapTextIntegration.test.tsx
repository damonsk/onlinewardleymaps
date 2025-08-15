/**
 * Integration tests for PST resize functionality with map text mutation
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
    calculateResizedBounds: jest.fn((originalBounds, handle, deltaX, deltaY) => {
        let {x, y, width, height} = originalBounds;
        
        // Simple resize calculation based on handle
        switch (handle) {
            case 'top-left':
                x += deltaX;
                y += deltaY;
                width -= deltaX;
                height -= deltaY;
                break;
            case 'top-right':
                y += deltaY;
                width += deltaX;
                height -= deltaY;
                break;
            case 'bottom-left':
                x += deltaX;
                width -= deltaX;
                height += deltaY;
                break;
            case 'bottom-right':
                width += deltaX;
                height += deltaY;
                break;
            case 'middle-right':
                width += deltaX;
                break;
            case 'middle-left':
                x += deltaX;
                width -= deltaX;
                break;
            case 'top-center':
                y += deltaY;
                height -= deltaY;
                break;
            case 'bottom-center':
                height += deltaY;
                break;
        }
        
        return {x, y, width, height};
    }),
    constrainPSTBounds: jest.fn((bounds) => bounds),
}));

describe('PST Resize Map Text Integration', () => {
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
component Test Component [0.50, 0.50]
townplanners [0.60, 0.30, 0.40, 0.50] Test Town Planners`;

    let mockOnMapTextUpdate: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockOnMapTextUpdate = jest.fn();
    });

    it('should complete full resize workflow and update map text', async () => {
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

        // Hover over the PST box to show resize handles
        fireEvent.mouseEnter(pioneersBox);

        // Wait for resize handles to appear
        await waitFor(() => {
            expect(screen.getByTestId('resize-handles')).toBeInTheDocument();
        });

        // Find a resize handle
        const topRightHandle = screen.getByTestId('resize-handle-top-right');
        expect(topRightHandle).toBeInTheDocument();

        // Start resize operation
        fireEvent.mouseDown(topRightHandle, {
            clientX: 100,
            clientY: 100,
        });

        // Simulate mouse move during resize
        fireEvent.mouseMove(document, {
            clientX: 120,
            clientY: 80,
        });

        // End resize operation
        fireEvent.mouseUp(document, {
            clientX: 120,
            clientY: 80,
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
        expect(updatedMapText).toContain('component Test Component [0.50, 0.50]');
    });

    it('should show resize preview during drag operation', async () => {
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

        // Hover and start resize
        const pioneersBox = screen.getByTestId('pst-box-pst-pioneers-1');
        fireEvent.mouseEnter(pioneersBox);

        await waitFor(() => {
            expect(screen.getByTestId('resize-handles')).toBeInTheDocument();
        });

        const bottomRightHandle = screen.getByTestId('resize-handle-bottom-right');
        
        // Start resize
        fireEvent.mouseDown(bottomRightHandle, {
            clientX: 200,
            clientY: 200,
        });

        // Move mouse to resize
        fireEvent.mouseMove(document, {
            clientX: 250,
            clientY: 250,
        });

        // Check that resize preview is shown
        const previewContainer = screen.getByTestId('pst-box-pst-pioneers-1').closest('.pst-container');
        expect(previewContainer).toBeInTheDocument();

        // End resize
        fireEvent.mouseUp(document);

        await waitFor(() => {
            expect(mockOnMapTextUpdate).toHaveBeenCalled();
        });
    });

    it('should handle multiple PST elements independently', async () => {
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
        expect(screen.getByTestId('pst-box-pst-townplanners-4')).toBeInTheDocument();

        // Test resizing settlers element
        const settlersBox = screen.getByTestId('pst-box-pst-settlers-2');
        fireEvent.mouseEnter(settlersBox);

        await waitFor(() => {
            expect(screen.getByTestId('resize-handles')).toBeInTheDocument();
        });

        const middleRightHandle = screen.getByTestId('resize-handle-middle-right');
        
        // Resize settlers
        fireEvent.mouseDown(middleRightHandle, {clientX: 300, clientY: 300});
        fireEvent.mouseMove(document, {clientX: 350, clientY: 300});
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

    it('should handle resize errors gracefully', async () => {
        const pstElements = extractPSTElementsFromMapText(sampleMapText);

        // Mock console.error to capture error messages
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        // Create a component that will fail during map text update
        const FailingPSTContainer: React.FC<any> = (props) => {
            const failingOnMapTextUpdate = (newMapText: string) => {
                throw new Error('Map text update failed');
            };
            
            return (
                <PSTContainer
                    {...props}
                    onMapTextUpdate={failingOnMapTextUpdate}
                />
            );
        };

        render(
            <svg>
                <FailingPSTContainer
                    pstElements={pstElements}
                    mapDimensions={mockMapDimensions}
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                    mapText={sampleMapText}
                    onMapTextUpdate={mockOnMapTextUpdate}
                />
            </svg>,
        );

        // Perform resize operation
        const pioneersBox = screen.getByTestId('pst-box-pst-pioneers-1');
        fireEvent.mouseEnter(pioneersBox);

        await waitFor(() => {
            expect(screen.getByTestId('resize-handles')).toBeInTheDocument();
        });

        const topLeftHandle = screen.getByTestId('resize-handle-top-left');
        fireEvent.mouseDown(topLeftHandle, {clientX: 100, clientY: 100});
        fireEvent.mouseMove(document, {clientX: 110, clientY: 110});
        fireEvent.mouseUp(document);

        // Wait for error handling
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Failed to complete PST resize:', expect.any(Error));
            expect(consoleWarnSpy).toHaveBeenCalledWith('Map text was not updated during resize end');
        });

        // Cleanup
        consoleSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    it('should preserve PST element names during resize', async () => {
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

        // Resize town planners element (has name)
        const townPlannersBox = screen.getByTestId('pst-box-pst-townplanners-4');
        fireEvent.mouseEnter(townPlannersBox);

        await waitFor(() => {
            expect(screen.getByTestId('resize-handles')).toBeInTheDocument();
        });

        const bottomCenterHandle = screen.getByTestId('resize-handle-bottom-center');
        fireEvent.mouseDown(bottomCenterHandle, {clientX: 400, clientY: 400});
        fireEvent.mouseMove(document, {clientX: 400, clientY: 450});
        fireEvent.mouseUp(document);

        await waitFor(() => {
            expect(mockOnMapTextUpdate).toHaveBeenCalled();
        });

        // Verify name is preserved
        const updatedMapText = mockOnMapTextUpdate.mock.calls[0][0];
        expect(updatedMapText).toContain('townplanners');
        expect(updatedMapText).toContain('Test Town Planners');
    });

    it('should handle empty PST elements array', () => {
        render(
            <svg>
                <PSTContainer
                    pstElements={[]}
                    mapDimensions={mockMapDimensions}
                    mapStyleDefs={mockMapStyleDefs}
                    scaleFactor={1}
                    mapText=""
                    onMapTextUpdate={mockOnMapTextUpdate}
                />
            </svg>,
        );

        // Should render without errors - check that container exists but no PST boxes
        const container = document.querySelector('.pst-container');
        expect(container).toBeInTheDocument();
        
        // No PST boxes should be present
        const pstBoxes = screen.queryAllByTestId(/pst-box-/);
        expect(pstBoxes).toHaveLength(0);
    });
});