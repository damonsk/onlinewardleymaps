import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import DrawingPreview from '../../../components/map/DrawingPreview';
import {ToolbarSubItem} from '../../../types/toolbar';
import {MapTheme} from '../../../types/map/styles';

describe('PST Drawing Preview', () => {
    const mockMapStyleDefs: MapTheme = {
        className: 'wardley',
        fontFamily: 'Arial, sans-serif',
        component: {
            stroke: '#000000',
            fill: '#ffffff',
        },
        annotation: {
            stroke: '#000000',
            fill: '#ffffff',
        },
        note: {
            stroke: '#000000',
            fill: '#ffffff',
        },
        attitudes: {
            stroke: '#000000',
            fill: '#ffffff',
        },
        methods: {
            stroke: '#000000',
            fill: '#ffffff',
        },
    };

    const pioneersType: ToolbarSubItem = {
        id: 'pioneers',
        label: 'Pioneers',
        color: '#FF6B6B',
        template: (maturity1: string, visibilityHigh: string, maturity2: string, visibilityLow: string) =>
            `pioneers [${visibilityHigh}, ${maturity1}, ${visibilityLow}, ${maturity2}]`,
    };

    const settlersType: ToolbarSubItem = {
        id: 'settlers',
        label: 'Settlers',
        color: '#4ECDC4',
        template: (maturity1: string, visibilityHigh: string, maturity2: string, visibilityLow: string) =>
            `settlers [${visibilityHigh}, ${maturity1}, ${visibilityLow}, ${maturity2}]`,
    };

    const townplannersType: ToolbarSubItem = {
        id: 'townplanners',
        label: 'Town Planners',
        color: '#45B7D1',
        template: (maturity1: string, visibilityHigh: string, maturity2: string, visibilityLow: string) =>
            `townplanners [${visibilityHigh}, ${maturity1}, ${visibilityLow}, ${maturity2}]`,
    };

    const mapDimensions = {width: 800, height: 600};

    it('should show Pioneers preview with correct color and label', () => {
        render(
            <DrawingPreview
                isDrawing={true}
                startPosition={{x: 0.2, y: 0.3}}
                currentPosition={{x: 0.6, y: 0.7}}
                selectedPSTType={pioneersType}
                mapStyleDefs={mockMapStyleDefs}
                mapDimensions={mapDimensions}
            />,
        );

        // Check that the preview is visible
        expect(screen.getByTestId('drawing-preview')).toBeInTheDocument();
        expect(screen.getByTestId('preview-rectangle')).toBeInTheDocument();
        expect(screen.getByTestId('drawing-label')).toBeInTheDocument();

        // Check that the label shows the correct PST type
        expect(screen.getByText('Pioneers')).toBeInTheDocument();
    });

    it('should show Settlers preview with correct color and label', () => {
        render(
            <DrawingPreview
                isDrawing={true}
                startPosition={{x: 0.1, y: 0.2}}
                currentPosition={{x: 0.5, y: 0.6}}
                selectedPSTType={settlersType}
                mapStyleDefs={mockMapStyleDefs}
                mapDimensions={mapDimensions}
            />,
        );

        // Check that the preview is visible
        expect(screen.getByTestId('drawing-preview')).toBeInTheDocument();
        expect(screen.getByText('Settlers')).toBeInTheDocument();
    });

    it('should show Town Planners preview with correct color and label', () => {
        render(
            <DrawingPreview
                isDrawing={true}
                startPosition={{x: 0.3, y: 0.4}}
                currentPosition={{x: 0.7, y: 0.8}}
                selectedPSTType={townplannersType}
                mapStyleDefs={mockMapStyleDefs}
                mapDimensions={mapDimensions}
            />,
        );

        // Check that the preview is visible
        expect(screen.getByTestId('drawing-preview')).toBeInTheDocument();
        expect(screen.getByText('Town Planners')).toBeInTheDocument();
    });

    it('should convert map coordinates to SVG coordinates correctly', () => {
        render(
            <DrawingPreview
                isDrawing={true}
                startPosition={{x: 0.0, y: 0.0}} // Bottom-left corner in map coordinates (low visibility)
                currentPosition={{x: 1.0, y: 1.0}} // Top-right corner in map coordinates (high visibility)
                selectedPSTType={pioneersType}
                mapStyleDefs={mockMapStyleDefs}
                mapDimensions={mapDimensions}
            />,
        );

        const rectangle = screen.getByTestId('preview-rectangle');

        // Using PositionCalculator logic with viewBox offset correction:
        // Start: maturityToX(0.0, 800) - 35 = 0 - 35 = -35, visibilityToY(0.0, 600) - 45 = 600 - 45 = 555
        // Current: maturityToX(1.0, 800) - 35 = 800 - 35 = 765, visibilityToY(1.0, 600) - 45 = 0 - 45 = -45
        // Rectangle: x=-35 (min X), y=-45 (min Y), width=800, height=600
        expect(rectangle).toHaveAttribute('x', '-35');
        expect(rectangle).toHaveAttribute('y', '-45');
        expect(rectangle).toHaveAttribute('width', '800');
        expect(rectangle).toHaveAttribute('height', '600');
    });

    it('should handle reverse drawing direction correctly', () => {
        render(
            <DrawingPreview
                isDrawing={true}
                startPosition={{x: 0.8, y: 0.7}} // Start from high maturity, high visibility
                currentPosition={{x: 0.2, y: 0.3}} // End at low maturity, low visibility
                selectedPSTType={pioneersType}
                mapStyleDefs={mockMapStyleDefs}
                mapDimensions={mapDimensions}
            />,
        );

        const rectangle = screen.getByTestId('preview-rectangle');

        // Rectangle should still be positioned correctly using PositionCalculator with viewBox offset
        // Start: maturityToX(0.8, 800) - 35 = 640 - 35 = 605, visibilityToY(0.7, 600) - 45 = 180 - 45 = 135
        // Current: maturityToX(0.2, 800) - 35 = 160 - 35 = 125, visibilityToY(0.3, 600) - 45 = 420 - 45 = 375
        // Rectangle: x=125 (min X), y=135 (min Y), width=480, height=240
        expect(rectangle).toHaveAttribute('x', '125');
        const yValue = parseFloat(rectangle.getAttribute('y') || '0');
        expect(yValue).toBeCloseTo(135, 1);

        // Width and height should be positive and match expected values
        const width = parseFloat(rectangle.getAttribute('width') || '0');
        const height = parseFloat(rectangle.getAttribute('height') || '0');
        expect(width).toBeCloseTo(480, 1);
        expect(height).toBeCloseTo(240, 1);
        expect(width).toBeGreaterThan(0);
        expect(height).toBeGreaterThan(0);
    });

    it('should not render when rectangle is too small', () => {
        render(
            <DrawingPreview
                isDrawing={true}
                startPosition={{x: 0.5, y: 0.5}}
                currentPosition={{x: 0.501, y: 0.501}} // Very small difference
                selectedPSTType={pioneersType}
                mapStyleDefs={mockMapStyleDefs}
                mapDimensions={mapDimensions}
            />,
        );

        // Should not render because the rectangle is too small
        expect(screen.queryByTestId('drawing-preview')).not.toBeInTheDocument();
    });

    it('should show preview with pulsing animation', () => {
        render(
            <DrawingPreview
                isDrawing={true}
                startPosition={{x: 0.2, y: 0.3}}
                currentPosition={{x: 0.6, y: 0.7}}
                selectedPSTType={pioneersType}
                mapStyleDefs={mockMapStyleDefs}
                mapDimensions={mapDimensions}
            />,
        );

        const rectangle = screen.getByTestId('preview-rectangle');

        // Check that the rectangle has the pulsing animation styles
        const computedStyle = window.getComputedStyle(rectangle);
        expect(computedStyle.animation).toContain('drawingPulse');
    });
});
