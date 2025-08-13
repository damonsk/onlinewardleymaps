import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {ToolbarUndoIcon, ToolbarRedoIcon} from '../../../components/map/ToolbarIconWrappers';
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

describe('Toolbar Undo/Redo Icon Wrappers', () => {
    describe('ToolbarUndoIcon', () => {
        const defaultProps = {
            id: 'toolbar-undo',
            mapStyleDefs: mockMapStyleDefs,
        };

        it('renders undo icon with correct props', () => {
            render(<ToolbarUndoIcon {...defaultProps} />);

            expect(screen.getByTitle('Undo')).toBeInTheDocument();
            expect(screen.getByTitle('Undo last action')).toBeInTheDocument();
        });

        it('passes through onClick handler', () => {
            const mockOnClick = jest.fn();
            render(<ToolbarUndoIcon {...defaultProps} onClick={mockOnClick} />);

            const svg = screen.getByTitle('Undo');
            fireEvent.click(svg);

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it('handles disabled state correctly', () => {
            const {container} = render(<ToolbarUndoIcon {...defaultProps} disabled={true} />);

            const curvedPath = container.querySelector('path[d*="C 22 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#00000040');
        });

        it('defaults to enabled state', () => {
            const {container} = render(<ToolbarUndoIcon {...defaultProps} />);

            const curvedPath = container.querySelector('path[d*="C 22 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#000000');
        });

        it('works without onClick handler', () => {
            expect(() => {
                render(<ToolbarUndoIcon {...defaultProps} />);
                const svg = screen.getByTitle('Undo');
                fireEvent.click(svg);
            }).not.toThrow();
        });

        it('renders with correct structure', () => {
            render(<ToolbarUndoIcon {...defaultProps} />);

            expect(screen.getByTitle('Undo')).toBeInTheDocument();
            expect(screen.getByTitle('Undo last action')).toBeInTheDocument();
        });
    });

    describe('ToolbarRedoIcon', () => {
        const defaultProps = {
            id: 'toolbar-redo',
            mapStyleDefs: mockMapStyleDefs,
        };

        it('renders redo icon with correct props', () => {
            render(<ToolbarRedoIcon {...defaultProps} />);

            expect(screen.getByTitle('Redo')).toBeInTheDocument();
            expect(screen.getByTitle('Redo last undone action')).toBeInTheDocument();
        });

        it('passes through onClick handler', () => {
            const mockOnClick = jest.fn();
            render(<ToolbarRedoIcon {...defaultProps} onClick={mockOnClick} />);

            const svg = screen.getByTitle('Redo');
            fireEvent.click(svg);

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it('handles disabled state correctly', () => {
            const {container} = render(<ToolbarRedoIcon {...defaultProps} disabled={true} />);

            const curvedPath = container.querySelector('path[d*="C 28 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#00000040');
        });

        it('defaults to enabled state', () => {
            const {container} = render(<ToolbarRedoIcon {...defaultProps} />);

            const curvedPath = container.querySelector('path[d*="C 28 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#000000');
        });

        it('works without onClick handler', () => {
            expect(() => {
                render(<ToolbarRedoIcon {...defaultProps} />);
                const svg = screen.getByTitle('Redo');
                fireEvent.click(svg);
            }).not.toThrow();
        });

        it('renders with correct structure', () => {
            render(<ToolbarRedoIcon {...defaultProps} />);

            expect(screen.getByTitle('Redo')).toBeInTheDocument();
            expect(screen.getByTitle('Redo last undone action')).toBeInTheDocument();
        });
    });

    describe('Icon Distinction', () => {
        it('renders different icons for undo and redo', () => {
            const {container: undoContainer} = render(<ToolbarUndoIcon id="undo" mapStyleDefs={mockMapStyleDefs} />);
            const {container: redoContainer} = render(<ToolbarRedoIcon id="redo" mapStyleDefs={mockMapStyleDefs} />);

            // Check that they have different arrow paths
            const undoCurvedPath = undoContainer.querySelector('path[d*="C 22 12"]');
            const redoCurvedPath = redoContainer.querySelector('path[d*="C 28 12"]');

            expect(undoCurvedPath).toBeInTheDocument();
            expect(redoCurvedPath).toBeInTheDocument();

            // Verify they're different
            expect(undoContainer.querySelector('path[d*="C 28 12"]')).not.toBeInTheDocument();
            expect(redoContainer.querySelector('path[d*="C 22 12"]')).not.toBeInTheDocument();
        });

        it('has different accessibility text for each icon', () => {
            render(
                <div>
                    <ToolbarUndoIcon id="undo" mapStyleDefs={mockMapStyleDefs} />
                    <ToolbarRedoIcon id="redo" mapStyleDefs={mockMapStyleDefs} />
                </div>,
            );

            expect(screen.getByTitle('Undo last action')).toBeInTheDocument();
            expect(screen.getByTitle('Redo last undone action')).toBeInTheDocument();
            expect(screen.getByText('Click to undo the last action performed on the map')).toBeInTheDocument();
            expect(screen.getByText('Click to redo the last action that was undone')).toBeInTheDocument();
        });
    });

    describe('Theme Integration', () => {
        const darkTheme: MapTheme = {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '16px',
            className: 'dark-theme',
            component: {
                stroke: '#ffffff',
                fill: '#333333',
                fontSize: '14px',
            },
        };

        it('applies theme styles to undo icon', () => {
            const {container} = render(<ToolbarUndoIcon id="undo" mapStyleDefs={darkTheme} />);

            const curvedPath = container.querySelector('path[d*="C 22 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#ffffff');
        });

        it('applies theme styles to redo icon', () => {
            const {container} = render(<ToolbarRedoIcon id="redo" mapStyleDefs={darkTheme} />);

            const curvedPath = container.querySelector('path[d*="C 28 12"]');
            expect(curvedPath).toHaveAttribute('stroke', '#ffffff');
        });
    });

    describe('Disabled State Interaction', () => {
        it('prevents click events when undo icon is disabled', () => {
            const mockOnClick = jest.fn();
            render(<ToolbarUndoIcon id="undo" mapStyleDefs={mockMapStyleDefs} onClick={mockOnClick} disabled={true} />);

            const svg = screen.getByTitle('Undo');
            fireEvent.click(svg);

            expect(mockOnClick).not.toHaveBeenCalled();
        });

        it('prevents click events when redo icon is disabled', () => {
            const mockOnClick = jest.fn();
            render(<ToolbarRedoIcon id="redo" mapStyleDefs={mockMapStyleDefs} onClick={mockOnClick} disabled={true} />);

            const svg = screen.getByTitle('Redo');
            fireEvent.click(svg);

            expect(mockOnClick).not.toHaveBeenCalled();
        });
    });

    describe('Prop Validation', () => {
        it('handles missing component styles gracefully', () => {
            const minimalTheme: MapTheme = {
                fontFamily: 'Arial',
                fontSize: '12px',
                className: 'minimal',
            };

            expect(() => {
                render(<ToolbarUndoIcon id="undo" mapStyleDefs={minimalTheme} />);
                render(<ToolbarRedoIcon id="redo" mapStyleDefs={minimalTheme} />);
            }).not.toThrow();
        });

        it('handles empty id gracefully', () => {
            expect(() => {
                render(<ToolbarUndoIcon id="" mapStyleDefs={mockMapStyleDefs} />);
                render(<ToolbarRedoIcon id="" mapStyleDefs={mockMapStyleDefs} />);
            }).not.toThrow();
        });
    });
});
