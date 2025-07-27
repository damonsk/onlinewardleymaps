import React, {memo, useCallback, useEffect, useState, useRef} from 'react';
import styled from 'styled-components';
import {TOOLBAR_ITEMS, getToolbarItemById} from '../../constants/toolbarItems';
import {ToolbarItem as ToolbarItemType, ToolbarSubItem, WysiwygToolbarProps} from '../../types/toolbar';
import {ToolbarItem} from './ToolbarItem';
import {KeyboardShortcutHandler} from './KeyboardShortcutHandler';

/**
 * Styled container for the WYSIWYG toolbar
 * Moveable toolbar with drag handle - can be positioned anywhere on screen
 * Fixed position ensures it stays in place during map zoom and pan operations
 * Consistent styling independent of map themes
 */
const ToolbarContainer = styled.div<{$isDragging: boolean}>`
    position: fixed;
    width: 60px;
    background: #ffffff;
    border: 1px solid #e1e5e9;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 1000;
    transition: ${props => (props.$isDragging ? 'none' : 'all 0.2s ease')};
    cursor: ${props => (props.$isDragging ? 'grabbing' : 'default')};

    /* Responsive behavior for different screen sizes */
    @media (max-width: 768px) {
        width: 50px;
        padding: 6px;
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
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    border-radius: 8px;
    margin-bottom: 4px;
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

    /* Drag indicator dots */
    &::before {
        content: '';
        width: 20px;
        height: 4px;
        background: repeating-linear-gradient(to right, #cbd5e0 0px, #cbd5e0 2px, transparent 2px, transparent 4px);
        border-radius: 2px;
    }

    /* Dark theme dots */
    @media (prefers-color-scheme: dark) {
        &::before {
            background: repeating-linear-gradient(to right, #718096 0px, #718096 2px, transparent 2px, transparent 4px);
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
 * Main WYSIWYG Toolbar component
 * Provides a moveable vertical toolbar with all available map components
 */
export const WysiwygToolbar: React.FC<WysiwygToolbarProps> = memo(
    ({mapStyleDefs, selectedItem, onItemSelect, keyboardShortcutsEnabled = true}) => {
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
                // Toggle selection - if already selected, deselect
                if (selectedItem?.id === item.id) {
                    onItemSelect?.(null);
                } else {
                    onItemSelect?.(item);
                }
            },
            [selectedItem, onItemSelect],
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

        return (
            <>
                {/* Keyboard shortcut handler */}
                <KeyboardShortcutHandler
                    toolbarItems={TOOLBAR_ITEMS}
                    onToolSelect={handleKeyboardToolSelect}
                    isEnabled={keyboardShortcutsEnabled}
                    currentSelectedTool={selectedItem?.id || null}
                />

                <ToolbarContainer
                    key={renderKey}
                    ref={toolbarRef}
                    role="toolbar"
                    aria-label="Map component toolbar"
                    $isDragging={isDragging}
                    style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                    }}>
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
                </ToolbarContainer>
            </>
        );
    },
);

WysiwygToolbar.displayName = 'WysiwygToolbar';

export default WysiwygToolbar;
