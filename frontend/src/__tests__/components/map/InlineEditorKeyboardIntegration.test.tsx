import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import InlineEditor from '../../../components/map/InlineEditor';
import {MapTheme} from '../../../types/map/styles';
import {Plain} from '../../../constants/mapstyles';

// Mock styled-components theme
const mockTheme: MapTheme = Plain;

describe('InlineEditor Keyboard Integration', () => {
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

    describe('Event Propagation Prevention', () => {
        it('should prevent keyboard events from bubbling to parent elements', () => {
            const parentKeyDownHandler = jest.fn();
            const parentKeyUpHandler = jest.fn();

            const TestWrapper = () => (
                <div onKeyDown={parentKeyDownHandler} onKeyUp={parentKeyUpHandler} data-testid="parent-container">
                    <InlineEditor {...defaultProps} />
                </div>
            );

            render(<TestWrapper />);

            const input = screen.getByDisplayValue('Test Value');

            // Test various key events
            fireEvent.keyDown(input, {key: 'a'});
            fireEvent.keyUp(input, {key: 'a'});
            fireEvent.keyDown(input, {key: 'ArrowLeft'});
            fireEvent.keyUp(input, {key: 'ArrowLeft'});
            fireEvent.keyDown(input, {key: 'Enter'});
            fireEvent.keyUp(input, {key: 'Enter'});

            // Parent handlers should not be called due to stopPropagation
            expect(parentKeyDownHandler).not.toHaveBeenCalled();
            expect(parentKeyUpHandler).not.toHaveBeenCalled();
        });

        it('should handle complex keyboard scenarios without interfering with map shortcuts', () => {
            const mapShortcutHandler = jest.fn();

            // Simulate a map container that listens for keyboard shortcuts
            const MapContainer = () => (
                <div
                    onKeyDown={e => {
                        // Simulate map shortcuts like 'c' for component, 'n' for note, etc.
                        if (['c', 'n', 'l', 'p'].includes(e.key.toLowerCase())) {
                            mapShortcutHandler(e.key);
                        }
                    }}
                    data-testid="map-container">
                    <InlineEditor {...defaultProps} />
                </div>
            );

            render(<MapContainer />);

            const input = screen.getByDisplayValue('Test Value');

            // Type characters that would normally trigger map shortcuts
            fireEvent.keyDown(input, {key: 'c'});
            fireEvent.keyDown(input, {key: 'n'});
            fireEvent.keyDown(input, {key: 'l'});
            fireEvent.keyDown(input, {key: 'p'});

            // Map shortcuts should not be triggered while editing
            expect(mapShortcutHandler).not.toHaveBeenCalled();
        });
    });

    describe('Navigation Keys Behavior', () => {
        it('should allow all navigation keys to work normally for text editing', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value') as HTMLInputElement;

            // Set cursor position to test navigation
            input.setSelectionRange(5, 5); // Position after "Test "

            // Test arrow keys
            fireEvent.keyDown(input, {key: 'ArrowLeft'});
            fireEvent.keyDown(input, {key: 'ArrowRight'});
            fireEvent.keyDown(input, {key: 'ArrowUp'});
            fireEvent.keyDown(input, {key: 'ArrowDown'});

            // Test other navigation keys
            fireEvent.keyDown(input, {key: 'Home'});
            fireEvent.keyDown(input, {key: 'End'});
            fireEvent.keyDown(input, {key: 'PageUp'});
            fireEvent.keyDown(input, {key: 'PageDown'});

            // None of these should trigger save or cancel
            expect(defaultProps.onSave).not.toHaveBeenCalled();
            expect(defaultProps.onCancel).not.toHaveBeenCalled();
        });

        it('should allow text selection shortcuts to work normally', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');

            // Test common text selection shortcuts
            const textSelectionKeys = [
                {key: 'a', ctrlKey: true}, // Select all
                {key: 'c', ctrlKey: true}, // Copy
                {key: 'v', ctrlKey: true}, // Paste
                {key: 'x', ctrlKey: true}, // Cut
                {key: 'z', ctrlKey: true}, // Undo
                {key: 'y', ctrlKey: true}, // Redo
            ];

            textSelectionKeys.forEach(keyEvent => {
                fireEvent.keyDown(input, keyEvent);
            });

            // None of these should trigger save or cancel
            expect(defaultProps.onSave).not.toHaveBeenCalled();
            expect(defaultProps.onCancel).not.toHaveBeenCalled();
        });

        it('should allow Mac-style text selection shortcuts to work normally', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');

            // Test Mac-style shortcuts with metaKey
            const macTextSelectionKeys = [
                {key: 'a', metaKey: true}, // Select all
                {key: 'c', metaKey: true}, // Copy
                {key: 'v', metaKey: true}, // Paste
                {key: 'x', metaKey: true}, // Cut
                {key: 'z', metaKey: true}, // Undo
            ];

            macTextSelectionKeys.forEach(keyEvent => {
                fireEvent.keyDown(input, keyEvent);
            });

            // None of these should trigger save or cancel
            expect(defaultProps.onSave).not.toHaveBeenCalled();
            expect(defaultProps.onCancel).not.toHaveBeenCalled();
        });
    });

    describe('Save and Cancel Behavior', () => {
        it('should handle Enter key correctly in single-line mode', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={false} />);

            const input = screen.getByDisplayValue('Test Value');

            fireEvent.keyDown(input, {key: 'Enter'});

            expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
            expect(defaultProps.onCancel).not.toHaveBeenCalled();
        });

        it('should handle Enter key correctly in multi-line mode', () => {
            render(<InlineEditor {...defaultProps} isMultiLine={true} />);

            const textarea = screen.getByDisplayValue('Test Value');

            // Regular Enter should not save in multi-line mode
            fireEvent.keyDown(textarea, {key: 'Enter'});
            expect(defaultProps.onSave).not.toHaveBeenCalled();

            // Ctrl+Enter should save
            fireEvent.keyDown(textarea, {key: 'Enter', ctrlKey: true});
            expect(defaultProps.onSave).toHaveBeenCalledTimes(1);

            defaultProps.onSave.mockClear();

            // Cmd+Enter should also save (Mac)
            fireEvent.keyDown(textarea, {key: 'Enter', metaKey: true});
            expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
        });

        it('should handle Escape key consistently', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');

            fireEvent.keyDown(input, {key: 'Escape'});

            expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
            expect(defaultProps.onSave).not.toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle rapid key presses without issues', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');

            // Rapid key presses
            for (let i = 0; i < 10; i++) {
                fireEvent.keyDown(input, {key: 'a'});
                fireEvent.keyUp(input, {key: 'a'});
                fireEvent.keyDown(input, {key: 'ArrowLeft'});
                fireEvent.keyUp(input, {key: 'ArrowLeft'});
            }

            // Should not cause any save/cancel calls
            expect(defaultProps.onSave).not.toHaveBeenCalled();
            expect(defaultProps.onCancel).not.toHaveBeenCalled();
        });

        it('should handle modifier key combinations correctly', () => {
            render(<InlineEditor {...defaultProps} />);

            const input = screen.getByDisplayValue('Test Value');

            // Test various modifier combinations that should not trigger save/cancel
            const modifierCombinations = [
                {key: 'a', shiftKey: true},
                {key: 'ArrowLeft', shiftKey: true}, // Text selection
                {key: 'ArrowRight', ctrlKey: true}, // Word navigation
                {key: 'Backspace', ctrlKey: true}, // Delete word
                {key: 'Delete', ctrlKey: true}, // Delete word forward
            ];

            modifierCombinations.forEach(keyEvent => {
                fireEvent.keyDown(input, keyEvent);
            });

            // None of these should trigger save or cancel
            expect(defaultProps.onSave).not.toHaveBeenCalled();
            expect(defaultProps.onCancel).not.toHaveBeenCalled();
        });
    });
});
