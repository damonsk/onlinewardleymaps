import React from 'react';
import {render, screen} from '@testing-library/react';
import ComponentTextSymbol from '../../../components/symbols/ComponentTextSymbol';
import {TextTheme} from '../../../constants/mapstyles';

describe('ComponentTextSymbol Multi-line Support', () => {
    const mockTextTheme: TextTheme = {
        textColor: '#000000',
        fontSize: '14px',
        fontWeight: 'normal',
        evolvedTextColor: '#666666',
    };

    describe('single-line text rendering (backward compatibility)', () => {
        it('should render short single-line text normally', () => {
            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-short"
                        text="Short text"
                        textTheme={mockTextTheme}
                    />
                </svg>
            );

            const textElement = screen.getByTestId('test-short');
            expect(textElement).toBeInTheDocument();
            expect(textElement).toHaveTextContent('Short text');
            expect(textElement.getAttribute('transform')).toBe('');
        });

        it('should render long single-line text with word wrapping', () => {
            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-long"
                        text="This is a very long single line text that should be wrapped"
                        textTheme={mockTextTheme}
                    />
                </svg>
            );

            const textElement = screen.getByTestId('test-long');
            expect(textElement).toBeInTheDocument();
            expect(textElement.getAttribute('transform')).toBe('translate(30, 10)');
            
            // Should have multiple tspan elements for word wrapping
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBeGreaterThan(1);
        });

        it('should handle empty text', () => {
            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-empty"
                        text=""
                        textTheme={mockTextTheme}
                    />
                </svg>
            );

            const textElement = screen.getByTestId('test-empty');
            expect(textElement).toBeInTheDocument();
            expect(textElement).toHaveTextContent('');
        });
    });

    describe('multi-line text rendering (new functionality)', () => {
        it('should render simple multi-line text with line breaks', () => {
            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-multiline"
                        note={"Line 1\nLine 2\nLine 3"}
                        textTheme={mockTextTheme}
                    />
                </svg>
            );

            const textElement = screen.getByTestId('test-multiline');
            expect(textElement).toBeInTheDocument();
            expect(textElement.getAttribute('transform')).toBe('');
            
            // Should have multiple tspan elements for each line
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(3);
            
            // Check content of each line
            expect(tspans[0]).toHaveTextContent('Line 1');
            expect(tspans[1]).toHaveTextContent('Line 2');
            expect(tspans[2]).toHaveTextContent('Line 3');
        });

        it('should handle multi-line text with empty lines', () => {
            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-empty-lines"
                        note={"Line 1\n\nLine 3"}
                        textTheme={mockTextTheme}
                    />
                </svg>
            );

            const textElement = screen.getByTestId('test-empty-lines');
            expect(textElement).toBeInTheDocument();
            
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(3);
            
            // First line
            expect(tspans[0]).toHaveTextContent('Line 1');
            // Empty line (should be present but may appear empty)
            expect(tspans[1]).toBeInTheDocument();
            // Third line
            expect(tspans[2]).toHaveTextContent('Line 3');
        });

        it('should handle multi-line text with long lines', () => {
            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-long-lines"
                        note={"Short line\nThis is a very long line that should NOT be split into multiple words\nAnother short line"}
                        textTheme={mockTextTheme}
                    />
                </svg>
            );

            const textElement = screen.getByTestId('test-long-lines');
            expect(textElement).toBeInTheDocument();
            
            const tspans = textElement.querySelectorAll('tspan');
            // Should have exactly 3 tspans - one for each line, no word wrapping
            expect(tspans.length).toBe(3);
            expect(tspans[0]).toHaveTextContent('Short line');
            expect(tspans[1]).toHaveTextContent('This is a very long line that should NOT be split into multiple words');
            expect(tspans[2]).toHaveTextContent('Another short line');
        });

        it('should handle single line with line break at end', () => {
            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-trailing-break"
                        note={"Single line\n"}
                        textTheme={mockTextTheme}
                    />
                </svg>
            );

            const textElement = screen.getByTestId('test-trailing-break');
            expect(textElement).toBeInTheDocument();
            
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(2);
            expect(tspans[0]).toHaveTextContent('Single line');
            expect(tspans[1]).toBeInTheDocument(); // Empty line
        });
    });

    describe('note vs text precedence', () => {
        it('should prioritize note over text when both are provided', () => {
            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-precedence"
                        text="This is text"
                        note={"This is note\nwith line break"}
                        textTheme={mockTextTheme}
                    />
                </svg>
            );

            const textElement = screen.getByTestId('test-precedence');
            expect(textElement).toBeInTheDocument();
            
            // Should render the note content, not the text content
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(2); // Exactly 2 lines, no word wrapping
            expect(textElement).toHaveTextContent('This is notewith line break');
        });

        it('should use text when note is not provided', () => {
            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-text-only"
                        text="Short text"
                        textTheme={mockTextTheme}
                    />
                </svg>
            );

            const textElement = screen.getByTestId('test-text-only');
            expect(textElement).toBeInTheDocument();
            expect(textElement).toHaveTextContent('Short text');
        });
    });

    describe('styling and attributes', () => {
        it('should apply correct styling to multi-line text', () => {
            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-styling"
                        note={"Line 1\nLine 2"}
                        textTheme={mockTextTheme}
                        className="custom-class"
                        textAnchor="start"
                    />
                </svg>
            );

            const textElement = screen.getByTestId('test-styling');
            expect(textElement).toHaveClass('custom-class');
            expect(textElement).toHaveAttribute('text-anchor', 'start');
            expect(textElement).toHaveAttribute('font-size', '14px');
            expect(textElement).toHaveAttribute('font-weight', 'normal');
        });

        it('should handle evolved text color for multi-line content', () => {
            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-evolved"
                        note={"Line 1\nLine 2"}
                        textTheme={mockTextTheme}
                        evolved={true}
                    />
                </svg>
            );

            const textElement = screen.getByTestId('test-evolved');
            expect(textElement).toHaveAttribute('fill', mockTextTheme.textColor);
        });
    });

    describe('real-world examples', () => {
        it('should handle documentation-style notes', () => {
            const docNote = "Documentation:\nThis component handles user authentication\n\nSee \"auth.js\" for implementation details";
            
            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-documentation"
                        note={docNote}
                        textTheme={mockTextTheme}
                    />
                </svg>
            );

            const textElement = screen.getByTestId('test-documentation');
            expect(textElement).toBeInTheDocument();
            
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(4); // Exactly 4 lines, no word wrapping
            
            // Check that the full text is preserved (spaces maintained in each line)
            expect(textElement).toHaveTextContent('Documentation:This component handles user authentication See "auth.js" for implementation details');
        });

        it('should handle code snippet notes', () => {
            const codeNote = "Code example:\nfunction test() {\n  return \"hello\";\n}";
            
            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-code"
                        note={codeNote}
                        textTheme={mockTextTheme}
                    />
                </svg>
            );

            const textElement = screen.getByTestId('test-code');
            expect(textElement).toBeInTheDocument();
            
            const tspans = textElement.querySelectorAll('tspan');
            expect(tspans.length).toBe(4); // Exactly 4 lines, no word wrapping
            
            // Check that the full code is preserved (spaces maintained in each line)
            expect(textElement).toHaveTextContent('Code example:function test() { return "hello";}');
        });

        it('should handle mixed content with long and short lines', () => {
            const mixedNote = "Title\nThis is a very long description that should be wrapped into multiple words\nShort\nEnd";
            
            render(
                <svg>
                    <ComponentTextSymbol
                        id="test-mixed"
                        note={mixedNote}
                        textTheme={mockTextTheme}
                    />
                </svg>
            );

            const textElement = screen.getByTestId('test-mixed');
            expect(textElement).toBeInTheDocument();
            
            const tspans = textElement.querySelectorAll('tspan');
            // Should have exactly 4 tspans - one for each line, no word wrapping
            expect(tspans.length).toBe(4);
            
            // Check each line content
            expect(tspans[0]).toHaveTextContent('Title');
            expect(tspans[1]).toHaveTextContent('This is a very long description that should be wrapped into multiple words');
            expect(tspans[2]).toHaveTextContent('Short');
            expect(tspans[3]).toHaveTextContent('End');
        });
    });
});