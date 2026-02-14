import React, {memo, useCallback, useContext, useEffect, useState} from 'react';
import styled from 'styled-components';
import {getToolbarItemByShortcut} from '../../constants/toolbarItems';
import {KeyboardShortcutHandlerProps} from '../../types/toolbar';
import {UndoRedoContext} from '../UndoRedoProvider';

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
 * Detect the current platform for keyboard shortcuts
 */
const detectPlatform = (): 'mac' | 'windows' => {
    if (typeof navigator !== 'undefined') {
        const platform = navigator.platform.toLowerCase();
        const userAgent = navigator.userAgent.toLowerCase();

        return platform.includes('mac') || userAgent.includes('mac') ? 'mac' : 'windows';
    }
    return 'windows';
};

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
 * - Delete/Backspace for component deletion
 * - Ctrl+Z/Cmd+Z for undo
 * - Ctrl+Y/Cmd+Shift+Z for redo
 */
export const KeyboardShortcutHandler: React.FC<KeyboardShortcutHandlerProps> = memo(
    ({
        toolbarItems,
        onToolSelect,
        isEnabled,
        currentSelectedTool,
        undoRedoEnabled = true,
        selectedComponentId,
        onEditComponent,
        onDeleteComponent,
        getSelectedLink,
        onDeleteLink,
        clearSelection,
    }) => {
        const [announceText, setAnnounceText] = useState('');
        const [platform] = useState(() => detectPlatform());
        const hasSelectedComponentId = selectedComponentId !== null && selectedComponentId !== undefined;

        // Get undo/redo context safely (may be null if provider is not available)
        const undoRedoContext = useContext(UndoRedoContext);
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
         * Handle component deletion keyboard shortcuts
         */
        const handleDeletionShortcuts = useCallback(
            (event: KeyboardEvent): boolean => {
                const selectedLink = getSelectedLink?.();

                // Check if we have either a component or link selected
                const hasComponentSelection = hasSelectedComponentId && onDeleteComponent;
                const hasLinkSelection = selectedLink && onDeleteLink;

                if (!hasComponentSelection && !hasLinkSelection) {
                    return false;
                }

                const key = event.key;

                // Handle Delete and Backspace keys (no modifiers)
                if ((key === 'Delete' || key === 'Backspace') && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
                    event.preventDefault();

                    try {
                        if (hasLinkSelection) {
                            // Delete selected link
                            onDeleteLink(selectedLink.linkData);
                            clearSelection?.(); // Clear selection after successful link deletion
                            setAnnounceText(`Link deleted`);
                        } else if (hasComponentSelection) {
                            // Delete selected component
                            const componentIdStr = String(selectedComponentId);
                            onDeleteComponent(componentIdStr);
                            clearSelection?.(); // Clear selection after successful component deletion
                            setAnnounceText(`Component deleted`);
                        }
                    } catch (error) {
                        console.error('Error deleting element:', error);
                        setAnnounceText(`Error deleting element`);
                    }
                    setTimeout(() => setAnnounceText(''), 1000);
                    return true;
                }

                return false;
            },
            [selectedComponentId, hasSelectedComponentId, onDeleteComponent, getSelectedLink, onDeleteLink, clearSelection],
        );

        /**
         * Handle undo/redo keyboard shortcuts
         */
        const handleUndoRedoShortcuts = useCallback(
            (event: KeyboardEvent): boolean => {
                if (!undoRedoEnabled || !undoRedoContext) return false;

                const key = event.key.toLowerCase();
                const isMac = platform === 'mac';
                const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

                // Undo: Ctrl+Z (Windows) or Cmd+Z (Mac)
                if (key === 'z' && isCtrlOrCmd && !event.shiftKey && !event.altKey) {
                    if (undoRedoContext?.canUndo) {
                        event.preventDefault();
                        undoRedoContext.undo();
                        const lastAction = undoRedoContext.getLastAction();
                        const actionDescription = lastAction ? lastAction.actionDescription : 'last action';
                        setAnnounceText(`Undid: ${actionDescription}`);
                        setTimeout(() => setAnnounceText(''), 1000);
                    }
                    return true;
                }

                // Redo: Ctrl+Y (Windows) or Cmd+Shift+Z (Mac)
                if (
                    (key === 'y' && isCtrlOrCmd && !isMac && !event.shiftKey && !event.altKey) ||
                    (key === 'z' && isCtrlOrCmd && isMac && event.shiftKey && !event.altKey)
                ) {
                    if (undoRedoContext?.canRedo) {
                        event.preventDefault();
                        undoRedoContext.redo();
                        const nextAction = undoRedoContext.getNextAction();
                        const actionDescription = nextAction ? nextAction.actionDescription : 'next action';
                        setAnnounceText(`Redid: ${actionDescription}`);
                        setTimeout(() => setAnnounceText(''), 1000);
                    }
                    return true;
                }

                return false;
            },
            [undoRedoEnabled, undoRedoContext, platform],
        );

        /**
         * Handle Enter key to edit the currently selected element
         */
        const handleEditShortcut = useCallback(
            (event: KeyboardEvent): boolean => {
                if (!hasSelectedComponentId || !onEditComponent) {
                    return false;
                }

                if (event.key === 'Enter' && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
                    event.preventDefault();
                    onEditComponent(String(selectedComponentId));
                    setAnnounceText(`Editing selected element`);
                    setTimeout(() => setAnnounceText(''), 1000);
                    return true;
                }

                return false;
            },
            [selectedComponentId, hasSelectedComponentId, onEditComponent],
        );

        /**
         * Handle keyboard events for toolbar shortcuts
         */
        const handleKeyDown = useCallback(
            (event: KeyboardEvent) => {
                if (!shouldHandleShortcuts()) return;

                // Handle undo/redo shortcuts first (they have priority and use modifiers)
                if (handleUndoRedoShortcuts(event)) {
                    return;
                }

                // Handle deletion shortcuts (Delete/Backspace keys)
                if (handleDeletionShortcuts(event)) {
                    return;
                }

                // Handle edit shortcut (Enter key)
                if (handleEditShortcut(event)) {
                    return;
                }

                // Handle Escape key to deselect current tool
                if (event.key === 'Escape') {
                    event.preventDefault();
                    onToolSelect(null);
                    setAnnounceText('All tools deselected');
                    setTimeout(() => setAnnounceText(''), 1000);
                    return;
                }

                // Only handle single character keys (no modifiers) for toolbar shortcuts
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
            [shouldHandleShortcuts, onToolSelect, currentSelectedTool, handleUndoRedoShortcuts, handleDeletionShortcuts, handleEditShortcut],
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
