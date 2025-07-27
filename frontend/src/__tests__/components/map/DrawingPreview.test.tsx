import React from 'react';
import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import DrawingPreview from '../../../components/map/DrawingPreview';
import {ToolbarSubItem} from '../../../types/toolbar';
import {MapTheme} from '../../../types/map/styles';

describe('DrawingPreview', () => {
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

    const mockPSTType: ToolbarSubItem = {
        id: 'pioneers',
        label: 'Pioneers',
        color: '#FF6B6B',
        template: (maturity1: string, visibilityHigh: string, maturity2: string, visibilityLow: string) => 
            `pioneers [${visibilityHigh}, ${maturity1}, ${visibilityLow}, ${maturity2}]`,
    };

    const defaultProps = {
        isDrawing: false,
        startPosition: null,
        currentPosition: {x: 0.5, y: 0.5},
        selectedPSTType: null,
        mapStyleDefs: mockMapStyleDefs,
        mapDimensions: {width: 800, height: 600},
    };

    it('should not render when not drawing', () => {
        const {container} = render(<DrawingPreview {...defaultProps} />);
        expect(container.firstChild).toBeNull();
    });

    it('should not render when startPosition is null', () => {
        const {container} = render(<DrawingPreview {...defaultProps} isDrawing={true} selectedPSTType={mockPSTType} />);
        expect(container.firstChild).toBeNull();
    });

    it('should not render when selectedPSTType is null', () => {
        const {container} = render(<DrawingPreview {...defaultProps} isDrawing={true} startPosition={{x: 50, y: 50}} />);
        expect(container.firstChild).toBeNull();
    });

    it('should render drawing preview when all required props are provided', () => {
        const {container} = render(
            <DrawingPreview
                isDrawing={true}
                startPosition={{x: 0.2, y: 0.2}}
                currentPosition={{x: 0.6, y: 0.6}}
                selectedPSTType={mockPSTType}
                mapStyleDefs={mockMapStyleDefs}
                mapDimensions={{width: 800, height: 600}}
            />,
        );

        // Check that the component renders something
        expect(container.firstChild).not.toBeNull();
    });

    it('should not render if rectangle is too small', () => {
        const {container} = render(
            <DrawingPreview
                isDrawing={true}
                startPosition={{x: 0.5, y: 0.5}}
                currentPosition={{x: 0.51, y: 0.51}} // Very small difference
                selectedPSTType={mockPSTType}
                mapStyleDefs={mockMapStyleDefs}
                mapDimensions={{width: 800, height: 600}}
            />,
        );

        expect(container.firstChild).toBeNull();
    });

    it('should work with different PST types', () => {
        const settlersType: ToolbarSubItem = {
            id: 'settlers',
            label: 'Settlers',
            color: '#4ECDC4',
            template: (maturity1: string, visibilityHigh: string, maturity2: string, visibilityLow: string) => 
                `settlers [${visibilityHigh}, ${maturity1}, ${visibilityLow}, ${maturity2}]`,
        };

        const {container} = render(
            <DrawingPreview
                isDrawing={true}
                startPosition={{x: 0.2, y: 0.2}}
                currentPosition={{x: 0.6, y: 0.6}}
                selectedPSTType={settlersType}
                mapStyleDefs={mockMapStyleDefs}
                mapDimensions={{width: 800, height: 600}}
            />,
        );

        // Check that the component renders something
        expect(container.firstChild).not.toBeNull();
    });

    it('should work with different map themes', () => {
        const darkTheme: MapTheme = {
            className: 'dark',
            fontFamily: 'Arial, sans-serif',
            component: {
                stroke: '#ffffff',
                fill: '#000000',
            },
            annotation: {
                stroke: '#ffffff',
                fill: '#000000',
            },
            note: {
                stroke: '#ffffff',
                fill: '#000000',
            },
            attitudes: {
                stroke: '#ffffff',
                fill: '#000000',
            },
            methods: {
                stroke: '#ffffff',
                fill: '#000000',
            },
        };

        const {container} = render(
            <DrawingPreview
                isDrawing={true}
                startPosition={{x: 0.2, y: 0.2}}
                currentPosition={{x: 0.6, y: 0.6}}
                selectedPSTType={mockPSTType}
                mapStyleDefs={darkTheme}
                mapDimensions={{width: 800, height: 600}}
            />,
        );

        // Check that the component renders something
        expect(container.firstChild).not.toBeNull();
    });

    it('should handle edge cases with coordinate calculation', () => {
        // Test reverse drawing (drag from bottom-right to top-left)
        const {container} = render(
            <DrawingPreview
                isDrawing={true}
                startPosition={{x: 0.8, y: 0.7}}
                currentPosition={{x: 0.3, y: 0.3}}
                selectedPSTType={mockPSTType}
                mapStyleDefs={mockMapStyleDefs}
                mapDimensions={{width: 800, height: 600}}
            />,
        );

        // Should still render when coordinates are reversed
        expect(container.firstChild).not.toBeNull();
    });
});
