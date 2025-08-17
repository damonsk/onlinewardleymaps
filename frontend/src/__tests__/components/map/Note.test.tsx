import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import Note from '../../../components/map/Note';
import {EditingProvider} from '../../../components/EditingContext';
import {TestProviderWrapper} from '../../../testUtils/testProviders';
import {MapNotes} from '../../../types/base';
import {MapDimensions} from '../../../constants/defaults';
import {MapTheme} from '../../../constants/mapstyles';

// Mock the renameNote function
jest.mock('../../../constants/renameNote', () => ({
    renameNote: jest.fn().mockReturnValue({success: true}),
}));

// Mock the InlineEditor component
jest.mock('../../../components/map/InlineEditor', () => {
    return function MockInlineEditor({value, onChange, onSave, onCancel, ...props}: any) {
        return (
            <div data-testid="inline-editor">
                <input data-testid="inline-editor-input" value={value} onChange={e => onChange(e.target.value)} />
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

// Mock the ComponentTextSymbol component
jest.mock('../../../components/symbols/ComponentTextSymbol', () => {
    return function MockComponentTextSymbol({onClick, onDoubleClick, note, ...props}: any) {
        return (
            <text data-testid="component-text-symbol" onClick={onClick} onDoubleClick={onDoubleClick}>
                {note}
            </text>
        );
    };
});

// Mock the Movable component
jest.mock('../../../components/map/Movable', () => {
    return function MockMovable({children, ...props}: any) {
        return <div data-testid="movable">{children}</div>;
    };
});

describe('Note Component with Inline Editing', () => {
    const mockNote: MapNotes = {
        id: 'test-note-1',
        text: 'Test Note Content',
        maturity: 0.5,
        visibility: 0.7,
        line: 3,
    };

    const mockMapDimensions: MapDimensions = {
        width: 800,
        height: 600,
    };

    const mockMapStyleDefs: MapTheme = {
        note: {
            textColor: '#000000',
            fontSize: '14px',
            fontWeight: 'normal',
            evolvedTextColor: '#666',
        },
        component: {
            fill: '#ffffff',
            stroke: '#000000',
            textColor: '#000000',
            fontSize: '14px',
            fontWeight: 'normal',
            strokeWidth: 1,
            evolvedTextColor: '#666',
        },
        attitudes: {},
        methods: {
            buy: {},
            build: {},
            outsource: {},
        },
        annotation: {
            fill: '#fff',
            stroke: '#000',
            strokeWidth: 1,
            text: '#000',
            boxStroke: '#000',
            boxStrokeWidth: 1,
            boxFill: '#fff',
            boxTextColour: '#000',
        },
        fontFamily: 'Arial, sans-serif',
    };

    const defaultProps = {
        note: mockNote,
        mapDimensions: mockMapDimensions,
        mapText: 'title Test Map\ncomponent A [0.5, 0.5]\nnote Test Note Content [0.5, 0.7]\n',
        mutateMapText: jest.fn(),
        mapStyleDefs: mockMapStyleDefs,
        setHighlightLine: jest.fn(),
        scaleFactor: 1,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderWithProvider = (component: React.ReactElement) => {
        return render(
            <TestProviderWrapper>
                <EditingProvider>
                    <svg>{component}</svg>
                </EditingProvider>
            </TestProviderWrapper>,
        );
    };

    describe('Basic Rendering', () => {
        it('should render note in normal mode by default', () => {
            renderWithProvider(<Note {...defaultProps} />);

            expect(screen.getByTestId('component-text-symbol')).toBeInTheDocument();
            expect(screen.getByText('Test Note Content')).toBeInTheDocument();
            expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
        });

        it('should render note with proper text content', () => {
            renderWithProvider(<Note {...defaultProps} />);

            const textSymbol = screen.getByTestId('component-text-symbol');
            expect(textSymbol).toHaveTextContent('Test Note Content');
        });

        it('should call setHighlightLine when note is clicked', () => {
            const mockSetHighlightLine = jest.fn();
            renderWithProvider(<Note {...defaultProps} setHighlightLine={mockSetHighlightLine} />);

            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.click(textSymbol);

            expect(mockSetHighlightLine).toHaveBeenCalledWith(3);
        });
    });

    describe('Inline Editing Disabled', () => {
        it('should not enter edit mode on double-click when inline editing is disabled', () => {
            renderWithProvider(<Note {...defaultProps} enableInlineEditing={false} />);

            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
            expect(screen.getByTestId('component-text-symbol')).toBeInTheDocument();
        });

        it('should not enter edit mode on double-click when enableInlineEditing is undefined', () => {
            renderWithProvider(<Note {...defaultProps} />);

            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
            expect(screen.getByTestId('component-text-symbol')).toBeInTheDocument();
        });
    });

    describe('Inline Editing Enabled', () => {
        it('should enter edit mode on double-click when inline editing is enabled', () => {
            renderWithProvider(<Note {...defaultProps} enableInlineEditing={true} />);

            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            expect(screen.getByTestId('inline-editor')).toBeInTheDocument();
            expect(screen.queryByTestId('component-text-symbol')).not.toBeInTheDocument();
        });

        it('should initialize edit text with current note text', () => {
            renderWithProvider(<Note {...defaultProps} enableInlineEditing={true} />);

            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            const input = screen.getByTestId('inline-editor-input');
            expect(input).toHaveValue('Test Note Content');
        });

        it('should update edit text when typing in editor', () => {
            renderWithProvider(<Note {...defaultProps} enableInlineEditing={true} />);

            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            const input = screen.getByTestId('inline-editor-input');
            fireEvent.change(input, {target: {value: 'Updated Note Text'}});

            expect(input).toHaveValue('Updated Note Text');
        });
    });

    describe('Save Functionality', () => {
        it('should save changes and exit edit mode when save is clicked', async () => {
            const mockMutateMapText = jest.fn();
            const {renameNote} = require('../../../constants/renameNote');
            renameNote.mockReturnValue({success: true});

            renderWithProvider(<Note {...defaultProps} enableInlineEditing={true} mutateMapText={mockMutateMapText} />);

            // Enter edit mode
            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            // Change text
            const input = screen.getByTestId('inline-editor-input');
            fireEvent.change(input, {target: {value: 'Updated Note Text'}});

            // Save changes
            const saveButton = screen.getByTestId('save-button');
            fireEvent.click(saveButton);

            // Should call renameNote with correct parameters
            expect(renameNote).toHaveBeenCalledWith(
                3, // line number
                'Test Note Content', // original text
                'Updated Note Text', // new text
                defaultProps.mapText, // map text
                mockMutateMapText, // mutate function
            );

            // Should exit edit mode
            await waitFor(() => {
                expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
                expect(screen.getByTestId('component-text-symbol')).toBeInTheDocument();
            });
        });

        it('should not save when text is unchanged', () => {
            const mockMutateMapText = jest.fn();
            const {renameNote} = require('../../../constants/renameNote');
            renameNote.mockClear();

            renderWithProvider(<Note {...defaultProps} enableInlineEditing={true} mutateMapText={mockMutateMapText} />);

            // Enter edit mode
            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            // Save without changes
            const saveButton = screen.getByTestId('save-button');
            fireEvent.click(saveButton);

            // Should not call renameNote
            expect(renameNote).not.toHaveBeenCalled();
        });

        it('should not save when text is empty', () => {
            const mockMutateMapText = jest.fn();
            const {renameNote} = require('../../../constants/renameNote');
            renameNote.mockClear();

            renderWithProvider(<Note {...defaultProps} enableInlineEditing={true} mutateMapText={mockMutateMapText} />);

            // Enter edit mode
            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            // Clear text
            const input = screen.getByTestId('inline-editor-input');
            fireEvent.change(input, {target: {value: ''}});

            // Save changes
            const saveButton = screen.getByTestId('save-button');
            fireEvent.click(saveButton);

            // Should not call renameNote
            expect(renameNote).not.toHaveBeenCalled();
        });

        it('should trim whitespace before saving', () => {
            const mockMutateMapText = jest.fn();
            const {renameNote} = require('../../../constants/renameNote');
            renameNote.mockClear();
            renameNote.mockReturnValue({success: true});

            renderWithProvider(<Note {...defaultProps} enableInlineEditing={true} mutateMapText={mockMutateMapText} />);

            // Enter edit mode
            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            // Change text with whitespace
            const input = screen.getByTestId('inline-editor-input');
            fireEvent.change(input, {target: {value: '  Updated Note Text  '}});

            // Save changes
            const saveButton = screen.getByTestId('save-button');
            fireEvent.click(saveButton);

            // Should call renameNote with trimmed text
            expect(renameNote).toHaveBeenCalledWith(
                3,
                'Test Note Content',
                'Updated Note Text', // trimmed
                defaultProps.mapText,
                mockMutateMapText,
            );
        });
    });

    describe('Cancel Functionality', () => {
        it('should cancel changes and exit edit mode when cancel is clicked', async () => {
            const mockMutateMapText = jest.fn();
            const {renameNote} = require('../../../constants/renameNote');
            renameNote.mockClear();

            renderWithProvider(<Note {...defaultProps} enableInlineEditing={true} mutateMapText={mockMutateMapText} />);

            // Enter edit mode
            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            // Change text
            const input = screen.getByTestId('inline-editor-input');
            fireEvent.change(input, {target: {value: 'Changed Text'}});

            // Cancel changes
            const cancelButton = screen.getByTestId('cancel-button');
            fireEvent.click(cancelButton);

            // Should not call renameNote
            expect(renameNote).not.toHaveBeenCalled();

            // Should exit edit mode
            await waitFor(() => {
                expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
                expect(screen.getByTestId('component-text-symbol')).toBeInTheDocument();
            });
        });

        it('should reset edit text to original when entering edit mode again after cancel', () => {
            renderWithProvider(<Note {...defaultProps} enableInlineEditing={true} />);

            // Enter edit mode
            let textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            // Change text
            let input = screen.getByTestId('inline-editor-input');
            fireEvent.change(input, {target: {value: 'Changed Text'}});

            // Cancel
            const cancelButton = screen.getByTestId('cancel-button');
            fireEvent.click(cancelButton);

            // Enter edit mode again
            textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            // Should have original text
            input = screen.getByTestId('inline-editor-input');
            expect(input).toHaveValue('Test Note Content');
        });
    });

    describe('InlineEditor Integration', () => {
        it('should pass correct props to InlineEditor', () => {
            renderWithProvider(<Note {...defaultProps} enableInlineEditing={true} />);

            // Enter edit mode
            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            // InlineEditor should be rendered with correct props
            const editor = screen.getByTestId('inline-editor');
            expect(editor).toBeInTheDocument();

            // Check that input has the correct initial value
            const input = screen.getByTestId('inline-editor-input');
            expect(input).toHaveValue('Test Note Content');
        });

        it('should handle multi-line content in editor', () => {
            const noteWithMultiLine = {
                ...mockNote,
                text: 'Line 1\\nLine 2\\nLine 3', // Use escaped newlines for testing
            };

            renderWithProvider(<Note {...defaultProps} note={noteWithMultiLine} enableInlineEditing={true} />);

            // Enter edit mode
            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            // Should display multi-line content
            const input = screen.getByTestId('inline-editor-input');
            expect(input).toHaveValue('Line 1\\nLine 2\\nLine 3');
        });
    });

    describe('State Management', () => {
        it('should maintain separate edit state for different note instances', () => {
            const note1 = {...mockNote, id: 'note-1', text: 'Note 1'};
            const note2 = {...mockNote, id: 'note-2', text: 'Note 2'};

            const {rerender} = renderWithProvider(<Note {...defaultProps} note={note1} enableInlineEditing={true} />);

            // Enter edit mode for note 1
            const textSymbol1 = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol1);

            expect(screen.getByTestId('inline-editor')).toBeInTheDocument();

            // Switch to note 2 - this should reset edit mode due to useEffect
            rerender(
                <TestProviderWrapper>
                    <EditingProvider>
                        <svg>
                            <Note {...defaultProps} note={note2} enableInlineEditing={true} />
                        </svg>
                    </EditingProvider>
                </TestProviderWrapper>,
            );

            // Should not be in edit mode for note 2 (edit mode resets when note changes)
            expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
            expect(screen.getByTestId('component-text-symbol')).toBeInTheDocument();
        });

        it('should reset edit text when note prop changes', () => {
            const note1 = {...mockNote, id: 'note-1', text: 'Original Note 1'};
            const note2 = {...mockNote, id: 'note-2', text: 'Original Note 2'};

            const {rerender} = renderWithProvider(<Note {...defaultProps} note={note1} enableInlineEditing={true} />);

            // Enter edit mode and change text
            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            const input = screen.getByTestId('inline-editor-input');
            fireEvent.change(input, {target: {value: 'Modified Text'}});

            // Switch to different note - this should reset edit mode and text
            rerender(
                <TestProviderWrapper>
                    <EditingProvider>
                        <svg>
                            <Note {...defaultProps} note={note2} enableInlineEditing={true} />
                        </svg>
                    </EditingProvider>
                </TestProviderWrapper>,
            );

            // Enter edit mode for new note
            const newTextSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(newTextSymbol);

            // Should have the new note's text, not the modified text
            const newInput = screen.getByTestId('inline-editor-input');
            expect(newInput).toHaveValue('Original Note 2');
        });
    });

    describe('Error Handling', () => {
        it('should handle missing mapStyleDefs gracefully', () => {
            renderWithProvider(<Note {...defaultProps} mapStyleDefs={undefined as any} enableInlineEditing={true} />);

            // Should still render without errors
            expect(screen.getByTestId('component-text-symbol')).toBeInTheDocument();

            // Should still be able to enter edit mode
            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            expect(screen.getByTestId('inline-editor')).toBeInTheDocument();
        });

        it('should handle empty note text', () => {
            const emptyNote = {...mockNote, text: ''};

            renderWithProvider(<Note {...defaultProps} note={emptyNote} enableInlineEditing={true} />);

            expect(screen.getByTestId('component-text-symbol')).toBeInTheDocument();

            // Should be able to enter edit mode with empty text
            const textSymbol = screen.getByTestId('component-text-symbol');
            fireEvent.doubleClick(textSymbol);

            const input = screen.getByTestId('inline-editor-input');
            expect(input).toHaveValue('');
        });
    });
});
