import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';
import {ToolbarRedoIcon, ToolbarUndoIcon} from '../../../components/map/ToolbarIconWrappers';
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
