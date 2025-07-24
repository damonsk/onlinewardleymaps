import React, {memo, useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {TOOLBAR_ITEMS} from '../../constants/toolbarItems';
import {ToolbarItem as ToolbarItemType, WysiwygToolbarProps} from '../../types/toolbar';
import {ToolbarItem} from './ToolbarItem';

/**
 * Styled container for the WYSIWYG toolbar
 * Positioned on the left side of the map canvas with MIRO-style design
 * Fixed position ensures it stays in place during map zoom and pan operations
 */
const ToolbarContainer = styled.div`
    position: fixed;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
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
    transition: all 0.2s ease;

    /* Responsive behavior for different screen sizes */
    @media (max-width: 768px) {
        left: 8px;
        width: 50px;
        padding: 6px;
    }

    /* Ensure toolbar stays visible even when map is zoomed or panned */
    pointer-events: auto;
    user-select: none;

    /* Theme-specific styling */
    &.wardley,
    .wardley & {
        background: #ffffff;
        border-color: #d1d5db;
    }

    &.colour,
    .colour & {
        background: #ffffff;
        border-color: #8cb358;
        box-shadow: 0 4px 12px rgba(140, 179, 88, 0.2);
    }

    &.plain,
    .plain & {
        background: #ffffff;
        border-color: #e1e5e9;
    }

    &.handwritten,
    .handwritten & {
        background: #ffffff;
        border-color: #e1e5e9;
    }

    &.dark,
    .dark & {
        background: #2d3748;
        border-color: #4a5568;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
        background: #2d3748;
        border-color: #4a5568;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
`;

/**
 * Styled separator for grouping toolbar items
 */
const ToolbarSeparator = styled.div`
    height: 1px;
    background: #e1e5e9;
    margin: 4px 0;

    /* Theme-specific styling */
    .dark & {
        background: #4a5568;
    }

    @media (prefers-color-scheme: dark) {
        background: #4a5568;
    }
`;

/**
 * Main WYSIWYG Toolbar component
 * Provides a vertical toolbar with all available map components
 */
export const WysiwygToolbar: React.FC<WysiwygToolbarProps> = memo(({mapStyleDefs, selectedItem, onItemSelect, className}) => {
    // Force a re-render after initial mount to ensure styles are applied
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Set mounted to true after initial render
        if (!mounted) {
            setMounted(true);
        }
    }, [mounted]);

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

    // Group items by category for better organization
    const componentItems = TOOLBAR_ITEMS.filter(item => item.category === 'component');
    const methodItems = TOOLBAR_ITEMS.filter(item => item.category === 'method');
    const noteItems = TOOLBAR_ITEMS.filter(item => item.category === 'note');
    const otherItems = TOOLBAR_ITEMS.filter(item => item.category === 'pipeline' || item.category === 'other');

    return (
        <ToolbarContainer role="toolbar" aria-label="Map component toolbar" className={className}>
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

            {/* Separator between notes and other items */}
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
    );
});

WysiwygToolbar.displayName = 'WysiwygToolbar';

export default WysiwygToolbar;
