import React, {useEffect, useCallback, memo, useState} from 'react';
import styled from 'styled-components';
import {KeyboardShortcutHandlerProps} from '../../types/toolbar';
import {getToolbarItemByShortcut} from '../../constants/toolbarItems';

/**
 * Screen reader announcement component for keyboard shortcut activation
 */
const ScreenReaderAnnouncement = styled.div`
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
`;

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
        const [announceText, setAnnounceText] = useState('');
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
                    setAnnounceText('All tools deselected');
                    setTimeout(() => setAnnounceText(''), 1000);
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

                    // Toggle behavior: if the same tool is already selected, deselect it
                    // Otherwise, select the new tool (requirement 10.10: switch to new tool immediately)
                    if (currentSelectedTool === toolbarItem.id) {
                        onToolSelect(null);
                        setAnnounceText(`${toolbarItem.label} tool deselected using keyboard shortcut ${key.toUpperCase()}`);
                    } else {
                        onToolSelect(toolbarItem.id);
                        setAnnounceText(`${toolbarItem.label} tool selected using keyboard shortcut ${key.toUpperCase()}`);
                    }

                    setTimeout(() => setAnnounceText(''), 1000);
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

        // Render screen reader announcements for keyboard shortcut activation
        return (
            <>
                {announceText && (
                    <ScreenReaderAnnouncement role="status" aria-live="polite" aria-atomic="true">
                        {announceText}
                    </ScreenReaderAnnouncement>
                )}
            </>
        );
    },
);

KeyboardShortcutHandler.displayName = 'KeyboardShortcutHandler';

export default KeyboardShortcutHandler;
