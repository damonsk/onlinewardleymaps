import React, {useEffect, useCallback, memo} from 'react';
import {KeyboardShortcutHandlerProps} from '../../types/toolbar';
import {getToolbarItemByShortcut} from '../../constants/toolbarItems';

/**
 * KeyboardShortcutHandler component manages keyboard event listeners for toolbar shortcuts
 *
 * Handles:
 * - C for Component
 * - L for Link
 * - N for Note
 * - P for Pipeline
 * - A for Anchor
 * - M for Method
 * - T for PST (future implementation)
 * - Escape to deselect current tool
 */
export const KeyboardShortcutHandler: React.FC<KeyboardShortcutHandlerProps> = memo(
    ({toolbarItems, onToolSelect, isEnabled, currentSelectedTool}) => {
        /**
         * Check if keyboard shortcuts should be active
         * Prevents interference with text editing contexts
         */
        const shouldHandleShortcuts = useCallback((): boolean => {
            if (!isEnabled) return false;

            // Check if focus is on an input element that should receive text
            const activeElement = document.activeElement;
            if (!activeElement) return true;

            const tagName = activeElement.tagName.toLowerCase();
            const inputTypes = ['input', 'textarea', 'select'];
            const editableElements =
                activeElement.getAttribute('contenteditable') === 'true' || (activeElement as HTMLElement).contentEditable === 'true';

            // Don't handle shortcuts if user is typing in text fields
            if (inputTypes.includes(tagName) || editableElements) {
                return false;
            }

            // Check for specific classes that indicate text editing contexts
            const textEditingClasses = ['ace_text-input', 'ace_editor', 'CodeMirror'];
            const hasTextEditingClass = textEditingClasses.some(
                className => activeElement.classList.contains(className) || activeElement.closest(`.${className}`),
            );

            return !hasTextEditingClass;
        }, [isEnabled]);

        /**
         * Handle keyboard events for toolbar shortcuts
         */
        const handleKeyDown = useCallback(
            (event: KeyboardEvent) => {
                if (!shouldHandleShortcuts()) return;

                // Handle Escape key to deselect current tool
                if (event.key === 'Escape') {
                    event.preventDefault();
                    onToolSelect(null);
                    return;
                }

                // Only handle single character keys (no modifiers)
                if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
                    return;
                }

                // Handle letter keys for tool selection
                const key = event.key.toLowerCase();
                const toolbarItem = getToolbarItemByShortcut(key);

                if (toolbarItem) {
                    event.preventDefault();

                    // Toggle selection - if already selected, deselect
                    if (currentSelectedTool === toolbarItem.id) {
                        onToolSelect(null);
                    } else {
                        onToolSelect(toolbarItem.id);
                    }
                }
            },
            [shouldHandleShortcuts, onToolSelect, currentSelectedTool],
        );

        /**
         * Set up global keyboard event listeners
         */
        useEffect(() => {
            if (!isEnabled) return;

            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }, [isEnabled, handleKeyDown]);

        // This component doesn't render anything - it only manages event listeners
        return null;
    },
);

KeyboardShortcutHandler.displayName = 'KeyboardShortcutHandler';

export default KeyboardShortcutHandler;
