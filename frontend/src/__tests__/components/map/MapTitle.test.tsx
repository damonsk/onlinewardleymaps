import { fireEvent, render, screen } from '@testing-library/react';
import MapTitle from '../../../components/map/MapTitle';
import { MapTheme } from '../../../types/map/styles';

// Mock the InlineEditor component
jest.mock('../../../components/map/InlineEditor', () => {
    return function MockInlineEditor({value, onChange, onSave, onCancel, ...props}: any) {
        return (
            <div data-testid="inline-editor">
                <input data-testid="title-input" value={value} onChange={e => onChange(e.target.value)} />
                <button data-testid="save-button" onClick={onSave}>
                    Save
                </button>
                <button data-testid="cancel-button" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        );
    };
});

describe('MapTitle', () => {
    const mockOnTitleUpdate = jest.fn();
    const mockMapStyleDefs: MapTheme = {
        className: 'test-theme',
        component: {
            text: {fill: '#000'},
            box: {fill: '#fff', stroke: '#000'},
        },
    } as MapTheme;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders title text normally', () => {
        render(<MapTitle mapTitle="Test Map" />);

        expect(screen.getByText('Test Map')).toBeInTheDocument();
    });

    it('shows pointer cursor when editable', () => {
        render(<MapTitle mapTitle="Test Map" onTitleUpdate={mockOnTitleUpdate} mapStyleDefs={mockMapStyleDefs} isEditable={true} />);

        const titleElement = screen.getByText('Test Map');
        expect(titleElement).toHaveStyle('cursor: pointer');
    });

    it('enters edit mode on double click', () => {
        render(<MapTitle mapTitle="Test Map" onTitleUpdate={mockOnTitleUpdate} mapStyleDefs={mockMapStyleDefs} isEditable={true} />);

        const titleElement = screen.getByText('Test Map');
        fireEvent.doubleClick(titleElement);

        expect(screen.getByTestId('inline-editor')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test Map')).toBeInTheDocument();
    });

    it('does not enter edit mode when not editable', () => {
        render(<MapTitle mapTitle="Test Map" onTitleUpdate={mockOnTitleUpdate} mapStyleDefs={mockMapStyleDefs} isEditable={false} />);

        const titleElement = screen.getByText('Test Map');
        fireEvent.doubleClick(titleElement);

        expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
    });

    it('calls onTitleUpdate when saving changes', () => {
        render(<MapTitle mapTitle="Test Map" onTitleUpdate={mockOnTitleUpdate} mapStyleDefs={mockMapStyleDefs} isEditable={true} />);

        // Enter edit mode
        const titleElement = screen.getByText('Test Map');
        fireEvent.doubleClick(titleElement);

        // Change the title
        const input = screen.getByTestId('title-input');
        fireEvent.change(input, {target: {value: 'New Title'}});

        // Save changes
        const saveButton = screen.getByTestId('save-button');
        fireEvent.click(saveButton);

        expect(mockOnTitleUpdate).toHaveBeenCalledWith('New Title');
    });

    it('does not call onTitleUpdate when title is unchanged', () => {
        render(<MapTitle mapTitle="Test Map" onTitleUpdate={mockOnTitleUpdate} mapStyleDefs={mockMapStyleDefs} isEditable={true} />);

        // Enter edit mode
        const titleElement = screen.getByText('Test Map');
        fireEvent.doubleClick(titleElement);

        // Save without changes
        const saveButton = screen.getByTestId('save-button');
        fireEvent.click(saveButton);

        expect(mockOnTitleUpdate).not.toHaveBeenCalled();
    });

    it('cancels editing and restores original title', () => {
        render(<MapTitle mapTitle="Test Map" onTitleUpdate={mockOnTitleUpdate} mapStyleDefs={mockMapStyleDefs} isEditable={true} />);

        // Enter edit mode
        const titleElement = screen.getByText('Test Map');
        fireEvent.doubleClick(titleElement);

        // Change the title
        const input = screen.getByTestId('title-input');
        fireEvent.change(input, {target: {value: 'Changed Title'}});

        // Cancel changes
        const cancelButton = screen.getByTestId('cancel-button');
        fireEvent.click(cancelButton);

        expect(mockOnTitleUpdate).not.toHaveBeenCalled();
        expect(screen.getByText('Test Map')).toBeInTheDocument();
    });
});
