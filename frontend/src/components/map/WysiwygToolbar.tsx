import React, {memo, useCallback, useEffect, useState, useRef} from 'react';
import styled from 'styled-components';
import {TOOLBAR_ITEMS, getToolbarItemById} from '../../constants/toolbarItems';
import {ToolbarItem as ToolbarItemType, ToolbarSubItem, WysiwygToolbarProps} from '../../types/toolbar';
import {ToolbarItem} from './ToolbarItem';
import {KeyboardShortcutHandler} from './KeyboardShortcutHandler';
import {ToolbarUndoIcon, ToolbarRedoIcon} from './ToolbarIconWrappers';
import {useUndoRedo} from '../UndoRedoProvider';
import {useComponentSelection} from '../ComponentSelectionContext';
import {useMapComponentDeletion} from '../../hooks/useMapComponentDeletion';

/**
 * Styled container for the WYSIWYG toolbar
 * Moveable toolbar with drag handle - can be positioned anywhere on screen
 * Fixed position ensures it stays in place during map zoom and pan operations
 * Consistent styling independent of map themes
 */
const ToolbarContainer = styled.div<{$isDragging: boolean}>`
    position: fixed;
    width: 48px;
    background: #ffffff;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    z-index: 1000;
    transition: ${props => (props.$isDragging ? 'none' : 'all 0.2s ease')};
    cursor: ${props => (props.$isDragging ? 'grabbing' : 'default')};

    /* Responsive behavior for different screen sizes */
    @media (max-width: 1200px) {
        width: 44px;
        padding: 5px;
        gap: 2px;
    }

    @media (max-width: 768px) {
        width: 40px;
        padding: 4px;
        gap: 2px;
    }

    /* Ensure toolbar stays visible even when map is zoomed or panned */
    pointer-events: auto;
    user-select: none;

    /* Dark theme support (system preference only) */
    @media (prefers-color-scheme: dark) {
        background: #2d3748;
        border-color: #4a5568;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
        background: #ffffff;
        border: 2px solid #000000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }

    @media (prefers-color-scheme: dark) and (prefers-contrast: high) {
        background: #000000;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
    }

    /* Highlight when dragging */
    ${props =>
        props.$isDragging &&
        `
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        transform: scale(1.02);
    `}
`;

/**
 * Drag handle for moving the toolbar
 * Positioned at the top of the toolbar for easy access
 * Double-click to reset position to default
 */
const DragHandle = styled.div`
    width: 100%;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    border-radius: 6px;
    margin-bottom: 3px;
    transition: background-color 0.2s ease;

    &:hover {
        background: #f7fafc;
    }

    &:active {
        cursor: grabbing;
        background: #edf2f7;
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
        &:hover {
            background: #4a5568;
        }

        &:active {
            background: #2d3748;
        }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
        &:hover {
            background: #f0f0f0;
            border: 1px solid #000000;
        }

        &:active {
            background: #e0e0e0;
            border: 1px solid #000000;
        }
    }

    @media (prefers-color-scheme: dark) and (prefers-contrast: high) {
        &:hover {
            background: #333333;
            border: 1px solid #ffffff;
        }

        &:active {
            background: #444444;
            border: 1px solid #ffffff;
        }
    }

    /* Drag indicator dots */
    &::before {
        content: '';
        width: 16px;
        height: 3px;
        background: repeating-linear-gradient(to right, #cbd5e0 0px, #cbd5e0 1.5px, transparent 1.5px, transparent 3px);
        border-radius: 1.5px;
    }

    /* Dark theme dots */
    @media (prefers-color-scheme: dark) {
        &::before {
            background: repeating-linear-gradient(to right, #718096 0px, #718096 2px, transparent 2px, transparent 4px);
        }
    }

    /* High contrast mode dots */
    @media (prefers-contrast: high) {
        &::before {
            background: repeating-linear-gradient(to right, #000000 0px, #000000 2px, transparent 2px, transparent 4px);
        }
    }

    @media (prefers-color-scheme: dark) and (prefers-contrast: high) {
        &::before {
            background: repeating-linear-gradient(to right, #ffffff 0px, #ffffff 2px, transparent 2px, transparent 4px);
        }
    }
`;

/**
 * Styled separator for grouping toolbar items
 * Consistent styling independent of map themes
 */
const ToolbarSeparator = styled.div`
    height: 1px;
    background: #e1e5e9;
    margin: 4px 0;

    /* Dark theme support (system preference only) */
    @media (prefers-color-scheme: dark) {
        background: #4a5568;
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
        background: #000000;
        height: 2px;
    }

    @media (prefers-color-scheme: dark) and (prefers-contrast: high) {
        background: #ffffff;
        height: 2px;
    }
`;

/**
 * Specialized toolbar item component for undo/redo actions
 * Handles disabled state and shows appropriate tooltips
 */
const UndoRedoToolbarItem: React.FC<{
    item: ToolbarItemType;
    isDisabled: boolean;
    onClick: () => void;
    mapStyleDefs: any;
    tooltipText: string;
}> = memo(({item, isDisabled, onClick, mapStyleDefs, tooltipText}) => {
    const [announceText, setAnnounceText] = useState('');

    const handleClick = useCallback(() => {
        if (isDisabled) return;

        onClick();

        // Announce action for screen readers
        setAnnounceText(`${item.label} action performed`);
        setTimeout(() => setAnnounceText(''), 1000);
    }, [onClick, item.label, isDisabled]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLButtonElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleClick();
            }
        },
        [handleClick],
    );

    return (
        <>
            <StyledToolbarButton
                $isSelected={false}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                title={tooltipText}
                aria-label={`${item.label}${isDisabled ? ' (disabled)' : ''}`}
                disabled={isDisabled}
                role="button"
                tabIndex={0}
                data-testid={`toolbar-item-${item.id}`}>
                <IconContainer>
                    {item.id === 'undo' ? (
                        <ToolbarUndoIcon id={`toolbar-${item.id}`} mapStyleDefs={mapStyleDefs} disabled={isDisabled} />
                    ) : (
                        <ToolbarRedoIcon id={`toolbar-${item.id}`} mapStyleDefs={mapStyleDefs} disabled={isDisabled} />
                    )}
                </IconContainer>
            </StyledToolbarButton>

            {/* Screen reader announcements */}
            {announceText && (
                <ScreenReaderAnnouncement role="status" aria-live="polite" aria-atomic="true">
                    {announceText}
                </ScreenReaderAnnouncement>
            )}
        </>
    );
});

UndoRedoToolbarItem.displayName = 'UndoRedoToolbarItem';

/**
 * Screen reader announcement component for accessibility
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
 * Styled button for individual toolbar items with MIRO-style design
 * Enhanced with theme-specific styling for consistent appearance across all map themes
 */
const StyledToolbarButton = styled.button<{$isSelected: boolean}>`
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 6px;
    background: ${props => (props.$isSelected ? '#e3f2fd' : 'transparent')};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    position: relative;
    outline: none;

    /* Hover state */
    &:hover {
        background: ${props => (props.$isSelected ? '#e3f2fd' : '#f5f5f5')};
        transform: scale(1.02);
    }

    /* Active state */
    &:active {
        transform: scale(0.98);
    }

    /* Focus state for keyboard navigation */
    &:focus-visible {
        outline: 2px solid #1976d2;
        outline-offset: 2px;
    }

    /* Selected state indicator */
    ${props =>
        props.$isSelected &&
        `
        &::after {
            content: '';
            position: absolute;
            left: -2px;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 20px;
            background: #1976d2;
            border-radius: 2px;
        }
    `}

    /* Disabled state */
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;

        &:hover {
            transform: none;
            background: transparent;
        }
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
        background: ${props => (props.$isSelected ? '#3182ce' : 'transparent')};

        &:hover {
            background: ${props => (props.$isSelected ? '#3182ce' : '#4a5568')};
        }

        &:focus-visible {
            outline-color: #63b3ed;
        }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
        background: ${props => (props.$isSelected ? '#000000' : 'transparent')};
        border: 1px solid ${props => (props.$isSelected ? '#000000' : 'transparent')};

        &:hover {
            background: ${props => (props.$isSelected ? '#000000' : '#f0f0f0')};
            border: 1px solid #000000;
        }

        &:focus-visible {
            outline: 3px solid #000000;
            outline-offset: 2px;
        }
    }

    @media (prefers-color-scheme: dark) and (prefers-contrast: high) {
        background: ${props => (props.$isSelected ? '#ffffff' : 'transparent')};
        border: 1px solid ${props => (props.$isSelected ? '#ffffff' : 'transparent')};

        &:hover {
            background: ${props => (props.$isSelected ? '#ffffff' : '#333333')};
            border: 1px solid #ffffff;
        }

        &:focus-visible {
            outline: 3px solid #ffffff;
            outline-offset: 2px;
        }
    }

    /* Responsive behavior */
    @media (max-width: 1200px) {
        width: 32px;
        height: 32px;
    }

    @media (max-width: 768px) {
        width: 28px;
        height: 28px;
    }
`;

/**
 * Icon container with consistent scaling
 */
const IconContainer = styled.div`
    transform: scale(0.55);
    display: flex;
    align-items: center;
    justify-content: center;

    /* Responsive scaling */
    @media (max-width: 1200px) {
        transform: scale(0.5);
    }

    @media (max-width: 768px) {
        transform: scale(0.45);
    }
`;

/**
 * Hook for managing toolbar position and drag functionality
 */
const useToolbarDrag = () => {
    const [position, setPosition] = useState(() => {
        // Check if we're in the browser environment
        if (typeof window === 'undefined') {
            // Default position for SSR
            return {x: 16, y: 300};
        }

        // Try to load saved position from localStorage
        try {
            const saved = localStorage.getItem('wysiwyg-toolbar-position');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch {
            // Fall back to default if parsing fails
        }

        // Default position: left side, vertically centered
        return {x: 16, y: window.innerHeight / 2 - 200};
    });

    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
    const toolbarRef = useRef<HTMLDivElement>(null);

    // Save position to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('wysiwyg-toolbar-position', JSON.stringify(position));
        }
    }, [position]);

    // Constrain position to viewport bounds
    const constrainPosition = useCallback((x: number, y: number) => {
        if (typeof window === 'undefined') return {x, y};

        const toolbar = toolbarRef.current;
        if (!toolbar) return {x, y};

        const rect = toolbar.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        return {
            x: Math.max(0, Math.min(x, maxX)),
            y: Math.max(0, Math.min(y, maxY)),
        };
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!toolbarRef.current) return;

        const rect = toolbarRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
        setIsDragging(true);
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;

            const newPosition = constrainPosition(e.clientX - dragOffset.x, e.clientY - dragOffset.y);
            setPosition(newPosition);
        },
        [isDragging, dragOffset, constrainPosition],
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Add global mouse event listeners when dragging
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Handle window resize to keep toolbar in bounds
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setPosition((prev: {x: number; y: number}) => constrainPosition(prev.x, prev.y));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [constrainPosition]);

    return {
        position,
        isDragging,
        toolbarRef,
        handleMouseDown,
    };
};

/**
 * Hook to safely access undo/redo context (returns null if not available)
 */
const useOptionalUndoRedo = () => {
    try {
        return useUndoRedo();
    } catch (error) {
        // UndoRedoProvider not available, return null
        return null;
    }
};

/**
 * Main WYSIWYG Toolbar component
 * Provides a moveable vertical toolbar with all available map components
 */
export const WysiwygToolbar: React.FC<WysiwygToolbarProps> = memo(
    ({mapStyleDefs, selectedItem, onItemSelect, keyboardShortcutsEnabled = true, mapText}) => {
        // Access undo/redo context (optional)
        const undoRedoContext = useOptionalUndoRedo();

        // Access component selection context
        const componentSelection = useComponentSelection();

        // Access component deletion functionality
        const {deleteComponent, canDelete} = useMapComponentDeletion();
        // Force a re-render after initial mount to ensure styled-components classes are stable
        const [renderKey, setRenderKey] = useState(0);

        // Drag functionality
        const {position, isDragging, toolbarRef, handleMouseDown} = useToolbarDrag();

        useEffect(() => {
            // Force a re-render to fix styled-components class name mismatch
            const timer = setTimeout(() => setRenderKey(1), 10);
            return () => clearTimeout(timer);
        }, []);

        const handleItemClick = useCallback(
            (item: ToolbarItemType) => {
                // Handle action items (undo/redo) differently
                if (item.toolType === 'action' && undoRedoContext) {
                    if (item.action === 'undo') {
                        undoRedoContext.undo();
                    } else if (item.action === 'redo') {
                        undoRedoContext.redo();
                    }
                    return;
                }

                // Toggle selection - if already selected, deselect
                if (selectedItem?.id === item.id) {
                    onItemSelect?.(null);
                } else {
                    onItemSelect?.(item);
                }
            },
            [selectedItem, onItemSelect, undoRedoContext],
        );

        /**
         * Handle component deletion
         */
        const handleDeleteComponent = useCallback(
            (componentId: string) => {
                if (!componentId || !mapText) {
                    console.warn('Cannot delete component: missing componentId or mapText');
                    return;
                }

                try {
                    const deletionParams = {
                        mapText,
                        componentId,
                        componentName: componentId, // Use componentId as name for now
                    };
                    console.log('WysiwygToolbar: Attempting to delete component with params:', deletionParams);

                    // Attempt to delete the component
                    deleteComponent(deletionParams);

                    // Clear the selection after successful deletion
                    componentSelection.clearSelection();
                } catch (error) {
                    console.error('Failed to delete component:', error);
                    // Optionally show user feedback here
                }
            },
            [deleteComponent, mapText, componentSelection],
        );

        /**
         * Handle keyboard shortcut tool selection
         */
        const handleKeyboardToolSelect = useCallback(
            (toolId: string | null) => {
                if (toolId === null) {
                    onItemSelect?.(null);
                } else {
                    const item = getToolbarItemById(toolId);
                    if (item) {
                        onItemSelect?.(item);
                    }
                }
            },
            [onItemSelect],
        );

        /**
         * Handle PST sub-item selection
         */
        const handleSubItemSelect = useCallback(
            (subItem: ToolbarSubItem) => {
                // For PST items, we need to create a modified toolbar item that includes the selected sub-item
                const pstItem = getToolbarItemById('pst');
                if (pstItem) {
                    const modifiedItem: ToolbarItemType = {
                        ...pstItem,
                        selectedSubItem: subItem,
                    };
                    onItemSelect?.(modifiedItem);
                }
            },
            [onItemSelect],
        );

        // Group items by category for better organization
        const componentItems = TOOLBAR_ITEMS.filter(item => item.category === 'component');
        const methodItems = TOOLBAR_ITEMS.filter(item => item.category === 'method');
        const noteItems = TOOLBAR_ITEMS.filter(item => item.category === 'note');
        const linkItems = TOOLBAR_ITEMS.filter(item => item.category === 'link');
        const pstItems = TOOLBAR_ITEMS.filter(item => item.category === 'pst');
        const otherItems = TOOLBAR_ITEMS.filter(item => item.category === 'pipeline' || item.category === 'other');
        // Only show action items if undo/redo context is available
        const actionItems = undoRedoContext ? TOOLBAR_ITEMS.filter(item => item.category === 'action') : [];

        return (
            <>
                {/* Keyboard shortcut handler */}
                <KeyboardShortcutHandler
                    toolbarItems={TOOLBAR_ITEMS}
                    onToolSelect={handleKeyboardToolSelect}
                    isEnabled={keyboardShortcutsEnabled}
                    currentSelectedTool={selectedItem?.id || null}
                    selectedComponentId={componentSelection.getSelectedComponentId()}
                    onDeleteComponent={handleDeleteComponent}
                />

                <ToolbarContainer
                    key={renderKey}
                    ref={toolbarRef}
                    role="toolbar"
                    aria-label="Map component toolbar with keyboard shortcuts"
                    aria-describedby="toolbar-instructions"
                    $isDragging={isDragging}
                    suppressHydrationWarning={true}
                    style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                    }}>
                    {/* Hidden instructions for screen readers */}
                    <div
                        id="toolbar-instructions"
                        style={{
                            position: 'absolute',
                            left: '-10000px',
                            width: '1px',
                            height: '1px',
                            overflow: 'hidden',
                        }}>
                        Use keyboard shortcuts to quickly select tools: C for Component, L for Link, N for Note, P for Pipeline, A for
                        Anchor, M for Method, T for PST. Press Escape to deselect.
                    </div>
                    {/* Drag handle */}
                    <DragHandle onMouseDown={handleMouseDown} title="Drag to move toolbar" aria-label="Drag handle to move toolbar" />

                    {/* Component items */}
                    {componentItems.map(item => (
                        <ToolbarItem
                            key={item.id}
                            item={item}
                            isSelected={selectedItem?.id === item.id}
                            onClick={() => handleItemClick(item)}
                            mapStyleDefs={mapStyleDefs}
                        />
                    ))}

                    {/* Separator between components and methods */}
                    {methodItems.length > 0 && <ToolbarSeparator />}

                    {/* Method items */}
                    {methodItems.map(item => (
                        <ToolbarItem
                            key={item.id}
                            item={item}
                            isSelected={selectedItem?.id === item.id}
                            onClick={() => handleItemClick(item)}
                            mapStyleDefs={mapStyleDefs}
                        />
                    ))}

                    {/* Separator between methods and notes */}
                    {noteItems.length > 0 && <ToolbarSeparator />}

                    {/* Note items */}
                    {noteItems.map(item => (
                        <ToolbarItem
                            key={item.id}
                            item={item}
                            isSelected={selectedItem?.id === item.id}
                            onClick={() => handleItemClick(item)}
                            mapStyleDefs={mapStyleDefs}
                        />
                    ))}

                    {/* Separator between notes and links */}
                    {linkItems.length > 0 && <ToolbarSeparator />}

                    {/* Link items */}
                    {linkItems.map(item => (
                        <ToolbarItem
                            key={item.id}
                            item={item}
                            isSelected={selectedItem?.id === item.id}
                            onClick={() => handleItemClick(item)}
                            mapStyleDefs={mapStyleDefs}
                        />
                    ))}

                    {/* Separator between links and PST items */}
                    {pstItems.length > 0 && <ToolbarSeparator />}

                    {/* PST items */}
                    {pstItems.map(item => (
                        <ToolbarItem
                            key={item.id}
                            item={item}
                            isSelected={selectedItem?.id === item.id}
                            onClick={() => handleItemClick(item)}
                            onSubItemSelect={handleSubItemSelect}
                            mapStyleDefs={mapStyleDefs}
                        />
                    ))}

                    {/* Separator between PST and other items */}
                    {otherItems.length > 0 && <ToolbarSeparator />}

                    {/* Other items (pipeline, anchor, etc.) */}
                    {otherItems.map(item => (
                        <ToolbarItem
                            key={item.id}
                            item={item}
                            isSelected={selectedItem?.id === item.id}
                            onClick={() => handleItemClick(item)}
                            mapStyleDefs={mapStyleDefs}
                        />
                    ))}

                    {/* Separator between other items and actions */}
                    {actionItems.length > 0 && <ToolbarSeparator />}

                    {/* Action items (undo/redo) - only show if context is available */}
                    {undoRedoContext &&
                        actionItems.map(item => {
                            const isUndo = item.action === 'undo';
                            const isRedo = item.action === 'redo';
                            const isDisabled = isUndo ? !undoRedoContext.canUndo : !undoRedoContext.canRedo;

                            // Get tooltip text with action description
                            let tooltipText = item.label;
                            if (isUndo && undoRedoContext.canUndo) {
                                const lastAction = undoRedoContext.getLastAction();
                                if (lastAction) {
                                    tooltipText = `Undo: ${lastAction.actionDescription}`;
                                }
                            } else if (isRedo && undoRedoContext.canRedo) {
                                const nextAction = undoRedoContext.getNextAction();
                                if (nextAction) {
                                    tooltipText = `Redo: ${nextAction.actionDescription}`;
                                }
                            } else {
                                tooltipText = isUndo ? 'No actions to undo' : 'No actions to redo';
                            }

                            return (
                                <UndoRedoToolbarItem
                                    key={item.id}
                                    item={item}
                                    isDisabled={isDisabled}
                                    onClick={() => handleItemClick(item)}
                                    mapStyleDefs={mapStyleDefs}
                                    tooltipText={tooltipText}
                                />
                            );
                        })}
                </ToolbarContainer>
            </>
        );
    },
);

WysiwygToolbar.displayName = 'WysiwygToolbar';

export default WysiwygToolbar;
