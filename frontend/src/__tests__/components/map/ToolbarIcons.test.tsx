import React from 'react';
import {render, screen} from '@testing-library/react';
import {ToolbarPipelineIcon, ToolbarAnchorIcon} from '../../../components/map/ToolbarIconWrappers';
import {Plain} from '../../../constants/mapstyles';

describe('Toolbar Icons', () => {
    const mockOnClick = jest.fn();
    const testId = 'test-icon';

    beforeEach(() => {
        mockOnClick.mockClear();
    });

    describe('PipelineIcon', () => {
        it('renders correctly with hideLabel=true', () => {
            render(<ToolbarPipelineIcon id={testId} mapStyleDefs={Plain} onClick={mockOnClick} />);

            // The SVG should be rendered
            const svgElement = document.querySelector('svg');
            expect(svgElement).toBeInTheDocument();

            // The icon should have the correct dimensions
            expect(svgElement).toHaveAttribute('width', '50px');
            expect(svgElement).toHaveAttribute('height', '40px');
        });
    });

    describe('AnchorIcon', () => {
        it('renders correctly with hideLabel=true', () => {
            render(<ToolbarAnchorIcon id={testId} mapStyleDefs={Plain} onClick={mockOnClick} />);

            // The SVG should be rendered
            const svgElement = document.querySelector('svg');
            expect(svgElement).toBeInTheDocument();

            // The icon should have the correct dimensions
            expect(svgElement).toHaveAttribute('width', '50px');
            expect(svgElement).toHaveAttribute('height', '40px');
        });
    });
});
