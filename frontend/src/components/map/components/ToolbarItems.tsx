import React, {memo, useCallback, useState} from 'react';
import styled from 'styled-components';
import {TOOLBAR_ITEMS} from '../../../constants/toolbarItems';
import {useI18n} from '../../../hooks/useI18n';
import {ToolbarItem as ToolbarItemType, ToolbarSubItem} from '../../../types/toolbar';
import {useUndoRedo} from '../../UndoRedoProvider';
import {ToolbarRedoIcon, ToolbarUndoIcon} from '../ToolbarIconWrappers';
import {ToolbarItem} from '../ToolbarItem';

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

interface ToolbarItemsProps {
    mapStyleDefs: any;
    selectedItem?: ToolbarItemType | null;
    onItemClick: (item: ToolbarItemType) => void;
    onSubItemSelect?: (subItem: ToolbarSubItem) => void;
}

export const ToolbarItems: React.FC<ToolbarItemsProps> = memo(({mapStyleDefs, selectedItem, onItemClick, onSubItemSelect}) => {
    const {t} = useI18n();

    // Access undo/redo context (optional)
    const undoRedoContext = useOptionalUndoRedo();

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
            {componentItems.map(item => (
                <ToolbarItem
                    key={item.id}
                    item={item}
                    isSelected={selectedItem?.id === item.id}
                    onClick={() => onItemClick(item)}
                    mapStyleDefs={mapStyleDefs}
                />
            ))}
            {methodItems.length > 0 && <ToolbarSeparator />}

            {methodItems.map(item => (
                <ToolbarItem
                    key={item.id}
                    item={item}
                    isSelected={selectedItem?.id === item.id}
                    onClick={() => onItemClick(item)}
                    mapStyleDefs={mapStyleDefs}
                />
            ))}

            {noteItems.length > 0 && <ToolbarSeparator />}

            {noteItems.map(item => (
                <ToolbarItem
                    key={item.id}
                    item={item}
                    isSelected={selectedItem?.id === item.id}
                    onClick={() => onItemClick(item)}
                    mapStyleDefs={mapStyleDefs}
                />
            ))}

            {linkItems.length > 0 && <ToolbarSeparator />}

            {linkItems.map(item => (
                <ToolbarItem
                    key={item.id}
                    item={item}
                    isSelected={selectedItem?.id === item.id}
                    onClick={() => onItemClick(item)}
                    mapStyleDefs={mapStyleDefs}
                />
            ))}

            {pstItems.length > 0 && <ToolbarSeparator />}

            {pstItems.map(item => (
                <ToolbarItem
                    key={item.id}
                    item={item}
                    isSelected={selectedItem?.id === item.id}
                    onClick={() => onItemClick(item)}
                    onSubItemSelect={onSubItemSelect}
                    mapStyleDefs={mapStyleDefs}
                />
            ))}

            {otherItems.length > 0 && <ToolbarSeparator />}

            {otherItems.map(item => (
                <ToolbarItem
                    key={item.id}
                    item={item}
                    isSelected={selectedItem?.id === item.id}
                    onClick={() => onItemClick(item)}
                    mapStyleDefs={mapStyleDefs}
                />
            ))}

            {actionItems.length > 0 && <ToolbarSeparator />}

            {undoRedoContext &&
                actionItems.map(item => {
                    const isUndo = item.action === 'undo';
                    const isRedo = item.action === 'redo';
                    const isDisabled = isUndo ? !undoRedoContext.canUndo : !undoRedoContext.canRedo;

                    // Get tooltip text with action description using localized strings
                    let tooltipText = item.label;
                    if (isUndo && undoRedoContext.canUndo) {
                        const lastAction = undoRedoContext.getLastAction();
                        if (lastAction) {
                            const undoTemplate = t('wysiwyg.undo.withAction', 'Undo: {{action}}');
                            tooltipText = undoTemplate.replace('{{action}}', lastAction.actionDescription);
                        }
                    } else if (isRedo && undoRedoContext.canRedo) {
                        const nextAction = undoRedoContext.getNextAction();
                        if (nextAction) {
                            const redoTemplate = t('wysiwyg.redo.withAction', 'Redo: {{action}}');
                            tooltipText = redoTemplate.replace('{{action}}', nextAction.actionDescription);
                        }
                    } else {
                        tooltipText = isUndo
                            ? t('wysiwyg.undo.noActions', 'No actions to undo')
                            : t('wysiwyg.redo.noActions', 'No actions to redo');
                    }

                    return (
                        <UndoRedoToolbarItem
                            key={item.id}
                            item={item}
                            isDisabled={isDisabled}
                            onClick={() => onItemClick(item)}
                            mapStyleDefs={mapStyleDefs}
                            tooltipText={tooltipText}
                        />
                    );
                })}
        </>
    );
});

ToolbarItems.displayName = 'ToolbarItems';
