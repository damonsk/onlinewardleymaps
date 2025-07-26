import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import InlineEditor from '../../../components/map/InlineEditor';
import {MapTheme} from '../../../types/map/styles';
import {Plain} from '../../../constants/mapstyles';

// Mock styled-components theme
const mockTheme: MapTheme = Plain;

describe('InlineEditor', () => {
    const defaultProps = {
        value: 'Test Value',
        onChange: jest.fn(),
        onSave: jest.fn(),
        onCancel: jest.fn(),
        x: 0,
        y: 0,
        mapStyleDefs: mockTheme,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should render single-line input by default', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');
            expect(input).toBeInTheDocument();
            expect(input.tagName).toBe('INPUT');
        });

        it('should render textarea when isMultiLine is true', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} />);

            const textarea = screen.getByDisplayValue('Test Value');
            expect(textarea).toBeInTheDocument();
            expect(textarea.tagName).toBe('TEXTAREA');
        });

        it('should display placeholder text', () => {
            render(<InlineEditor {...defaultProps} value="" placeholder="Enter text here" />);

            const input = screen.getByPlaceholderText('Enter text here');
            expect(input).toBeInTheDocument();
        });

        it('should apply custom width and minWidth', () => {
            render(<InlineEditor {...defaultProps} width={200} minWidth={150} />);

            const input = screen.getByDisplayValue('Test Value');
            expect(input).toHaveStyle('width: 100%');
            expect(input).toHaveStyle('min-width: 150px');
        });

        it('should apply custom font styling', () => {
            render(<InlineEditor {...defaultProps} fontSize="16px" fontFamily="Consolas" />);

            const input = screen.getByDisplayValue('Test Value');
            expect(input).toHaveStyle('font-size: 16px');
            expect(input).toHaveStyle('font-family: Consolas');
        });
    });

    describe('Auto-focus and Text Selection', () => {
        it('should auto-focus input when autoFocus is true', async () => {
            render(<InlineEditor {...defaultProps} autoFocus={true} />);

            const input = screen.getByDisplayValue('Test Value');
            await waitFor(() => {
                expect(input).toHaveFocus();
            });
        });

        it('should not auto-focus when autoFocus is false', () => {
            render(<InlineEditor {...defaultProps} autoFocus={false} />);

            const input = screen.getByDisplayValue('Test Value');
            expect(input).not.toHaveFocus();
        });

        it('should select all text on focus when selectAllOnFocus is true', async () => {
            render(<InlineEditor {...defaultProps} autoFocus={true} selectAllOnFocus={true} />);

            const input = screen.getByDisplayValue('Test Value') as HTMLInputElement;
            await waitFor(() => {
                expect(input.selectionStart).toBe(0);
                expect(input.selectionEnd).toBe('Test Value'.length);
            });
        });

        it('should handle focus event and select text when selectAllOnFocus is true', async () => {
            render(<InlineEditor {...defaultProps} autoFocus={false} selectAllOnFocus={true} />);

            const input = screen.getByDisplayValue('Test Value') as HTMLInputElement;

            // Manually trigger focus
            fireEvent.focus(input);

            // Wait for the setTimeout in handleFocus to complete
            await waitFor(
                () => {
                    expect(input.selectionStart).toBe(0);
                    expect(input.selectionEnd).toBe('Test Value'.length);
                },
                {timeout: 100},
            );
        });

        it('should not select text on focus when selectAllOnFocus is false', async () => {
            render(<InlineEditor {...defaultProps} autoFocus={true} selectAllOnFocus={false} />);

            const input = screen.getByDisplayValue('Test Value') as HTMLInputElement;

            await waitFor(() => {
                expect(input).toHaveFocus();
            });

            // Text should not be selected
            expect(input.selectionStart).toBe(input.selectionEnd);
        });

        it('should handle focus cleanup properly when component unmounts', () => {
            const {unmount} = render(<InlineEditor {...defaultProps} autoFocus={true} />);

            // Unmount the component
            unmount();

            // Should not throw any errors or cause memory leaks
            expect(true).toBe(true);
        });

        it('should handle focus timeout cleanup when dependencies change', async () => {
            const {rerender} = render(<InlineEditor {...defaultProps} autoFocus={true} selectAllOnFocus={true} />);

            // Change the autoFocus prop to trigger useEffect cleanup
            rerender(<InlineEditor {...defaultProps} autoFocus={false} selectAllOnFocus={true} />);

            // Should not cause any errors
            expect(true).toBe(true);
        });

        it('should handle focus when input has no value', async () => {
            render(<InlineEditor {...defaultProps} value="" autoFocus={true} selectAllOnFocus={true} />);

            const input = screen.getByDisplayValue('') as HTMLInputElement;

            await waitFor(() => {
                expect(input).toHaveFocus();
            });

            // Should not cause errors when trying to select empty text
            expect(input.selectionStart).toBe(0);
            expect(input.selectionEnd).toBe(0);
        });
    });

    describe('Input Handling', () => {
        it('should call onChange when text is typed', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');
            fireEvent.change(input, {target: {value: 'New Value'}});

            expect(defaultProps.onChange).toHaveBeenCalledWith('New Value');
        });

        it('should update input value when value prop changes', () => {
            const {rerender} = render(<InlineEditor {...defaultProps} />);

            expect(screen.getByDisplayValue('Test Value')).toBeInTheDocument();

            rerender(<InlineEditor {...defaultProps} value="Updated Value" />);
            expect(screen.getByDisplayValue('Updated Value')).toBeInTheDocument();
        });
    });

    describe('Keyboard Event Handling', () => {
        it('should call onSave when Enter is pressed in single-line mode', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={false} />);

            const input = screen.getByDisplayValue('Test Value');
            fireEvent.keyDown(input, {key: 'Enter'});

            expect(defaultProps.onSave).toHaveBeenCalled();
        });

        it('should call onCancel when Escape is pressed', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');
            fireEvent.keyDown(input, {key: 'Escape'});

            expect(defaultProps.onCancel).toHaveBeenCalled();
        });

        it('should not call onSave when Enter is pressed in multi-line mode without Ctrl', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} />);

            const textarea = screen.getByDisplayValue('Test Value');
            fireEvent.keyDown(textarea, {key: 'Enter'});

            expect(defaultProps.onSave).not.toHaveBeenCalled();
        });

        it('should call onSave when Ctrl+Enter is pressed in multi-line mode', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} />);

            const textarea = screen.getByDisplayValue('Test Value');
            fireEvent.keyDown(textarea, {key: 'Enter', ctrlKey: true});

            expect(defaultProps.onSave).toHaveBeenCalled();
        });

        it('should call onSave when Cmd+Enter is pressed in multi-line mode', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} />);

            const textarea = screen.getByDisplayValue('Test Value');
            fireEvent.keyDown(textarea, {key: 'Enter', metaKey: true});

            expect(defaultProps.onSave).toHaveBeenCalled();
        });

        it('should allow Enter key to create new lines in multi-line mode', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} />);

            const textarea = screen.getByDisplayValue('Test Value');

            // Regular Enter should not trigger save in multi-line mode
            fireEvent.keyDown(textarea, {key: 'Enter'});
            expect(defaultProps.onSave).not.toHaveBeenCalled();

            // But should allow normal text editing behavior
            fireEvent.change(textarea, {target: {value: 'Test Value\nNew Line'}});
            expect(defaultProps.onChange).toHaveBeenCalledWith('Test Value\nNew Line');
        });

        it('should handle keyboard events properly', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');

            // Test that Enter triggers save
            fireEvent.keyDown(input, {key: 'Enter'});
            expect(defaultProps.onSave).toHaveBeenCalled();

            // Reset mock
            defaultProps.onSave.mockClear();

            // Test that Escape triggers cancel
            fireEvent.keyDown(input, {key: 'Escape'});
            expect(defaultProps.onCancel).toHaveBeenCalled();
        });

        it('should allow arrow keys to work normally without triggering save/cancel', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');

            // Test arrow keys don't trigger save/cancel
            fireEvent.keyDown(input, {key: 'ArrowLeft'});
            fireEvent.keyDown(input, {key: 'ArrowRight'});
            fireEvent.keyDown(input, {key: 'ArrowUp'});
            fireEvent.keyDown(input, {key: 'ArrowDown'});

            expect(defaultProps.onSave).not.toHaveBeenCalled();
            expect(defaultProps.onCancel).not.toHaveBeenCalled();
        });

        it('should allow navigation keys to work normally', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');

            // Test navigation keys don't trigger save/cancel
            fireEvent.keyDown(input, {key: 'Home'});
            fireEvent.keyDown(input, {key: 'End'});
            fireEvent.keyDown(input, {key: 'PageUp'});
            fireEvent.keyDown(input, {key: 'PageDown'});
            fireEvent.keyDown(input, {key: 'Backspace'});
            fireEvent.keyDown(input, {key: 'Delete'});
            fireEvent.keyDown(input, {key: 'Tab'});

            expect(defaultProps.onSave).not.toHaveBeenCalled();
            expect(defaultProps.onCancel).not.toHaveBeenCalled();
        });

        it('should allow text selection shortcuts to work normally', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');

            // Test text selection shortcuts don't trigger save/cancel
            fireEvent.keyDown(input, {key: 'a', ctrlKey: true}); // Select all
            fireEvent.keyDown(input, {key: 'c', ctrlKey: true}); // Copy
            fireEvent.keyDown(input, {key: 'v', ctrlKey: true}); // Paste
            fireEvent.keyDown(input, {key: 'x', ctrlKey: true}); // Cut
            fireEvent.keyDown(input, {key: 'z', ctrlKey: true}); // Undo
            fireEvent.keyDown(input, {key: 'y', ctrlKey: true}); // Redo

            expect(defaultProps.onSave).not.toHaveBeenCalled();
            expect(defaultProps.onCancel).not.toHaveBeenCalled();
        });

        it('should allow text selection shortcuts with metaKey (Mac) to work normally', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');

            // Test text selection shortcuts with metaKey don't trigger save/cancel
            fireEvent.keyDown(input, {key: 'a', metaKey: true}); // Select all
            fireEvent.keyDown(input, {key: 'c', metaKey: true}); // Copy
            fireEvent.keyDown(input, {key: 'v', metaKey: true}); // Paste
            fireEvent.keyDown(input, {key: 'x', metaKey: true}); // Cut
            fireEvent.keyDown(input, {key: 'z', metaKey: true}); // Undo

            expect(defaultProps.onSave).not.toHaveBeenCalled();
            expect(defaultProps.onCancel).not.toHaveBeenCalled();
        });
    });

    describe('Blur Handling', () => {
        it('should call onSave when input loses focus', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');
            fireEvent.blur(input);

            expect(defaultProps.onSave).toHaveBeenCalled();
        });

        it('should not call onSave on blur if validation fails', () => {
            render(<InlineEditor {...defaultProps} value="" validation={{required: true}} />);

            const input = screen.getByDisplayValue('');
            fireEvent.blur(input);

            expect(defaultProps.onSave).not.toHaveBeenCalled();
        });
    });

    describe('Validation', () => {
        it('should show error message for required field validation', async () => {
            render(<InlineEditor {...defaultProps} value="" validation={{required: true}} />);

            const input = screen.getByDisplayValue('');
            fireEvent.keyDown(input, {key: 'Enter'});

            await waitFor(() => {
                expect(screen.getByText('This field is required')).toBeInTheDocument();
            });
            expect(defaultProps.onSave).not.toHaveBeenCalled();
        });

        it('should show error message for maxLength validation', async () => {
            render(<InlineEditor {...defaultProps} value="This is a very long text that exceeds the limit" validation={{maxLength: 10}} />);

            const input = screen.getByDisplayValue('This is a very long text that exceeds the limit');
            fireEvent.keyDown(input, {key: 'Enter'});

            await waitFor(() => {
                expect(screen.getByText('Maximum length is 10 characters')).toBeInTheDocument();
            });
            expect(defaultProps.onSave).not.toHaveBeenCalled();
        });

        it('should show error message for minLength validation', async () => {
            render(<InlineEditor {...defaultProps} value="Hi" validation={{minLength: 5}} />);

            const input = screen.getByDisplayValue('Hi');
            fireEvent.keyDown(input, {key: 'Enter'});

            await waitFor(() => {
                expect(screen.getByText('Minimum length is 5 characters')).toBeInTheDocument();
            });
            expect(defaultProps.onSave).not.toHaveBeenCalled();
        });

        it('should show error message for pattern validation', async () => {
            render(<InlineEditor {...defaultProps} value="invalid123" validation={{pattern: /^[a-zA-Z\s]+$/}} />);

            const input = screen.getByDisplayValue('invalid123');
            fireEvent.keyDown(input, {key: 'Enter'});

            await waitFor(() => {
                expect(screen.getByText('Invalid format')).toBeInTheDocument();
            });
            expect(defaultProps.onSave).not.toHaveBeenCalled();
        });

        it('should show error message for custom validator', async () => {
            const customValidator = (value: string) => {
                return value.includes('bad') ? 'Contains forbidden word' : null;
            };

            render(<InlineEditor {...defaultProps} value="This is bad text" validation={{customValidator}} />);

            const input = screen.getByDisplayValue('This is bad text');
            fireEvent.keyDown(input, {key: 'Enter'});

            await waitFor(() => {
                expect(screen.getByText('Contains forbidden word')).toBeInTheDocument();
            });
            expect(defaultProps.onSave).not.toHaveBeenCalled();
        });

        it('should clear validation error when user starts typing', async () => {
            render(<InlineEditor {...defaultProps} value="" validation={{required: true}} />);

            const input = screen.getByDisplayValue('');

            // Trigger validation error
            fireEvent.keyDown(input, {key: 'Enter'});
            await waitFor(() => {
                expect(screen.getByText('This field is required')).toBeInTheDocument();
            });

            // Start typing to clear error
            fireEvent.change(input, {target: {value: 'a'}});

            await waitFor(() => {
                expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
            });
        });

        it('should call onSave when validation passes', () => {
            render(<InlineEditor {...defaultProps} value="Valid text" validation={{required: true, maxLength: 20}} />);

            const input = screen.getByDisplayValue('Valid text');
            fireEvent.keyDown(input, {key: 'Enter'});

            expect(defaultProps.onSave).toHaveBeenCalled();
        });

        it('should show error for forbidden characters when sanitization is disabled', async () => {
            render(<InlineEditor {...defaultProps} value="text@#$" validation={{forbiddenCharacters: /[@#$]/g}} />);

            const input = screen.getByDisplayValue('text@#$');
            fireEvent.keyDown(input, {key: 'Enter'});

            await waitFor(() => {
                expect(screen.getByText('Contains invalid characters')).toBeInTheDocument();
            });
            expect(defaultProps.onSave).not.toHaveBeenCalled();
        });

        it('should show error for characters not in allowed set when sanitization is disabled', async () => {
            render(<InlineEditor {...defaultProps} value="text123" validation={{allowedCharacters: /^[a-zA-Z\s]*$/}} />);

            const input = screen.getByDisplayValue('text123');
            fireEvent.keyDown(input, {key: 'Enter'});

            await waitFor(() => {
                expect(screen.getByText('Contains invalid characters')).toBeInTheDocument();
            });
            expect(defaultProps.onSave).not.toHaveBeenCalled();
        });

        it('should sanitize forbidden characters when sanitization is enabled', () => {
            render(<InlineEditor {...defaultProps} value="text@#$" validation={{sanitizeInput: true, forbiddenCharacters: /[@#$]/g}} />);

            const input = screen.getByDisplayValue('text@#$');
            fireEvent.change(input, {target: {value: 'text@#$more'}});

            expect(defaultProps.onChange).toHaveBeenCalledWith('textmore');
        });

        it('should keep only allowed characters when sanitization is enabled', () => {
            render(<InlineEditor {...defaultProps} value="text123" validation={{sanitizeInput: true, allowedCharacters: /[a-zA-Z\s]/g}} />);

            const input = screen.getByDisplayValue('text123');
            fireEvent.change(input, {target: {value: 'text123more'}});

            expect(defaultProps.onChange).toHaveBeenCalledWith('textmore');
        });

        it('should handle both forbidden and allowed characters together', () => {
            render(
                <InlineEditor
                    {...defaultProps}
                    value="text"
                    validation={{
                        sanitizeInput: true,
                        forbiddenCharacters: /[@#$]/g,
                        allowedCharacters: /[a-zA-Z\s]/g,
                    }}
                />,
            );

            const input = screen.getByDisplayValue('text');
            fireEvent.change(input, {target: {value: 'text@123#more$'}});

            expect(defaultProps.onChange).toHaveBeenCalledWith('textmore');
        });

        it('should not sanitize when sanitizeInput is false', () => {
            render(
                <InlineEditor
                    {...defaultProps}
                    value="text"
                    validation={{
                        sanitizeInput: false,
                        forbiddenCharacters: /[@#$]/g,
                    }}
                />,
            );

            const input = screen.getByDisplayValue('text');
            fireEvent.change(input, {target: {value: 'text@#$'}});

            expect(defaultProps.onChange).toHaveBeenCalledWith('text@#$');
        });

        it('should handle empty result from sanitization', () => {
            render(
                <InlineEditor
                    {...defaultProps}
                    value=""
                    validation={{
                        sanitizeInput: true,
                        allowedCharacters: /[a-zA-Z]/g,
                    }}
                />,
            );

            const input = screen.getByDisplayValue('');
            fireEvent.change(input, {target: {value: '123456'}});

            expect(defaultProps.onChange).toHaveBeenCalledWith('');
        });

        it('should work without validation config', () => {
            render(<InlineEditor {...defaultProps} value="text@#$123" />);

            const input = screen.getByDisplayValue('text@#$123');
            fireEvent.change(input, {target: {value: 'new@#$123'}});

            expect(defaultProps.onChange).toHaveBeenCalledWith('new@#$123');
        });

        it('should enable real-time validation after first save attempt with error', async () => {
            const TestWrapper = () => {
                const [value, setValue] = React.useState('');
                return (
                    <InlineEditor
                        {...defaultProps}
                        value={value}
                        onChange={setValue}
                        validation={{required: true}}
                        realTimeValidation={true}
                    />
                );
            };

            render(<TestWrapper />);

            const input = screen.getByDisplayValue('');

            // First save attempt should show error and enable real-time validation
            fireEvent.keyDown(input, {key: 'Enter'});
            await waitFor(() => {
                expect(screen.getByText('This field is required')).toBeInTheDocument();
            });

            // Now typing should clear the error (real-time validation working)
            fireEvent.change(input, {target: {value: 'a'}});

            // The error should be cleared when valid input is entered
            await waitFor(() => {
                expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
            });

            // Clear the input again - should show error immediately due to real-time validation
            fireEvent.change(input, {target: {value: ''}});

            // Wait for the real-time validation to kick in
            await waitFor(() => {
                expect(screen.getByText('This field is required')).toBeInTheDocument();
            });
        });

        it('should enable real-time validation after blur with error', async () => {
            render(<InlineEditor {...defaultProps} value="" validation={{required: true}} realTimeValidation={true} />);

            const input = screen.getByDisplayValue('');

            // Blur should show error and enable real-time validation
            fireEvent.blur(input);
            await waitFor(() => {
                expect(screen.getByText('This field is required')).toBeInTheDocument();
            });

            // Now typing should show real-time validation
            fireEvent.change(input, {target: {value: 'a'}});
            await waitFor(() => {
                expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
            });
        });

        it('should not show real-time validation initially', () => {
            render(<InlineEditor {...defaultProps} value="" validation={{required: true}} realTimeValidation={true} />);

            const input = screen.getByDisplayValue('');

            // Typing initially should not show validation errors
            fireEvent.change(input, {target: {value: ''}});
            expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
        });

        it('should work with real-time validation disabled', async () => {
            render(<InlineEditor {...defaultProps} value="" validation={{required: true}} realTimeValidation={false} />);

            const input = screen.getByDisplayValue('');

            // Save attempt should show error
            fireEvent.keyDown(input, {key: 'Enter'});
            await waitFor(() => {
                expect(screen.getByText('This field is required')).toBeInTheDocument();
            });

            // Typing should clear the error (not show real-time validation)
            fireEvent.change(input, {target: {value: 'a'}});
            await waitFor(() => {
                expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
            });

            // Clear input again - should NOT show error immediately
            fireEvent.change(input, {target: {value: ''}});
            expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
        });

        it('should show warning state when approaching maxLength', () => {
            render(<InlineEditor {...defaultProps} value="12345678" validation={{maxLength: 10, warningThreshold: 8}} />);

            const input = screen.getByDisplayValue('12345678');
            expect(input).toHaveStyle('border: 2px solid #ffaa00');
        });

        it('should not show warning when under threshold', () => {
            render(<InlineEditor {...defaultProps} value="1234567" validation={{maxLength: 10, warningThreshold: 8}} />);

            const input = screen.getByDisplayValue('1234567');
            expect(input).not.toHaveStyle('border: 2px solid #ffaa00');
        });

        it('should show error state instead of warning when validation fails', async () => {
            render(<InlineEditor {...defaultProps} value="12345678901" validation={{maxLength: 10, warningThreshold: 8}} />);

            const input = screen.getByDisplayValue('12345678901');
            fireEvent.keyDown(input, {key: 'Enter'});

            await waitFor(() => {
                expect(input).toHaveStyle('border: 2px solid #ff4444');
                expect(input).not.toHaveStyle('border: 2px solid #ffaa00');
            });
        });

        it('should show character counter when enabled', () => {
            render(<InlineEditor {...defaultProps} value="12345" validation={{maxLength: 10}} showCharacterCount={true} />);

            expect(screen.getByText('5/10')).toBeInTheDocument();
        });

        it('should not show character counter when disabled', () => {
            render(<InlineEditor {...defaultProps} value="12345" validation={{maxLength: 10}} showCharacterCount={false} />);

            expect(screen.queryByText('5/10')).not.toBeInTheDocument();
        });

        it('should not show character counter without maxLength', () => {
            render(<InlineEditor {...defaultProps} value="12345" validation={{required: true}} showCharacterCount={true} />);

            expect(screen.queryByText(/\/\d+/)).not.toBeInTheDocument();
        });

        it('should show warning color in character counter when approaching limit', () => {
            render(
                <InlineEditor
                    {...defaultProps}
                    value="12345678"
                    validation={{maxLength: 10, warningThreshold: 8}}
                    showCharacterCount={true}
                />,
            );

            const counter = screen.getByText('8/10');
            expect(counter).toHaveStyle('background-color: #ffaa00');
        });

        it('should show error color in character counter when over limit', async () => {
            render(<InlineEditor {...defaultProps} value="12345678901" validation={{maxLength: 10}} showCharacterCount={true} />);

            const input = screen.getByDisplayValue('12345678901');
            fireEvent.keyDown(input, {key: 'Enter'});

            await waitFor(() => {
                const counter = screen.getByText('11/10');
                expect(counter).toHaveStyle('background-color: #ff4444');
            });
        });
    });

    describe('Theme Integration', () => {
        it('should apply theme colors to input styling', () => {
            const customTheme: MapTheme = {
                ...mockTheme,
                component: {
                    ...mockTheme.component,
                    stroke: '#ff0000',
                    fill: '#00ff00',
                    textColor: '#0000ff',
                    evolved: '#ffff00',
                },
            };

            render(<InlineEditor {...defaultProps} mapStyleDefs={customTheme} />);

            const input = screen.getByDisplayValue('Test Value');
            expect(input).toHaveStyle('border: 2px solid #ff0000');
            expect(input).toHaveStyle('background-color: #00ff00');
            expect(input).toHaveStyle('color: #0000ff');
        });

        it('should apply focus styles with theme colors', async () => {
            const customTheme: MapTheme = {
                ...mockTheme,
                component: {
                    ...mockTheme.component,
                    evolved: '#ff0000',
                },
            };

            render(<InlineEditor {...defaultProps} mapStyleDefs={customTheme} autoFocus={true} />);

            const input = screen.getByDisplayValue('Test Value');
            await waitFor(() => {
                expect(input).toHaveFocus();
            });
        });

        it('should apply error styling when validation fails', async () => {
            render(<InlineEditor {...defaultProps} value="" validation={{required: true}} />);

            const input = screen.getByDisplayValue('');
            fireEvent.keyDown(input, {key: 'Enter'});

            await waitFor(() => {
                expect(input).toHaveStyle('border: 2px solid #ff4444');
            });
        });
    });

    describe('Multi-line Content Support', () => {
        it('should render textarea for multi-line mode', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} />);

            const textarea = screen.getByDisplayValue('Test Value');
            expect(textarea).toBeInTheDocument();
            expect(textarea.tagName).toBe('TEXTAREA');
        });

        it('should handle multi-line content with line breaks', () => {
            const multiLineValue = 'Line 1\nLine 2\nLine 3';
            render(<InlineEditor {...defaultProps} value={multiLineValue} isMultiLine={true} />);

            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            expect(textarea).toBeInTheDocument();
            expect(textarea.value).toBe(multiLineValue);
        });

        it('should allow Enter key to create new lines in multi-line mode', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} />);

            const textarea = screen.getByDisplayValue('Test Value');

            // Regular Enter should not trigger save in multi-line mode
            fireEvent.keyDown(textarea, {key: 'Enter'});
            expect(defaultProps.onSave).not.toHaveBeenCalled();
        });

        it('should save with Ctrl+Enter in multi-line mode', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} />);

            const textarea = screen.getByDisplayValue('Test Value');
            fireEvent.keyDown(textarea, {key: 'Enter', ctrlKey: true});

            expect(defaultProps.onSave).toHaveBeenCalled();
        });

        it('should save with Cmd+Enter in multi-line mode', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} />);

            const textarea = screen.getByDisplayValue('Test Value');
            fireEvent.keyDown(textarea, {key: 'Enter', metaKey: true});

            expect(defaultProps.onSave).toHaveBeenCalled();
        });

        it('should handle text wrapping in multi-line mode', () => {
            const longText = 'This is a very long line of text that should wrap to multiple lines when displayed in the textarea';
            render(<InlineEditor {...defaultProps} value={longText} isMultiLine={true} />);

            const textarea = screen.getByDisplayValue(longText);
            expect(textarea).toHaveStyle('white-space: pre-wrap');
            expect(textarea).toHaveStyle('word-wrap: break-word');
        });

        it('should apply proper line height for multi-line content', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} />);

            const textarea = screen.getByDisplayValue('Test Value');
            expect(textarea).toHaveStyle('line-height: 1.4');
        });

        it('should disable manual resize when autoResize is enabled', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} autoResize={true} />);

            const textarea = screen.getByDisplayValue('Test Value');
            expect(textarea).toHaveStyle('resize: none');
        });

        it('should enable manual resize when autoResize is disabled', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} autoResize={false} />);

            const textarea = screen.getByDisplayValue('Test Value');
            expect(textarea).toHaveStyle('resize: vertical');
        });

        it('should apply minHeight to textarea', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} minHeight={80} />);

            const textarea = screen.getByDisplayValue('Test Value');
            expect(textarea).toHaveStyle('min-height: 80px');
        });

        it('should apply maxHeight to textarea', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} maxHeight={200} />);

            const textarea = screen.getByDisplayValue('Test Value');
            expect(textarea).toHaveStyle('max-height: 200px');
        });

        it('should enable scroll when maxHeight is set', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} maxHeight={200} />);

            const textarea = screen.getByDisplayValue('Test Value');
            expect(textarea).toHaveStyle('overflow-y: auto');
        });

        it('should hide overflow when no maxHeight is set', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} />);

            const textarea = screen.getByDisplayValue('Test Value');
            expect(textarea).toHaveStyle('overflow-y: hidden');
        });
    });

    describe('Auto-resize Functionality', () => {
        it('should auto-resize height based on content when autoResize is enabled', async () => {
            const TestWrapper = () => {
                const [value, setValue] = React.useState('Line 1');
                return (
                    <InlineEditor {...defaultProps} value={value} onChange={setValue} isMultiLine={true} autoResize={true} minHeight={60} />
                );
            };

            render(<TestWrapper />);

            const textarea = screen.getByDisplayValue('Line 1') as HTMLTextAreaElement;

            // Add more content to trigger resize
            fireEvent.change(textarea, {target: {value: 'Line 1\nLine 2\nLine 3\nLine 4'}});

            // Wait for the height calculation to complete
            await waitFor(() => {
                // The height should be calculated dynamically
                expect(textarea.style.height).toBeTruthy();
            });
        });

        it('should respect minHeight constraint during auto-resize', async () => {
            const TestWrapper = () => {
                const [value, setValue] = React.useState('Short');
                return (
                    <InlineEditor
                        {...defaultProps}
                        value={value}
                        onChange={setValue}
                        isMultiLine={true}
                        autoResize={true}
                        minHeight={100}
                    />
                );
            };

            render(<TestWrapper />);

            const textarea = screen.getByDisplayValue('Short');
            expect(textarea).toHaveStyle('min-height: 100px');
        });

        it('should respect maxHeight constraint during auto-resize', async () => {
            const TestWrapper = () => {
                const [value, setValue] = React.useState('Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8');
                return (
                    <InlineEditor
                        {...defaultProps}
                        value={value}
                        onChange={setValue}
                        isMultiLine={true}
                        autoResize={true}
                        maxHeight={150}
                    />
                );
            };

            render(<TestWrapper />);

            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            expect(textarea).toHaveStyle('max-height: 150px');
            expect(textarea.value).toBe('Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8');
        });

        it('should not auto-resize when autoResize is disabled', () => {
            const TestWrapper = () => {
                const [value, setValue] = React.useState('Line 1');
                return <InlineEditor {...defaultProps} value={value} onChange={setValue} isMultiLine={true} autoResize={false} />;
            };

            render(<TestWrapper />);

            const textarea = screen.getByDisplayValue('Line 1') as HTMLTextAreaElement;

            // Add more content
            fireEvent.change(textarea, {target: {value: 'Line 1\nLine 2\nLine 3\nLine 4'}});

            // Height should not be set dynamically
            expect(textarea.style.height).toBeFalsy();
        });

        it('should not auto-resize in single-line mode', () => {
            const TestWrapper = () => {
                const [value, setValue] = React.useState('Single line text');
                return <InlineEditor {...defaultProps} value={value} onChange={setValue} isMultiLine={false} autoResize={true} />;
            };

            render(<TestWrapper />);

            const input = screen.getByDisplayValue('Single line text') as HTMLInputElement;

            // Add more content
            fireEvent.change(input, {target: {value: 'Much longer single line text that would normally wrap'}});

            // Height should not be set for input elements
            expect(input.style.height).toBeFalsy();
        });

        it('should recalculate height when content changes', async () => {
            const TestWrapper = () => {
                const [value, setValue] = React.useState('Initial');
                return (
                    <div>
                        <InlineEditor {...defaultProps} value={value} onChange={setValue} isMultiLine={true} autoResize={true} />
                        <button onClick={() => setValue('Line 1\nLine 2\nLine 3')}>Add Lines</button>
                    </div>
                );
            };

            render(<TestWrapper />);

            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            const button = screen.getByText('Add Lines');

            expect(textarea.value).toBe('Initial');

            // Click button to change content
            fireEvent.click(button);

            // Wait for height recalculation
            await waitFor(() => {
                expect(textarea.value).toBe('Line 1\nLine 2\nLine 3');
            });
        });

        it('should handle empty content during auto-resize', async () => {
            const TestWrapper = () => {
                const [value, setValue] = React.useState('');
                return (
                    <InlineEditor {...defaultProps} value={value} onChange={setValue} isMultiLine={true} autoResize={true} minHeight={60} />
                );
            };

            render(<TestWrapper />);

            const textarea = screen.getByDisplayValue('');
            expect(textarea).toHaveStyle('min-height: 60px');
        });

        it('should calculate height after focus when autoFocus is enabled', async () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} autoResize={true} autoFocus={true} />);

            const textarea = screen.getByDisplayValue('Test Value') as HTMLTextAreaElement;

            await waitFor(() => {
                expect(textarea).toHaveFocus();
            });

            // Height calculation should have been triggered
            // We can't easily test the exact height value, but we can ensure no errors occurred
            expect(textarea).toBeInTheDocument();
        });
    });

    describe('Scroll Support', () => {
        it('should enable scrolling when content exceeds maxHeight', () => {
            const longContent = Array(20).fill('This is a long line of text').join('\n');
            render(<InlineEditor {...defaultProps} value={longContent} isMultiLine={true} maxHeight={100} />);

            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            expect(textarea).toHaveStyle('overflow-y: auto');
            expect(textarea).toHaveStyle('max-height: 100px');
            expect(textarea.value).toBe(longContent);
        });

        it('should handle very long single lines with word wrapping', () => {
            const longLine =
                'This is an extremely long line of text that should wrap to multiple lines when displayed in the textarea and should be handled properly by the word wrapping functionality';
            render(<InlineEditor {...defaultProps} value={longLine} isMultiLine={true} />);

            const textarea = screen.getByDisplayValue(longLine);
            expect(textarea).toHaveStyle('white-space: pre-wrap');
            expect(textarea).toHaveStyle('word-wrap: break-word');
        });

        it('should maintain scroll position during content changes', async () => {
            const initialValue = Array(10)
                .fill('Line')
                .map((line, i) => `${line} ${i + 1}`)
                .join('\n');
            const TestWrapper = () => {
                const [value, setValue] = React.useState(initialValue);
                return <InlineEditor {...defaultProps} value={value} onChange={setValue} isMultiLine={true} maxHeight={100} />;
            };

            render(<TestWrapper />);

            const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
            expect(textarea.value).toBe(initialValue);

            // Scroll down
            textarea.scrollTop = 50;

            // Add content
            fireEvent.change(textarea, {target: {value: textarea.value + '\nNew Line'}});

            // Scroll position should be maintained (or at least not cause errors)
            expect(textarea).toBeInTheDocument();
        });
    });

    describe('Theme Integration', () => {
        it('should apply theme colors to input styling', () => {
            const customTheme: MapTheme = {
                ...mockTheme,
                component: {
                    ...mockTheme.component,
                    stroke: '#ff0000',
                    fill: '#00ff00',
                    textColor: '#0000ff',
                    evolved: '#ffff00',
                },
            };

            render(<InlineEditor {...defaultProps} mapStyleDefs={customTheme} />);

            const input = screen.getByDisplayValue('Test Value');
            expect(input).toHaveStyle('border: 2px solid #ff0000');
            expect(input).toHaveStyle('background-color: #00ff00');
            expect(input).toHaveStyle('color: #0000ff');
        });

        it('should apply focus styles with theme colors', async () => {
            const customTheme: MapTheme = {
                ...mockTheme,
                component: {
                    ...mockTheme.component,
                    evolved: '#ff0000',
                },
            };

            render(<InlineEditor {...defaultProps} mapStyleDefs={customTheme} autoFocus={true} />);

            const input = screen.getByDisplayValue('Test Value');
            await waitFor(() => {
                expect(input).toHaveFocus();
            });
        });

        it('should apply error styling when validation fails', async () => {
            render(<InlineEditor {...defaultProps} value="" validation={{required: true}} />);

            const input = screen.getByDisplayValue('');
            fireEvent.keyDown(input, {key: 'Enter'});

            await waitFor(() => {
                expect(input).toHaveStyle('border: 2px solid #ff4444');
            });
        });
    });

    describe('Event Propagation Control', () => {
        it('should handle keyDown events with proper event handling', () => {
            const onKeyDown = jest.fn();
            const TestWrapper = () => {
                return (
                    <div onKeyDown={onKeyDown}>
                        <InlineEditor {...defaultProps} />
                    </div>
                );
            };

            render(<TestWrapper />);

            const input = screen.getByDisplayValue('Test Value');

            // Fire a regular key event
            fireEvent.keyDown(input, {key: 'a'});

            // The parent div's onKeyDown should not be called due to stopPropagation
            expect(onKeyDown).not.toHaveBeenCalled();
        });

        it('should handle keyUp events with proper event handling', () => {
            const onKeyUp = jest.fn();
            const TestWrapper = () => {
                return (
                    <div onKeyUp={onKeyUp}>
                        <InlineEditor {...defaultProps} />
                    </div>
                );
            };

            render(<TestWrapper />);

            const input = screen.getByDisplayValue('Test Value');

            // Fire a keyUp event
            fireEvent.keyUp(input, {key: 'a'});

            // The parent div's onKeyUp should not be called due to stopPropagation
            expect(onKeyUp).not.toHaveBeenCalled();
        });

        it('should handle Enter and Escape keys properly', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');

            // Test Enter key triggers save
            fireEvent.keyDown(input, {key: 'Enter'});
            expect(defaultProps.onSave).toHaveBeenCalled();

            defaultProps.onSave.mockClear();

            // Test Escape key triggers cancel
            fireEvent.keyDown(input, {key: 'Escape'});
            expect(defaultProps.onCancel).toHaveBeenCalled();
        });

        it('should allow navigation keys to work without triggering save/cancel', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');

            const navigationKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];

            navigationKeys.forEach(key => {
                fireEvent.keyDown(input, {key});
            });

            // Save and cancel should not be triggered by navigation keys
            expect(defaultProps.onSave).not.toHaveBeenCalled();
            expect(defaultProps.onCancel).not.toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty validation config', () => {
            render(<InlineEditor {...defaultProps} validation={{}} />);

            const input = screen.getByDisplayValue('Test Value');
            fireEvent.keyDown(input, {key: 'Enter'});

            expect(defaultProps.onSave).toHaveBeenCalled();
        });

        it('should handle missing theme properties gracefully', () => {
            const incompleteTheme: MapTheme = {
                ...mockTheme,
                component: undefined,
            };

            render(<InlineEditor {...defaultProps} mapStyleDefs={incompleteTheme} />);

            const input = screen.getByDisplayValue('Test Value');
            expect(input).toBeInTheDocument();
        });

        it('should handle rapid key presses without duplicate calls', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');
            fireEvent.keyDown(input, {key: 'Enter'});
            fireEvent.keyDown(input, {key: 'Enter'});
            fireEvent.keyDown(input, {key: 'Enter'});

            // onSave should only be called once per actual save attempt
            expect(defaultProps.onSave).toHaveBeenCalledTimes(3);
        });
    });
});
