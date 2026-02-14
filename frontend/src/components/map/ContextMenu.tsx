import React, {memo, useCallback, useEffect, useRef} from 'react';
import styled from 'styled-components';
import {useI18n} from '../../hooks/useI18n';

/**
 * Interface for context menu items
 */
export interface ContextMenuItem {
    id: string;
    label: string;
    action: () => void;
    disabled?: boolean;
    icon?: React.ComponentType<{size?: number}>;
    destructive?: boolean; // For delete actions
}

/**
 * Props interface for the ContextMenu component
 */
export interface ContextMenuProps {
    items: ContextMenuItem[];
    isOpen: boolean;
    onClose: () => void;
    position: {x: number; y: number};
}

/**
 * Styled container for the context menu
 * Positioned absolutely at the cursor position
 */
const ContextMenuContainer = styled.div<{$position: {x: number; y: number}}>`
    position: fixed;
    left: ${props => props.$position.x}px;
    top: ${props => props.$position.y}px;
    background: #ffffff;
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    z-index: 1002; /* Higher than toolbar dropdown */
    min-width: 120px;

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
        background: #2d3748;
        border-color: #4a5568;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
`;

/**
 * Styled context menu item button
 */
const ContextMenuItem = styled.button<{$disabled?: boolean; $destructive?: boolean}>`
    width: 100%;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    background: transparent;
    cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: ${props => {
        if (props.$disabled) return '#a0aec0';
        if (props.$destructive) return '#e53e3e';
        return '#2d3748';
    }};
    text-align: left;
    transition: all 0.2s ease;
    outline: none;
    opacity: ${props => (props.$disabled ? 0.5 : 1)};

    &:hover:not(:disabled) {
        background: ${props => (props.$destructive ? '#fed7d7' : '#f7fafc')};
        transform: ${props => (props.$disabled ? 'none' : 'translateX(2px)')};
    }

    &:active:not(:disabled) {
        transform: translateX(1px);
    }

    &:focus-visible {
        outline: 2px solid #1976d2;
        outline-offset: 2px;
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
        color: ${props => {
            if (props.$disabled) return '#718096';
            if (props.$destructive) return '#fc8181';
            return '#e2e8f0';
        }};

        &:hover:not(:disabled) {
            background: ${props => (props.$destructive ? '#742a2a' : '#4a5568')};
        }
    }
`;

/**
 * Icon container for menu items
 */
const IconContainer = styled.div`
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

/**
 * ContextMenu component for right-click interactions
 * Provides a context menu with customizable items
 */
export const ContextMenu: React.FC<ContextMenuProps> = memo(({items, isOpen, onClose, position}) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const {t} = useI18n();

    /**
     * Handle item selection
     */
    const handleItemSelect = useCallback(
        (item: ContextMenuItem) => {
            if (item.disabled) return;

            item.action();
            onClose();
        },
        [onClose],
    );

    /**
     * Handle keyboard navigation
     */
    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        },
        [onClose],
    );

    /**
     * Handle clicks outside the menu to close it
     */
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // Add event listener with a small delay to prevent immediate closing
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    /**
     * Handle context menu positioning to keep it within viewport
     */
    const getAdjustedPosition = useCallback(() => {
        if (!menuRef.current) return position;

        const menuRect = menuRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let adjustedX = position.x;
        let adjustedY = position.y;

        // Adjust horizontal position if menu would overflow
        if (position.x + menuRect.width > viewportWidth) {
            adjustedX = viewportWidth - menuRect.width - 10;
        }

        // Adjust vertical position if menu would overflow
        if (position.y + menuRect.height > viewportHeight) {
            adjustedY = viewportHeight - menuRect.height - 10;
        }

        return {x: adjustedX, y: adjustedY};
    }, [position]);

    /**
     * Focus the first enabled item when menu opens
     */
    useEffect(() => {
        if (isOpen && menuRef.current) {
            const firstEnabledButton = menuRef.current.querySelector('button:not(:disabled)');
            if (firstEnabledButton) {
                (firstEnabledButton as HTMLButtonElement).focus();
            }
        }
    }, [isOpen]);

    if (!isOpen || items.length === 0) {
        return null;
    }

    return (
        <ContextMenuContainer
            ref={menuRef}
            $position={getAdjustedPosition()}
            role="menu"
            aria-label={t('map.contextMenu.ariaLabel', 'Context menu')}
            onKeyDown={handleKeyDown}>
            {items.map(item => (
                <ContextMenuItem
                    key={item.id}
                    $disabled={item.disabled}
                    $destructive={item.destructive}
                    onClick={() => handleItemSelect(item)}
                    disabled={item.disabled}
                    role="menuitem"
                    tabIndex={0}
                    aria-label={item.label}
                    data-testid={`context-menu-item-${item.id}`}>
                    {item.icon && (
                        <IconContainer>
                            <item.icon size={16} />
                        </IconContainer>
                    )}
                    {item.label}
                </ContextMenuItem>
            ))}
        </ContextMenuContainer>
    );
});

ContextMenu.displayName = 'ContextMenu';

export default ContextMenu;
