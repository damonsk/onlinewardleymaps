import React from 'react';
import {render, screen} from '@testing-library/react';
import {ComponentSelectionProvider} from '../../components/ComponentSelectionContext';
import {EditingProvider} from '../../components/EditingContext';
import Note from '../../components/map/Note';

describe('Multi-Line Note Rendering Integration', () => {
    const defaultProps = {
        mapDimensions: {width: 800, height: 600},
        mapText: '',
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
        enableInlineEditing: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderWithProvider = (note: any) => {
        return render(
            <EditingProvider>
                <ComponentSelectionProvider>
                    <svg>
                        <Note {...defaultProps} note={note} />
                    </svg>
                </ComponentSelectionProvider>
            </EditingProvider>,
        );
    };

    describe('single-line note rendering (backward compatibility)', () => {
        it('should render single-line notes correctly', () => {
            const note = {
                id: 'note1',
                text: 'Simple note',
                visibility: 0.5,
                maturity: 0.5,
                line: 1,
            };

            renderWithProvider(note);

            const noteText = screen.getByTestId('modern_note_text_note1');
            expect(noteText).toBeInTheDocument();
            expect(noteText).toHaveTextContent('Simple note');
        });

        it('should render long single-line notes with word wrapping', () => {
            const note = {
                id: 'note2',
                text: 'This is a very long single line note that should be wrapped',
                visibility: 0.3,
                maturity: 0.7,
                line: 2,
            };

            renderWithProvider(note);

            const noteText = screen.getByTestId('modern_note_text_note2');
            expect(noteText).toBeInTheDocument();
            
            // Should have multiple tspan elements for word wrapping
            const tspans = noteText.querySelectorAll('tspan');
            expect(tspans.length).toBeGreaterThan(1);
        });
    });

    describe('multi-line note rendering (new functionality)', () => {
        it('should render multi-line notes with line breaks', () => {
            const note = {
                id: 'note3',
                text: 'Line 1\nLine 2\nLine 3',
                visibility: 0.4,
                maturity: 0.6,
                line: 3,
            };

            renderWithProvider(note);

            const noteText = screen.getByTestId('modern_note_text_note3');
            expect(noteText).toBeInTheDocument();
            
            // Should have multiple tspan elements for each line
            const tspans = noteText.querySelectorAll('tspan');
            expect(tspans.length).toBe(3);
            
            // Check content of each line
            expect(tspans[0]).toHaveTextContent('Line 1');
            expect(tspans[1]).toHaveTextContent('Line 2');
            expect(tspans[2]).toHaveTextContent('Line 3');
        });

        it('should handle multi-line notes with empty lines', () => {
            const note = {
                id: 'note4',
                text: 'First line\n\nThird line',
                visibility: 0.2,
                maturity: 0.8,
                line: 4,
            };

            renderWithProvider(note);

            const noteText = screen.getByTestId('modern_note_text_note4');
            expect(noteText).toBeInTheDocument();
            
            const tspans = noteText.querySelectorAll('tspan');
            expect(tspans.length).toBe(3);
            
            // First and third lines should have content
            expect(tspans[0]).toHaveTextContent('First line');
            expect(tspans[2]).toHaveTextContent('Third line');
            // Middle line should be present but may appear empty
            expect(tspans[1]).toBeInTheDocument();
        });

        it('should handle multi-line notes with long lines', () => {
            const note = {
                id: 'note5',
                text: 'Short line\nThis is a very long line that should be split into multiple words for proper rendering\nAnother short line',
                visibility: 0.6,
                maturity: 0.4,
                line: 5,
            };

            renderWithProvider(note);

            const noteText = screen.getByTestId('modern_note_text_note5');
            expect(noteText).toBeInTheDocument();
            
            const tspans = noteText.querySelectorAll('tspan');
            // Should have more than 3 tspans due to word wrapping on the long line
            expect(tspans.length).toBeGreaterThan(3);
        });
    });

    describe('real-world multi-line examples', () => {
        it('should render documentation-style notes', () => {
            const note = {
                id: 'note6',
                text: 'Documentation:\nThis component handles user authentication\n\nSee "auth.js" for implementation details',
                visibility: 0.5,
                maturity: 0.5,
                line: 6,
            };

            renderWithProvider(note);

            const noteText = screen.getByTestId('modern_note_text_note6');
            expect(noteText).toBeInTheDocument();
            
            const tspans = noteText.querySelectorAll('tspan');
            expect(tspans.length).toBeGreaterThan(3); // Multiple lines including empty line
            
            // Check that the content is preserved
            expect(noteText).toHaveTextContent('Documentation:Thiscomponenthandlesuserauthentication See"auth.js"forimplementationdetails');
        });

        it('should render code snippet notes', () => {
            const note = {
                id: 'note7',
                text: 'Code example:\nfunction test() {\n  return "hello";\n}',
                visibility: 0.7,
                maturity: 0.3,
                line: 7,
            };

            renderWithProvider(note);

            const noteText = screen.getByTestId('modern_note_text_note7');
            expect(noteText).toBeInTheDocument();
            
            const tspans = noteText.querySelectorAll('tspan');
            expect(tspans.length).toBeGreaterThan(4); // May be word-wrapped
            
            // Check that the code structure is preserved
            expect(noteText).toHaveTextContent('Code example:functiontest(){return"hello";}');
        });

        it('should render mixed content with varying line lengths', () => {
            const note = {
                id: 'note8',
                text: 'Title\nThis is a very long description that should be wrapped into multiple words\nShort\nEnd',
                visibility: 0.8,
                maturity: 0.2,
                line: 8,
            };

            renderWithProvider(note);

            const noteText = screen.getByTestId('modern_note_text_note8');
            expect(noteText).toBeInTheDocument();
            
            const tspans = noteText.querySelectorAll('tspan');
            // Should have more than 4 tspans due to word wrapping on the long line
            expect(tspans.length).toBeGreaterThan(4);
            
            // First and last lines should be short
            expect(tspans[0]).toHaveTextContent('Title');
            expect(tspans[tspans.length - 1]).toHaveTextContent('End');
        });
    });

    describe('styling and positioning', () => {
        it('should apply correct styling to multi-line notes', () => {
            const note = {
                id: 'note9',
                text: 'Line 1\nLine 2',
                visibility: 0.5,
                maturity: 0.5,
                line: 9,
            };

            const customStyleDefs = {
                note: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textColor: '#ff0000',
                },
            };

            render(
                <EditingProvider>
                    <ComponentSelectionProvider>
                        <svg>
                            <Note {...defaultProps} note={note} mapStyleDefs={customStyleDefs} />
                        </svg>
                    </ComponentSelectionProvider>
                </EditingProvider>,
            );

            const noteText = screen.getByTestId('modern_note_text_note9');
            expect(noteText).toHaveAttribute('font-size', '16px');
            expect(noteText).toHaveAttribute('font-weight', 'bold');
            expect(noteText).toHaveAttribute('fill', '#ff0000');
        });

        it('should position multi-line notes correctly', () => {
            const note = {
                id: 'note10',
                text: 'Line 1\nLine 2\nLine 3',
                visibility: 0.3,
                maturity: 0.7,
                line: 10,
            };

            renderWithProvider(note);

            const noteGroup = screen.getByTestId('map-note-note10');
            expect(noteGroup).toBeInTheDocument();
            
            // Note should be positioned within the map bounds
            const noteText = screen.getByTestId('modern_note_text_note10');
            expect(noteText).toBeInTheDocument();
        });
    });
});