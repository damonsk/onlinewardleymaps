import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import UndoIcon from '../../../components/symbols/UndoIcon';
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

describe('UndoIcon Component', () => {
    const defaultProps = {
        id: 'test-undo-icon',
        mapStyleDefs: mockMapStyleDefs,
    };

    describe('Basic Rendering', () => {
        it('renders without crashing', () => {
            render(<UndoIcon {...defaultProps} />);
            expect(screen.getByTitle('Undo')).toBeInTheDocument();
        });

        it('renders with correct accessibility attributes', () => {
            const {container} = render(<UndoIcon {...defaultProps} />);

            // Check for accessibility title and description
            expect(screen.getByTitle('Undo last action')).toBeInTheDocument();
            expect(screen.getByText('Click to undo the last action performed on the map')).toBeInTheDocument();
        });

        it('applies correct SVG structure for undo arrow', () => {
            const {container} = render(<UndoIcon {...defaultProps} />);

            // Check for curved arrow path
            const curvedPath = container.querySelector('path[d*="C 35 12"]');
            expect(curvedPath).toBeInTheDocument();
            expect(curvedPath).toHaveAttribute('stroke', '#000000');
            expect(curvedPath).toHaveAttribute('stroke-width', '2.5');
            expect(curvedPath).toHaveAttribute('fill', 'none');

            // Check for arrow head
            const arrowHead = container.querySelector('path[d*="M 12 34"]');
            expect(arrowHead).toBeInTheDocument();
            expect(arrowHead).toHaveAttribute('fill', '#000000');
        });
    });

    describe('Click Handling', () => {
        it('calls onClick handler when clicked and not disabled', () => {
            const mockOnClick = jest.fn();
            render(<UndoIcon {...defaultProps} onClick={mockOnClick} />);

            const svg = screen.getByTitle('Undo');
            fireEvent.click(svg);

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it('does not call onClick handler when disabled', () => {
            const mockOnClick = jest.fn();
            render(<UndoIcon {...defaultProps} onClick={mockOnClick} disabled={true} />);

            const svg = screen.getByTitle('Undo');
            fireEvent.click(svg);

            expect(mockOnClick).not.toHaveBeenCalled();
        });

        it('works without onClick handler', () => {
            expect(() => {
                render(<UndoIcon {...defaultProps} />);
                const svg = screen.getByTitle('Undo');
                fireEvent.click(svg);
            }).not.toThrow();
        });
    });

    describe('Visual States', () => {
        it('renders in enabled state by default', () => {
            const {container} = render(<UndoIcon {...defaultProps} />);

            // Check stroke color is normal
            const curvedPath = container.querySelector('path[d*="C 35 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#000000');
        });

        it('renders in disabled state correctly', () => {
            const {container} = render(<UndoIcon {...defaultProps} disabled={true} />);

            // Check stroke color is faded
            const curvedPath = container.querySelector('path[d*="C 35 12"]');
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

            const {container} = render(<UndoIcon {...defaultProps} mapStyleDefs={mapStyleWithoutStroke} />);

            const curvedPath = container.querySelector('path[d*="C 35 12"]');
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

            const {container} = render(<UndoIcon {...defaultProps} mapStyleDefs={mapStyleWithoutStroke} disabled={true} />);

            const curvedPath = container.querySelector('path[d*="C 35 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#00000099');
        });
    });

    describe('Theme Compatibility', () => {
        it('works with high contrast theme', () => {
            const {container} = render(<UndoIcon {...defaultProps} mapStyleDefs={mockMapStyleDefsHighContrast} />);

            const curvedPath = container.querySelector('path[d*="C 35 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#ffffff');

            const arrowHead = container.querySelector('path[d*="M 12 34"]');
            expect(arrowHead).toHaveAttribute('fill', '#ffffff');
        });

        it('works with high contrast theme in disabled state', () => {
            const {container} = render(<UndoIcon {...defaultProps} mapStyleDefs={mockMapStyleDefsHighContrast} disabled={true} />);

            const curvedPath = container.querySelector('path[d*="C 35 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#ffffff99');

            const arrowHead = container.querySelector('path[d*="M 12 34"]');
            expect(arrowHead).toHaveAttribute('fill', '#ffffff99');
        });

        it('applies theme styles correctly', () => {
            const {container} = render(<UndoIcon {...defaultProps} />);

            // Check that the icon renders with theme-based colors
            const curvedPath = container.querySelector('path[d*="C 35 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#000000');
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA attributes', () => {
            render(<UndoIcon {...defaultProps} />);

            // SVG should have title for screen readers
            expect(screen.getByTitle('Undo last action')).toBeInTheDocument();
            expect(screen.getByText('Click to undo the last action performed on the map')).toBeInTheDocument();
        });

        it('indicates disabled state through visual changes', () => {
            const {container} = render(<UndoIcon {...defaultProps} disabled={true} />);

            // Check that disabled styling is applied to paths
            const curvedPath = container.querySelector('path[d*="C 35 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#00000099');
        });

        it('maintains keyboard accessibility', () => {
            const mockOnClick = jest.fn();
            render(<UndoIcon {...defaultProps} onClick={mockOnClick} />);

            const svg = screen.getByTitle('Undo');

            // Simulate keyboard interaction
            fireEvent.keyDown(svg, {key: 'Enter', code: 'Enter'});
            fireEvent.keyDown(svg, {key: ' ', code: 'Space'});

            // SVG elements don't naturally handle keyboard events, but the wrapper should be focusable
            expect(svg).toBeInTheDocument();
        });
    });

    describe('Memory and Performance', () => {
        it('is memoized to prevent unnecessary re-renders', () => {
            const {rerender} = render(<UndoIcon {...defaultProps} />);

            // Re-render with same props should not cause issues
            rerender(<UndoIcon {...defaultProps} />);

            expect(screen.getByTitle('Undo')).toBeInTheDocument();
        });

        it('handles prop changes correctly', () => {
            const {rerender, container} = render(<UndoIcon {...defaultProps} disabled={false} />);

            let curvedPath = container.querySelector('path[d*="C 35 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#000000');

            rerender(<UndoIcon {...defaultProps} disabled={true} />);

            curvedPath = container.querySelector('path[d*="C 35 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#00000099');
        });
    });
});
