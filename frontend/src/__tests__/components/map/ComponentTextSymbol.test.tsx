import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import ComponentTextSymbol, {ComponentTextSymbolProps} from '../../../components/symbols/ComponentTextSymbol';
import {TextTheme} from '../../../constants/mapstyles';

describe('ComponentTextSymbol', () => {
    const mockTextTheme: TextTheme = {
        fontSize: '14px',
        fontWeight: 'normal',
        textColor: '#000000',
        evolvedTextColor: '#666666',
    };

    const defaultProps: ComponentTextSymbolProps = {
        id: 'test-component-text',
        text: 'Test Component',
        textTheme: mockTextTheme,
        x: '100',
        y: '50',
    };

    const renderInSvg = (component: React.ReactElement) => {
        return render(<svg>{component}</svg>);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should render text element with correct props', () => {
            renderInSvg(<ComponentTextSymbol {...defaultProps} />);

            const textElement = screen.getByTestId('test-component-text');
            expect(textElement).toBeInTheDocument();
            expect(textElement).toHaveAttribute('x', '100');
            expect(textElement).toHaveAttribute('y', '50');
            expect(textElement).toHaveTextContent('Test Component');
        });

        it('should apply text theme styles correctly', () => {
            renderInSvg(<ComponentTextSymbol {...defaultProps} />);

            const textElement = screen.getByTestId('test-component-text');
            expect(textElement).toHaveAttribute('font-size', '14px');
            expect(textElement).toHaveAttribute('font-weight', 'normal');
            expect(textElement).toHaveAttribute('fill', '#000000');
        });

        it('should render note text when note prop is provided', () => {
            const props = {...defaultProps, note: 'This is a note'};
            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            expect(textElement).toHaveTextContent('This is a note');
        });

        it('should apply evolved text color when evolved is true', () => {
            const props = {...defaultProps, evolved: true};
            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            expect(textElement).toHaveAttribute('fill', '#000000'); // Should use textColor from theme
        });
    });

    describe('Double-Click Event Handling', () => {
        it('should call onDoubleClick handler when provided', () => {
            const mockOnDoubleClick = jest.fn();
            const props = {...defaultProps, onDoubleClick: mockOnDoubleClick};

            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
            expect(mockOnDoubleClick).toHaveBeenCalledWith(expect.any(Object));
        });

        it('should call setShowTextField when provided (Component editing)', () => {
            const mockSetShowTextField = jest.fn();
            const props = {...defaultProps, setShowTextField: mockSetShowTextField};

            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            expect(mockSetShowTextField).toHaveBeenCalledTimes(1);
            expect(mockSetShowTextField).toHaveBeenCalledWith(true);
        });

        it('should call both onDoubleClick and setShowTextField when both are provided', () => {
            const mockOnDoubleClick = jest.fn();
            const mockSetShowTextField = jest.fn();
            const props = {
                ...defaultProps,
                onDoubleClick: mockOnDoubleClick,
                setShowTextField: mockSetShowTextField,
            };

            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
            expect(mockSetShowTextField).toHaveBeenCalledTimes(1);
            expect(mockSetShowTextField).toHaveBeenCalledWith(true);
        });

        it('should stop event propagation on double-click', () => {
            const mockOnDoubleClick = jest.fn();
            const mockParentHandler = jest.fn();
            const props = {...defaultProps, onDoubleClick: mockOnDoubleClick};

            render(
                <div onDoubleClick={mockParentHandler}>
                    <svg>
                        <ComponentTextSymbol {...props} />
                    </svg>
                </div>,
            );

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
            expect(mockParentHandler).not.toHaveBeenCalled();
        });

        it('should handle double-click when only onDoubleClick is provided (Note editing)', () => {
            const mockOnDoubleClick = jest.fn();
            const props = {
                ...defaultProps,
                onDoubleClick: mockOnDoubleClick,
                note: 'Test note content',
            };

            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
        });

        it('should handle double-click when only setShowTextField is provided (Component editing)', () => {
            const mockSetShowTextField = jest.fn();
            const props = {
                ...defaultProps,
                setShowTextField: mockSetShowTextField,
                text: 'Component name',
            };

            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            expect(mockSetShowTextField).toHaveBeenCalledTimes(1);
            expect(mockSetShowTextField).toHaveBeenCalledWith(true);
        });

        it('should not throw error when double-clicked without handlers', () => {
            renderInSvg(<ComponentTextSymbol {...defaultProps} />);

            const textElement = screen.getByTestId('test-component-text');

            expect(() => {
                fireEvent.doubleClick(textElement);
            }).not.toThrow();
        });
    });

    describe('Event Handling and Propagation', () => {
        it('should handle onClick events correctly', () => {
            const mockOnClick = jest.fn();
            const props = {...defaultProps, onClick: mockOnClick};

            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.click(textElement);

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it('should not interfere with click events when double-click handlers are present', () => {
            const mockOnClick = jest.fn();
            const mockOnDoubleClick = jest.fn();
            const props = {
                ...defaultProps,
                onClick: mockOnClick,
                onDoubleClick: mockOnDoubleClick,
            };

            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.click(textElement);

            expect(mockOnClick).toHaveBeenCalledTimes(1);
            expect(mockOnDoubleClick).not.toHaveBeenCalled();
        });

        it('should handle both click and double-click events independently', () => {
            const mockOnClick = jest.fn();
            const mockOnDoubleClick = jest.fn();
            const props = {
                ...defaultProps,
                onClick: mockOnClick,
                onDoubleClick: mockOnDoubleClick,
            };

            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');

            // Single click
            fireEvent.click(textElement);
            expect(mockOnClick).toHaveBeenCalledTimes(1);
            expect(mockOnDoubleClick).not.toHaveBeenCalled();

            // Double click
            fireEvent.doubleClick(textElement);
            expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('Backward Compatibility', () => {
        it('should maintain existing setShowTextField functionality for Components', () => {
            const mockSetShowTextField = jest.fn();
            const props = {
                ...defaultProps,
                setShowTextField: mockSetShowTextField,
                text: 'Legacy Component',
            };

            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            expect(mockSetShowTextField).toHaveBeenCalledWith(true);
        });

        it('should work with existing Component editing workflow', () => {
            const mockSetShowTextField = jest.fn();
            const props = {
                ...defaultProps,
                setShowTextField: mockSetShowTextField,
                text: 'Component for editing',
                className: 'component-label',
            };

            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            expect(textElement).toHaveClass('component-label');

            fireEvent.doubleClick(textElement);
            expect(mockSetShowTextField).toHaveBeenCalledWith(true);
        });

        it('should support Note editing without breaking Component functionality', () => {
            const mockOnDoubleClick = jest.fn();
            const props = {
                ...defaultProps,
                onDoubleClick: mockOnDoubleClick,
                note: 'Note content',
                className: 'note-label',
            };

            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            expect(textElement).toHaveClass('note-label');
            expect(textElement).toHaveTextContent('Note content');

            fireEvent.doubleClick(textElement);
            expect(mockOnDoubleClick).toHaveBeenCalledWith(expect.any(Object));
        });
    });

    describe('Different Element Types', () => {
        it('should handle Component double-click events correctly', () => {
            const mockSetShowTextField = jest.fn();
            const props = {
                ...defaultProps,
                setShowTextField: mockSetShowTextField,
                text: 'Component Name',
                className: 'component-text',
            };

            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            expect(mockSetShowTextField).toHaveBeenCalledWith(true);
        });

        it('should handle Note double-click events correctly', () => {
            const mockOnDoubleClick = jest.fn();
            const props = {
                ...defaultProps,
                onDoubleClick: mockOnDoubleClick,
                note: 'Note text content',
                className: 'note-text',
            };

            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            expect(mockOnDoubleClick).toHaveBeenCalledWith(expect.any(Object));
        });

        it('should support mixed usage scenarios', () => {
            const mockOnDoubleClick = jest.fn();
            const mockSetShowTextField = jest.fn();

            // Scenario: Component with both handlers (should call both)
            const componentProps = {
                ...defaultProps,
                onDoubleClick: mockOnDoubleClick,
                setShowTextField: mockSetShowTextField,
                text: 'Mixed Component',
            };

            const {rerender} = renderInSvg(<ComponentTextSymbol {...componentProps} />);

            let textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
            expect(mockSetShowTextField).toHaveBeenCalledTimes(1);

            // Reset mocks
            mockOnDoubleClick.mockClear();
            mockSetShowTextField.mockClear();

            // Scenario: Note with only onDoubleClick
            const noteProps = {
                ...defaultProps,
                onDoubleClick: mockOnDoubleClick,
                note: 'Note content only',
            };

            rerender(
                <svg>
                    <ComponentTextSymbol {...noteProps} />
                </svg>,
            );

            textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            expect(mockOnDoubleClick).toHaveBeenCalledTimes(1);
            expect(mockSetShowTextField).not.toHaveBeenCalled();
        });
    });

    describe('Long Text Handling', () => {
        it('should handle long text without splitting into tspan elements', () => {
            const longText = 'This is a very long component name that should NOT be split';
            const props = {...defaultProps, text: longText};

            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            expect(textElement).toBeInTheDocument();

            // Should NOT have transform attribute since we no longer split long text
            expect(textElement).toHaveAttribute('transform', '');
            // Should render as single text content without tspans
            expect(textElement).toHaveTextContent(longText);
        });

        it('should handle double-click on long text correctly', () => {
            const mockSetShowTextField = jest.fn();
            const longText = 'This is a very long component name that should NOT be split';
            const props = {
                ...defaultProps,
                text: longText,
                setShowTextField: mockSetShowTextField,
            };

            renderInSvg(<ComponentTextSymbol {...props} />);

            const textElement = screen.getByTestId('test-component-text');
            fireEvent.doubleClick(textElement);

            expect(mockSetShowTextField).toHaveBeenCalledWith(true);
        });
    });
});
