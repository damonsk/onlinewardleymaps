import React, {memo, useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {getToolbarItemById, TOOLBAR_ITEMS} from '../../constants/toolbarItems';
import {useI18n} from '../../hooks/useI18n';
import {useMapComponentDeletion} from '../../hooks/useMapComponentDeletion';
import {ToolbarItem as ToolbarItemType, ToolbarSubItem, WysiwygToolbarProps} from '../../types/toolbar';
import {findEvolvedComponentInfo} from '../../utils/evolvedComponentUtils';
import {useComponentSelection} from '../ComponentSelectionContext';
import {useUndoRedo} from '../UndoRedoProvider';
import {ToolbarItems} from './components/ToolbarItems';
import {useToolbarState} from './hooks/useToolbarState';
import {KeyboardShortcutHandler} from './KeyboardShortcutHandler';

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
`/**
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
    ({
        mapStyleDefs,
        selectedItem,
        onItemSelect,
        keyboardShortcutsEnabled = true,
        mapText,
        getSelectedLink,
        onDeleteLink,
        clearSelection,
    }) => {
        const {t} = useI18n();

        // Access undo/redo context (optional)
        const undoRedoContext = useOptionalUndoRedo();

        // Access component selection context
        const componentSelection = useComponentSelection();

        // Access component deletion functionality
        const {deleteComponent} = useMapComponentDeletion();
        
        // Toolbar state management
        const {position, isDragging, toolbarRef, renderKey, handleMouseDown} = useToolbarState();

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
                    // Ensure componentId is a string
                    const componentIdStr = String(componentId);

                    // Detect if this is an evolved component and get proper deletion parameters
                    let componentType: 'component' | 'evolved-component' | undefined = undefined;
                    let componentName = componentIdStr;

                    if (componentIdStr.endsWith('_evolved')) {
                        componentType = 'evolved-component';

                        const evolvedInfo = findEvolvedComponentInfo(mapText, componentIdStr);

                        if (evolvedInfo.found) {
                            componentName = evolvedInfo.evolvedName;
                            console.log('WysiwygToolbar: Found evolved component name:', evolvedInfo.evolvedName);
                        } else {
                            console.warn('WysiwygToolbar: Could not find evolved component name, using componentIdStr as fallback');
                        }
                    }

                    const deletionParams = {
                        mapText,
                        componentId: componentType === 'evolved-component' ? componentName : componentId,
                        componentName,
                        componentType,
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
                <KeyboardShortcutHandler
                    toolbarItems={TOOLBAR_ITEMS}
                    onToolSelect={handleKeyboardToolSelect}
                    isEnabled={keyboardShortcutsEnabled}
                    currentSelectedTool={selectedItem?.id || null}
                    selectedComponentId={componentSelection.getSelectedComponentId()}
                    onDeleteComponent={handleDeleteComponent}
                    getSelectedLink={getSelectedLink}
                    onDeleteLink={onDeleteLink}
                    clearSelection={clearSelection}
                />

                <ToolbarContainer
                    key={renderKey}
                    ref={toolbarRef}
                    role="toolbar"
                    aria-label={t('map.toolbar.wysiwygLabel', 'Map component toolbar with keyboard shortcuts')}
                    aria-describedby="toolbar-instructions"
                    $isDragging={isDragging}
                    suppressHydrationWarning={true}
                    style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                    }}>
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

                    <DragHandle
                        onMouseDown={handleMouseDown}
                        title={t('map.toolbar.dragTitle', 'Drag to move toolbar')}
                        aria-label={t('map.toolbar.dragHandle', 'Drag handle to move toolbar')}
                    />

                    <ToolbarItems
                        mapStyleDefs={mapStyleDefs}
                        selectedItem={selectedItem}
                        onItemClick={handleItemClick}
                        onSubItemSelect={handleSubItemSelect}
                    />
                </ToolbarContainer>
            </>
        );
    },
);

WysiwygToolbar.displayName = 'WysiwygToolbar';

export default WysiwygToolbar;
