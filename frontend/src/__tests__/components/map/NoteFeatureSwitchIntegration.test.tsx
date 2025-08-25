import {fireEvent, render, screen} from '@testing-library/react';
import {ComponentSelectionProvider} from '../../../components/ComponentSelectionContext';
import {EditingProvider} from '../../../components/EditingContext';
import Note from '../../../components/map/Note';

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

describe('Note Feature Switch Integration', () => {
    const defaultProps = {
        note: {
            id: 'note1',
            text: 'Test Note Content',
            visibility: 0.5,
            maturity: 0.5,
            line: 1,
        },
        mapDimensions: {width: 800, height: 600},
        mapText: 'note Test Note Content [0.5, 0.5]',
        mutateMapText: jest.fn(),
        mapStyleDefs: {
            note: {
                fontSize: '14px',
                fontWeight: 'normal',
                textColor: '#000000',
            },
        },
        setHighlightLine: jest.fn(),
        scaleFactor: 1,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderWithProvider = (props: any) => {
        return render(
            <EditingProvider>
                <ComponentSelectionProvider>
                    <svg>
                        <Note {...defaultProps} {...props} />
                    </svg>
                </ComponentSelectionProvider>
            </EditingProvider>,
        );
    };

    it('should enable inline editing when enableInlineEditing is true', () => {
        renderWithProvider({enableInlineEditing: true});

        const noteText = screen.getByTestId('modern_note_text_note1');
        expect(noteText).toBeInTheDocument();
        expect(noteText).toHaveTextContent('Test Note Content');

        // Double-click should enter edit mode
        fireEvent.doubleClick(noteText);

        // Should show the inline editor
        expect(screen.getByTestId('inline-editor')).toBeInTheDocument();
    });

    it('should disable inline editing when enableInlineEditing is false', () => {
        renderWithProvider({enableInlineEditing: false});

        const noteText = screen.getByTestId('modern_note_text_note1');
        expect(noteText).toBeInTheDocument();
        expect(noteText).toHaveTextContent('Test Note Content');

        // Double-click should NOT enter edit mode
        fireEvent.doubleClick(noteText);

        // Should NOT show the inline editor
        expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
    });

    it('should disable inline editing when enableInlineEditing is undefined', () => {
        renderWithProvider({});

        const noteText = screen.getByTestId('modern_note_text_note1');
        expect(noteText).toBeInTheDocument();
        expect(noteText).toHaveTextContent('Test Note Content');

        // Double-click should NOT enter edit mode
        fireEvent.doubleClick(noteText);

        // Should NOT show the inline editor
        expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
    });
});
