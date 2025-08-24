import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import Note from '../../../components/map/Note';
import Anchor from '../../../components/map/Anchor';
import {ComponentSelectionProvider, useComponentSelection} from '../../../components/ComponentSelectionContext';
import {EditingProvider} from '../../../components/EditingContext';
import {MapDimensions} from '../../../constants/defaults';
import {MapTheme} from '../../../constants/mapstyles';
import {MapNotes} from '../../../types/base';
import {UnifiedComponent} from '../../../types/unified';

// Mock the text measurement utilities
jest.mock('../../../utils/textMeasurement', () => ({
    measureTextElement: jest.fn((element) => {
        if (!element) return { width: 40, height: 20, x: -20, y: -10 };
        
        // Mock getBBox behavior based on text content
        const textContent = element.textContent || '';
        const charWidth = 8; // Approximate character width
        const lineHeight = 16; // Approximate line height
        
        const lines = textContent.includes('\n') ? textContent.split('\n') : [textContent];
        const maxLineLength = Math.max(...lines.map(line => line.length));
        
        return {
            width: maxLineLength * charWidth,
            height: lines.length * lineHeight,
            x: -(maxLineLength * charWidth) / 2,
            y: -(lines.length * lineHeight) / 2,
        };
    }),
    createSelectionBoxDimensions: jest.fn((textDimensions, padding = 4) => ({
        width: textDimensions.width + (padding * 2),
        height: textDimensions.height + (padding * 2),
        x: textDimensions.x - padding,
        y: textDimensions.y - padding,
    })),
    estimateTextDimensions: jest.fn((text, fontSize = 14, fontFamily = 'Arial, sans-serif', isMultiLine = false) => {
        const charWidth = fontSize * 0.6;
        const lines = isMultiLine || text.includes('\n') ? text.split('\n') : [text];
        const maxLineLength = Math.max(...lines.map(line => line.length));
        const width = maxLineLength * charWidth;
        const height = lines.length * fontSize * 1.2;
        
        return {
            width,
            height,
            x: -width / 2,
            y: -height / 2,
        };
    }),
}));

describe('Dynamic Selection Boxes', () => {
    const mockMapDimensions: MapDimensions = {
        width: 800,
        height: 600,
        margin: 20,
    };

    const mockMapStyleDefs: MapTheme = {
        component: {
            fontSize: '14px',
            fontWeight: 'normal',
            textColor: '#000000',
        },
        note: {
            fontSize: '14px',
            fontWeight: 'normal',
            textColor: '#000000',
        },
        fontFamily: 'Arial, sans-serif',
    };

    const mockMutateMapText = jest.fn();
    const mockSetHighlightLine = jest.fn();
    const mockOnClick = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderWithProviders = (component: React.ReactElement) => {
        return render(
            <svg>
                <ComponentSelectionProvider>
                    <EditingProvider>
                        {component}
                    </EditingProvider>
                </ComponentSelectionProvider>
            </svg>
        );
    };

    describe('Note Dynamic Selection Box', () => {
        it('should create appropriate selection box for short single-line note', async () => {
            const shortNote: MapNotes = {
                id: 'note-1',
                text: 'Short',
                line: 1,
                maturity: 0.5,
                visibility: 0.7,
            };

            renderWithProviders(
                <Note
                    note={shortNote}
                    mapDimensions={mockMapDimensions}
                    mapText="note Short [0.5, 0.7]"
                    mutateMapText={mockMutateMapText}
                    mapStyleDefs={mockMapStyleDefs}
                    setHighlightLine={mockSetHighlightLine}
                    scaleFactor={1}
                />
            );

            const noteElement = screen.getByTestId('map-note-note-1');
            expect(noteElement).toBeInTheDocument();

            // The selection box should not be visible initially (not selected)
            const selectionRect = noteElement.querySelector('rect');
            expect(selectionRect).not.toBeInTheDocument();
        });

        it('should create larger selection box for long single-line note', async () => {
            const longNote: MapNotes = {
                id: 'note-2',
                text: 'This is a very long note that should have a wider selection box',
                line: 1,
                maturity: 0.5,
                visibility: 0.7,
            };

            renderWithProviders(
                <Note
                    note={longNote}
                    mapDimensions={mockMapDimensions}
                    mapText='note "This is a very long note that should have a wider selection box" [0.5, 0.7]'
                    mutateMapText={mockMutateMapText}
                    mapStyleDefs={mockMapStyleDefs}
                    setHighlightLine={mockSetHighlightLine}
                    scaleFactor={1}
                />
            );

            const noteElement = screen.getByTestId('map-note-note-2');
            expect(noteElement).toBeInTheDocument();
        });

        it('should create taller selection box for multi-line note', async () => {
            const multiLineNote: MapNotes = {
                id: 'note-3',
                text: 'Line 1\nLine 2\nLine 3',
                line: 1,
                maturity: 0.5,
                visibility: 0.7,
            };

            renderWithProviders(
                <Note
                    note={multiLineNote}
                    mapDimensions={mockMapDimensions}
                    mapText='note "Line 1\\nLine 2\\nLine 3" [0.5, 0.7]'
                    mutateMapText={mockMutateMapText}
                    mapStyleDefs={mockMapStyleDefs}
                    setHighlightLine={mockSetHighlightLine}
                    scaleFactor={1}
                />
            );

            const noteElement = screen.getByTestId('map-note-note-3');
            expect(noteElement).toBeInTheDocument();

            // Check that the text content includes line breaks
            const textElement = screen.getByTestId('modern_note_text_note-3');
            expect(textElement).toBeInTheDocument();
        });
    });

    describe('Anchor Dynamic Selection Box', () => {
        it('should create appropriate selection box for short anchor name', async () => {
            const shortAnchor: UnifiedComponent = {
                id: 'anchor-1',
                name: 'User',
                maturity: 0.8,
                visibility: 0.9,
                evolved: false,
                line: 1,
            };

            renderWithProviders(
                <Anchor
                    anchor={shortAnchor}
                    mapDimensions={mockMapDimensions}
                    mapText="anchor User [0.8, 0.9]"
                    mutateMapText={mockMutateMapText}
                    mapStyleDefs={mockMapStyleDefs}
                    onClick={mockOnClick}
                    scaleFactor={1}
                />
            );

            const anchorElement = screen.getByTestId('map-anchor-anchor-1');
            expect(anchorElement).toBeInTheDocument();

            // The selection box should not be visible initially (not selected)
            const selectionRect = anchorElement.querySelector('rect');
            expect(selectionRect).not.toBeInTheDocument();
        });

        it('should create wider selection box for long anchor name', async () => {
            const longAnchor: UnifiedComponent = {
                id: 'anchor-2',
                name: 'Very Long Business Process Name',
                maturity: 0.8,
                visibility: 0.9,
                evolved: false,
                line: 1,
            };

            renderWithProviders(
                <Anchor
                    anchor={longAnchor}
                    mapDimensions={mockMapDimensions}
                    mapText="anchor Very Long Business Process Name [0.8, 0.9]"
                    mutateMapText={mockMutateMapText}
                    mapStyleDefs={mockMapStyleDefs}
                    onClick={mockOnClick}
                    scaleFactor={1}
                />
            );

            const anchorElement = screen.getByTestId('map-anchor-anchor-2');
            expect(anchorElement).toBeInTheDocument();
        });
    });

    describe('Selection Box Visibility', () => {
        it('should show selection box when note is selected', async () => {
            const note: MapNotes = {
                id: 'note-selected',
                text: 'Selected Note',
                line: 1,
                maturity: 0.5,
                visibility: 0.7,
            };

            // Use the ComponentSelectionContext to test selected state
            const TestWrapper = () => {
                const {selectComponent} = useComponentSelection();
                
                React.useEffect(() => {
                    selectComponent('note-selected');
                }, [selectComponent]);
                
                return (
                    <Note
                        note={note}
                        mapDimensions={mockMapDimensions}
                        mapText="note Selected Note [0.5, 0.7]"
                        mutateMapText={mockMutateMapText}
                        mapStyleDefs={mockMapStyleDefs}
                        setHighlightLine={mockSetHighlightLine}
                        scaleFactor={1}
                    />
                );
            };

            render(
                <svg>
                    <ComponentSelectionProvider>
                        <EditingProvider>
                            <TestWrapper />
                        </EditingProvider>
                    </ComponentSelectionProvider>
                </svg>
            );

            const noteElement = screen.getByTestId('map-note-note-selected');
            expect(noteElement).toBeInTheDocument();

            // Wait for the selection to be applied
            await waitFor(() => {
                const selectionRect = noteElement.querySelector('rect');
                expect(selectionRect).toBeInTheDocument();
            });

            const selectionRect = noteElement.querySelector('rect');
            expect(selectionRect).toHaveAttribute('stroke', '#2196F3');
            expect(selectionRect).toHaveAttribute('stroke-dasharray', '3,2');
        });
    });
});
