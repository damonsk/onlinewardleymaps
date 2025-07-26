import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import Note from '../../../components/map/Note';

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

    it('should enable inline editing when enableInlineEditing is true', () => {
        render(
            <svg>
                <Note {...defaultProps} enableInlineEditing={true} />
            </svg>,
        );

        const noteText = screen.getByTestId('modern_note_text_note1');
        expect(noteText).toBeInTheDocument();
        expect(noteText).toHaveTextContent('Test Note Content');

        // Double-click should enter edit mode
        fireEvent.doubleClick(noteText);

        // Should show the inline editor
        expect(screen.getByTestId('inline-editor')).toBeInTheDocument();
    });

    it('should disable inline editing when enableInlineEditing is false', () => {
        render(
            <svg>
                <Note {...defaultProps} enableInlineEditing={false} />
            </svg>,
        );

        const noteText = screen.getByTestId('modern_note_text_note1');
        expect(noteText).toBeInTheDocument();
        expect(noteText).toHaveTextContent('Test Note Content');

        // Double-click should NOT enter edit mode
        fireEvent.doubleClick(noteText);

        // Should NOT show the inline editor
        expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
    });

    it('should disable inline editing when enableInlineEditing is undefined', () => {
        render(
            <svg>
                <Note {...defaultProps} />
            </svg>,
        );

        const noteText = screen.getByTestId('modern_note_text_note1');
        expect(noteText).toBeInTheDocument();
        expect(noteText).toHaveTextContent('Test Note Content');

        // Double-click should NOT enter edit mode
        fireEvent.doubleClick(noteText);

        // Should NOT show the inline editor
        expect(screen.queryByTestId('inline-editor')).not.toBeInTheDocument();
    });
});
