import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import ResizePreview from '../../../components/map/ResizePreview';
import {PSTBounds, PSTType} from '../../../types/map/pst';
import {MapTheme} from '../../../types/map/styles';

// Mock map style definitions
const mockMapStyleDefs: MapTheme = {
    component: {
        stroke: '#000',
        fill: '#fff',
    },
    subComponent: {
        stroke: '#000',
        fill: '#fff',
    },
    text: {
        stroke: '#000',
        fill: '#000',
    },
    smallText: {
        stroke: '#000',
        fill: '#000',
    },
    line: {
        stroke: '#000',
        fill: '#000',
    },
    flow: {
        stroke: '#000',
        fill: '#000',
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

// Mock bounds for testing
const mockOriginalBounds: PSTBounds = {
    x: 100,
    y: 50,
    width: 150,
    height: 80,
};

const mockPreviewBounds: PSTBounds = {
    x: 90,
    y: 40,
    width: 170,
    height: 100,
};

// Default props for testing
const defaultProps = {
    isActive: true,
    originalBounds: mockOriginalBounds,
    previewBounds: mockPreviewBounds,
    pstType: 'pioneers' as PSTType,
    mapStyleDefs: mockMapStyleDefs,
};

describe('ResizePreview', () => {
    it('should not render when isActive is false', () => {
        const {container} = render(
            <svg>
                <ResizePreview {...defaultProps} isActive={false} />
            </svg>,
        );

        expect(container.querySelector('[data-testid="resize-preview"]')).not.toBeInTheDocument();
    });

    it('should render preview elements when active', () => {
        render(
            <svg>
                <ResizePreview {...defaultProps} />
            </svg>,
        );

        expect(screen.getByTestId('resize-preview')).toBeInTheDocument();
        expect(screen.getByTestId('original-bounds-outline')).toBeInTheDocument();
        expect(screen.getByTestId('preview-bounds')).toBeInTheDocument();
        expect(screen.getByTestId('preview-label')).toBeInTheDocument();
        expect(screen.getByTestId('dimension-indicators')).toBeInTheDocument();
    });

    it('should display correct PST type label', () => {
        render(
            <svg>
                <ResizePreview {...defaultProps} pstType="pioneers" />
            </svg>,
        );

        expect(screen.getByText('Pioneers')).toBeInTheDocument();
    });

    it('should display correct label for different PST types', () => {
        const {rerender} = render(
            <svg>
                <ResizePreview {...defaultProps} pstType="settlers" />
            </svg>,
        );

        expect(screen.getByText('Settlers')).toBeInTheDocument();

        rerender(
            <svg>
                <ResizePreview {...defaultProps} pstType="townplanners" />
            </svg>,
        );

        expect(screen.getByText('Town Planners')).toBeInTheDocument();
    });

    it('should apply correct colors for different PST types', () => {
        const {rerender} = render(
            <svg>
                <ResizePreview {...defaultProps} pstType="pioneers" />
            </svg>,
        );

        const previewBounds = screen.getByTestId('preview-bounds');
        expect(previewBounds).toHaveAttribute('stroke', '#3ccaf8');
        expect(previewBounds).toHaveAttribute('fill', '#3ccaf8');

        rerender(
            <svg>
                <ResizePreview {...defaultProps} pstType="settlers" />
            </svg>,
        );

        const settlersPreviewBounds = screen.getByTestId('preview-bounds');
        expect(settlersPreviewBounds).toHaveAttribute('stroke', '#599afa');
        expect(settlersPreviewBounds).toHaveAttribute('fill', '#599afa');

        rerender(
            <svg>
                <ResizePreview {...defaultProps} pstType="townplanners" />
            </svg>,
        );

        const townplannersPreviewBounds = screen.getByTestId('preview-bounds');
        expect(townplannersPreviewBounds).toHaveAttribute('stroke', '#936ff9');
        expect(townplannersPreviewBounds).toHaveAttribute('fill', '#936ff9');
    });

    it('should position original bounds outline correctly', () => {
        render(
            <svg>
                <ResizePreview {...defaultProps} />
            </svg>,
        );

        const originalOutline = screen.getByTestId('original-bounds-outline');
        expect(originalOutline).toHaveAttribute('x', '100');
        expect(originalOutline).toHaveAttribute('y', '50');
        expect(originalOutline).toHaveAttribute('width', '150');
        expect(originalOutline).toHaveAttribute('height', '80');
    });

    it('should position preview bounds correctly', () => {
        render(
            <svg>
                <ResizePreview {...defaultProps} />
            </svg>,
        );

        const previewBounds = screen.getByTestId('preview-bounds');
        expect(previewBounds).toHaveAttribute('x', '90');
        expect(previewBounds).toHaveAttribute('y', '40');
        expect(previewBounds).toHaveAttribute('width', '170');
        expect(previewBounds).toHaveAttribute('height', '100');
    });

    it('should display dimension indicators with correct values', () => {
        render(
            <svg>
                <ResizePreview {...defaultProps} />
            </svg>,
        );

        expect(screen.getByText('170px')).toBeInTheDocument(); // Width
        expect(screen.getByText('100px')).toBeInTheDocument(); // Height
    });

    it('should show constraint violation indicator when hasConstraintViolation is true', () => {
        render(
            <svg>
                <ResizePreview {...defaultProps} hasConstraintViolation={true} />
            </svg>,
        );

        expect(screen.getByTestId('constraint-violation-indicator')).toBeInTheDocument();
        expect(screen.getByText('!')).toBeInTheDocument();
    });

    it('should not show constraint violation indicator when hasConstraintViolation is false', () => {
        render(
            <svg>
                <ResizePreview {...defaultProps} hasConstraintViolation={false} />
            </svg>,
        );

        expect(screen.queryByTestId('constraint-violation-indicator')).not.toBeInTheDocument();
    });

    it('should apply constraint violation styling when hasConstraintViolation is true', () => {
        render(
            <svg>
                <ResizePreview {...defaultProps} hasConstraintViolation={true} />
            </svg>,
        );

        const previewBounds = screen.getByTestId('preview-bounds');
        expect(previewBounds).toHaveAttribute('stroke', '#FF4444');
        expect(previewBounds).toHaveAttribute('fill', '#FF4444');
        // Check for stroke-dasharray attribute (React converts strokeDasharray to stroke-dasharray)
        expect(previewBounds).toHaveAttribute('stroke-dasharray', '3,3');
    });

    it('should apply normal styling when hasConstraintViolation is false', () => {
        render(
            <svg>
                <ResizePreview {...defaultProps} hasConstraintViolation={false} />
            </svg>,
        );

        const previewBounds = screen.getByTestId('preview-bounds');
        expect(previewBounds).toHaveAttribute('stroke', '#3ccaf8'); // Pioneers color
        // Check for stroke-dasharray attribute (React converts strokeDasharray to stroke-dasharray)
        expect(previewBounds).toHaveAttribute('stroke-dasharray', '5,5');
    });

    it('should have proper accessibility attributes', () => {
        render(
            <svg>
                <ResizePreview {...defaultProps} />
            </svg>,
        );

        const resizePreview = screen.getByTestId('resize-preview');
        expect(resizePreview).toHaveAttribute('role', 'img');
        expect(resizePreview).toHaveAttribute('aria-label', 'Resizing Pioneers box preview');
    });

    it('should update aria-label for different PST types', () => {
        const {rerender} = render(
            <svg>
                <ResizePreview {...defaultProps} pstType="settlers" />
            </svg>,
        );

        expect(screen.getByTestId('resize-preview')).toHaveAttribute('aria-label', 'Resizing Settlers box preview');

        rerender(
            <svg>
                <ResizePreview {...defaultProps} pstType="townplanners" />
            </svg>,
        );

        expect(screen.getByTestId('resize-preview')).toHaveAttribute('aria-label', 'Resizing Town Planners box preview');
    });

    it('should handle edge case with zero dimensions', () => {
        const zeroBounds: PSTBounds = {
            x: 100,
            y: 50,
            width: 0,
            height: 0,
        };

        render(
            <svg>
                <ResizePreview {...defaultProps} previewBounds={zeroBounds} />
            </svg>,
        );

        const dimensionTexts = screen.getAllByText('0px');
        expect(dimensionTexts).toHaveLength(2); // Both width and height should show 0px
    });

    it('should handle very large dimensions', () => {
        const largeBounds: PSTBounds = {
            x: 0,
            y: 0,
            width: 9999,
            height: 8888,
        };

        render(
            <svg>
                <ResizePreview {...defaultProps} previewBounds={largeBounds} />
            </svg>,
        );

        expect(screen.getByText('9999px')).toBeInTheDocument();
        expect(screen.getByText('8888px')).toBeInTheDocument();
    });

    it('should handle negative coordinates', () => {
        const negativeBounds: PSTBounds = {
            x: -50,
            y: -30,
            width: 100,
            height: 80,
        };

        render(
            <svg>
                <ResizePreview {...defaultProps} previewBounds={negativeBounds} />
            </svg>,
        );

        const previewBounds = screen.getByTestId('preview-bounds');
        expect(previewBounds).toHaveAttribute('x', '-50');
        expect(previewBounds).toHaveAttribute('y', '-30');
    });

    it('should position label at center of preview bounds', () => {
        const customBounds: PSTBounds = {
            x: 200,
            y: 100,
            width: 300,
            height: 200,
        };

        render(
            <svg>
                <ResizePreview {...defaultProps} previewBounds={customBounds} />
            </svg>,
        );

        const label = screen.getByTestId('preview-label');
        expect(label).toHaveAttribute('x', '350'); // 200 + 300/2
        expect(label).toHaveAttribute('y', '200'); // 100 + 200/2
    });

    it('should include CSS animations in the component', () => {
        render(
            <svg>
                <ResizePreview {...defaultProps} />
            </svg>,
        );

        const styleElement = document.querySelector('style');
        expect(styleElement).toBeInTheDocument();
        expect(styleElement?.textContent).toContain('resizePreviewPulse');
        expect(styleElement?.textContent).toContain('constraintViolationPulse');
    });
});
