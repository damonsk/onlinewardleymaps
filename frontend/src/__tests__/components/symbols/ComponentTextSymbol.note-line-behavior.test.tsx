import {render, screen} from '@testing-library/react';
import ComponentTextSymbol from '../../../components/symbols/ComponentTextSymbol';
import {TextTheme} from '../../../constants/mapstyles';

describe('ComponentTextSymbol Note Line Behavior', () => {
    const mockTextTheme: TextTheme = {
        textColor: '#000000',
        fontSize: '14px',
        fontWeight: 'normal',
        evolvedTextColor: '#666666',
    };

    describe('Single-line notes (legacy unquoted syntax)', () => {
        it('should render single-line note without line breaks as single text element', () => {
            render(
                <svg>
                    <ComponentTextSymbol 
                        id="test-single-line-note" 
                        note="This is a single line note without line breaks" 
                        textTheme={mockTextTheme} 
                    />
                </svg>,
            );

            const textElement = screen.getByTestId('test-single-line-note');
            expect(textElement).toBeInTheDocument();
            
            // Should render as single text content, not multiple tspans
            expect(textElement).toHaveTextContent('This is a single line note without line breaks');
            
            // Should NOT have multiple tspan elements for single-line notes
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(0); // No tspans for single-line content
            
            // Should not have transform applied for single-line notes (not word-wrapped)
            expect(textElement.getAttribute('transform')).toBe('');
        });

        it('should render short single-line note as single text element', () => {
            render(
                <svg>
                    <ComponentTextSymbol 
                        id="test-short-note" 
                        note="Short note" 
                        textTheme={mockTextTheme} 
                    />
                </svg>,
            );

            const textElement = screen.getByTestId('test-short-note');
            expect(textElement).toBeInTheDocument();
            expect(textElement).toHaveTextContent('Short note');
            
            // Should be rendered as direct text content (no tspans)
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(0);
        });

        it('should NOT apply word wrapping to long single-line notes', () => {
            render(
                <svg>
                    <ComponentTextSymbol 
                        id="test-long-single-note" 
                        note="This is a very long single line note that should not be word wrapped because it is a note" 
                        textTheme={mockTextTheme} 
                    />
                </svg>,
            );

            const textElement = screen.getByTestId('test-long-single-note');
            expect(textElement).toBeInTheDocument();
            
            // Even though it's long, notes should not be word-wrapped
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(0); // No word wrapping for notes
            
            // Should not have the word-wrapping transform
            expect(textElement.getAttribute('transform')).toBe('');
        });
    });

    describe('Multi-line notes (quoted syntax with \\n)', () => {
        it('should render multi-line note with line breaks as multiple text spans', () => {
            render(
                <svg>
                    <ComponentTextSymbol 
                        id="test-multi-line-note" 
                        note={'This is line 1\nThis is line 2\nThis is line 3'} 
                        textTheme={mockTextTheme} 
                    />
                </svg>,
            );

            const textElement = screen.getByTestId('test-multi-line-note');
            expect(textElement).toBeInTheDocument();
            
            // Should have multiple tspan elements for multi-line content
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(3);
            
            // Check content of each line
            expect(tspans[0]).toHaveTextContent('This is line 1');
            expect(tspans[1]).toHaveTextContent('This is line 2');
            expect(tspans[2]).toHaveTextContent('This is line 3');
            
            // Should not have transform for multi-line content
            expect(textElement.getAttribute('transform')).toBe('');
        });

        it('should render two-line note with single \\n as two text spans', () => {
            render(
                <svg>
                    <ComponentTextSymbol 
                        id="test-two-line-note" 
                        note={'First line\nSecond line'} 
                        textTheme={mockTextTheme} 
                    />
                </svg>,
            );

            const textElement = screen.getByTestId('test-two-line-note');
            expect(textElement).toBeInTheDocument();
            
            // Should have exactly 2 tspan elements
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(2);
            
            expect(tspans[0]).toHaveTextContent('First line');
            expect(tspans[1]).toHaveTextContent('Second line');
        });
    });

    describe('Distinction between components and notes', () => {
        it('should apply word wrapping to long component text but not to long note text', () => {
            // Long component text (should be word-wrapped)
            render(
                <svg>
                    <ComponentTextSymbol 
                        id="test-long-component" 
                        text="This is a very long component name that should be word wrapped" 
                        textTheme={mockTextTheme} 
                    />
                </svg>,
            );

            const componentElement = screen.getByTestId('test-long-component');
            expect(componentElement.getAttribute('transform')).toBe('translate(30, 10)');
            
            const componentTspans = componentElement.querySelectorAll('tspan');
            expect(componentTspans.length).toBeGreaterThan(1); // Word-wrapped into multiple spans

            // Long note text (should NOT be word-wrapped)
            render(
                <svg>
                    <ComponentTextSymbol 
                        id="test-long-note" 
                        note="This is a very long note that should not be word wrapped" 
                        textTheme={mockTextTheme} 
                    />
                </svg>,
            );

            const noteElement = screen.getByTestId('test-long-note');
            expect(noteElement.getAttribute('transform')).toBe('');
            
            const noteTspans = noteElement.querySelectorAll('tspan');
            expect(noteTspans.length).toBe(0); // No word wrapping for notes
        });
    });
});