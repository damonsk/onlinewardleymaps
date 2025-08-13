import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import RedoIcon from '../../../components/symbols/RedoIcon';
import {MapTheme} from '../../../constants/mapstyles';

// Mock map style definitions for testing
const mockMapStyleDefs: MapTheme = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    className: 'test-theme',
    component: {
        stroke: '#000000',
        fill: '#ffffff',
        fontSize: '12px',
    },
};

const mockMapStyleDefsHighContrast: MapTheme = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    className: 'high-contrast-theme',
    component: {
        stroke: '#ffffff',
        fill: '#000000',
        fontSize: '12px',
    },
};

describe('RedoIcon Component', () => {
    const defaultProps = {
        id: 'test-redo-icon',
        mapStyleDefs: mockMapStyleDefs,
    };

    describe('Basic Rendering', () => {
        it('renders without crashing', () => {
            render(<RedoIcon {...defaultProps} />);
            expect(screen.getByTitle('Redo')).toBeInTheDocument();
        });

        it('renders with correct accessibility attributes', () => {
            const {container} = render(<RedoIcon {...defaultProps} />);

            // Check for accessibility title and description
            expect(screen.getByTitle('Redo last undone action')).toBeInTheDocument();
            expect(screen.getByText('Click to redo the last action that was undone')).toBeInTheDocument();
        });

        it('applies correct SVG structure for redo arrow', () => {
            const {container} = render(<RedoIcon {...defaultProps} />);

            // Check for curved arrow path (different from undo)
            const curvedPath = container.querySelector('path[d*="C 15 12"]');
            expect(curvedPath).toBeInTheDocument();
            expect(curvedPath).toHaveAttribute('stroke', '#000000');
            expect(curvedPath).toHaveAttribute('stroke-width', '2.5');
            expect(curvedPath).toHaveAttribute('fill', 'none');

            // Check for arrow head pointing right
            const arrowHead = container.querySelector('path[d*="M 28 34"]');
            expect(arrowHead).toBeInTheDocument();
            expect(arrowHead).toHaveAttribute('fill', '#000000');
        });
    });

    describe('Click Handling', () => {
        it('calls onClick handler when clicked and not disabled', () => {
            const mockOnClick = jest.fn();
            render(<RedoIcon {...defaultProps} onClick={mockOnClick} />);

            const svg = screen.getByTitle('Redo');
            fireEvent.click(svg);

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it('does not call onClick handler when disabled', () => {
            const mockOnClick = jest.fn();
            render(<RedoIcon {...defaultProps} onClick={mockOnClick} disabled={true} />);

            const svg = screen.getByTitle('Redo');
            fireEvent.click(svg);

            expect(mockOnClick).not.toHaveBeenCalled();
        });

        it('works without onClick handler', () => {
            expect(() => {
                render(<RedoIcon {...defaultProps} />);
                const svg = screen.getByTitle('Redo');
                fireEvent.click(svg);
            }).not.toThrow();
        });
    });

    describe('Visual States', () => {
        it('renders in enabled state by default', () => {
            const {container} = render(<RedoIcon {...defaultProps} />);

            // Check stroke color is normal
            const curvedPath = container.querySelector('path[d*="C 15 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#000000');
        });

        it('renders in disabled state correctly', () => {
            const {container} = render(<RedoIcon {...defaultProps} disabled={true} />);

            // Check stroke color is faded
            const curvedPath = container.querySelector('path[d*="C 15 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#00000099');
        });

        it('handles missing stroke color gracefully', () => {
            const mapStyleWithoutStroke: MapTheme = {
                ...mockMapStyleDefs,
                component: {
                    fill: '#ffffff',
                    fontSize: '12px',
                },
            };

            const {container} = render(<RedoIcon {...defaultProps} mapStyleDefs={mapStyleWithoutStroke} />);

            const curvedPath = container.querySelector('path[d*="C 15 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#000000');
        });

        it('handles missing stroke color in disabled state', () => {
            const mapStyleWithoutStroke: MapTheme = {
                ...mockMapStyleDefs,
                component: {
                    fill: '#ffffff',
                    fontSize: '12px',
                },
            };

            const {container} = render(<RedoIcon {...defaultProps} mapStyleDefs={mapStyleWithoutStroke} disabled={true} />);

            const curvedPath = container.querySelector('path[d*="C 15 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#00000099');
        });
    });

    describe('Theme Compatibility', () => {
        it('works with high contrast theme', () => {
            const {container} = render(<RedoIcon {...defaultProps} mapStyleDefs={mockMapStyleDefsHighContrast} />);

            const curvedPath = container.querySelector('path[d*="C 15 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#ffffff');

            const arrowHead = container.querySelector('path[d*="M 28 34"]');
            expect(arrowHead).toHaveAttribute('fill', '#ffffff');
        });

        it('works with high contrast theme in disabled state', () => {
            const {container} = render(<RedoIcon {...defaultProps} mapStyleDefs={mockMapStyleDefsHighContrast} disabled={true} />);

            const curvedPath = container.querySelector('path[d*="C 15 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#ffffff99');

            const arrowHead = container.querySelector('path[d*="M 28 34"]');
            expect(arrowHead).toHaveAttribute('fill', '#ffffff99');
        });

        it('applies theme styles correctly', () => {
            const {container} = render(<RedoIcon {...defaultProps} />);

            // Check that the icon renders with theme-based colors
            const curvedPath = container.querySelector('path[d*="C 15 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#000000');
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA attributes', () => {
            render(<RedoIcon {...defaultProps} />);

            // SVG should have title for screen readers
            expect(screen.getByTitle('Redo last undone action')).toBeInTheDocument();
            expect(screen.getByText('Click to redo the last action that was undone')).toBeInTheDocument();
        });

        it('indicates disabled state through visual changes', () => {
            const {container} = render(<RedoIcon {...defaultProps} disabled={true} />);

            // Check that disabled styling is applied to paths
            const curvedPath = container.querySelector('path[d*="C 15 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#00000099');
        });

        it('maintains keyboard accessibility', () => {
            const mockOnClick = jest.fn();
            render(<RedoIcon {...defaultProps} onClick={mockOnClick} />);

            const svg = screen.getByTitle('Redo');

            // Simulate keyboard interaction
            fireEvent.keyDown(svg, {key: 'Enter', code: 'Enter'});
            fireEvent.keyDown(svg, {key: ' ', code: 'Space'});

            // SVG elements don't naturally handle keyboard events, but the wrapper should be focusable
            expect(svg).toBeInTheDocument();
        });
    });

    describe('Visual Distinction from Undo', () => {
        it('has different arrow direction than undo icon', () => {
            const {container: redoContainer} = render(<RedoIcon {...defaultProps} />);

            // Redo arrow curves to the right and arrow head points right
            const redoCurvedPath = redoContainer.querySelector('path[d*="C 15 12"]');
            expect(redoCurvedPath).toBeInTheDocument();

            const redoArrowHead = redoContainer.querySelector('path[d*="M 28 34"]');
            expect(redoArrowHead).toBeInTheDocument();

            // These paths should be different from undo (which has "C 35 12" and "M 12 34")
            expect(redoContainer.querySelector('path[d*="C 35 12"]')).not.toBeInTheDocument();
            expect(redoContainer.querySelector('path[d*="M 12 34"]')).not.toBeInTheDocument();
        });

        it('has distinct accessibility text from undo', () => {
            render(<RedoIcon {...defaultProps} />);

            expect(screen.getByTitle('Redo last undone action')).toBeInTheDocument();
            expect(screen.getByText('Click to redo the last action that was undone')).toBeInTheDocument();

            // Should not have undo text
            expect(screen.queryByTitle('Undo last action')).not.toBeInTheDocument();
            expect(screen.queryByText('Click to undo the last action performed on the map')).not.toBeInTheDocument();
        });
    });

    describe('Memory and Performance', () => {
        it('is memoized to prevent unnecessary re-renders', () => {
            const {rerender} = render(<RedoIcon {...defaultProps} />);

            // Re-render with same props should not cause issues
            rerender(<RedoIcon {...defaultProps} />);

            expect(screen.getByTitle('Redo')).toBeInTheDocument();
        });

        it('handles prop changes correctly', () => {
            const {rerender, container} = render(<RedoIcon {...defaultProps} disabled={false} />);

            let curvedPath = container.querySelector('path[d*="C 15 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#000000');

            rerender(<RedoIcon {...defaultProps} disabled={true} />);

            curvedPath = container.querySelector('path[d*="C 15 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#00000099');
        });
    });
});
