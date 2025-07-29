import React, {memo, useCallback, useEffect, useRef} from 'react';
import styled from 'styled-components';
import {ToolbarDropdownProps, ToolbarSubItem} from '../../types/toolbar';

/**
 * Styled container for the dropdown menu
 * Positioned absolutely relative to the toolbar item
 */
const DropdownContainer = styled.div<{$position: {x: number; y: number}}>`
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
    z-index: 1001;
    min-width: 140px;

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
        background: #2d3748;
        border-color: #4a5568;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
`;

/**
 * Styled dropdown item button
 */
const DropdownItem = styled.button<{$color: string}>`
    width: 100%;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #2d3748;
    text-align: left;
    transition: all 0.2s ease;
    outline: none;

    &:hover {
        background: #f7fafc;
        transform: translateX(2px);
    }

    &:active {
        transform: translateX(1px);
    }

    &:focus-visible {
        outline: 2px solid #1976d2;
        outline-offset: 2px;
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
        color: #e2e8f0;

        &:hover {
            background: #4a5568;
        }
    }
`;

/**
 * Color indicator for each PST type
 */
const ColorIndicator = styled.div<{$color: string}>`
    width: 16px;
    height: 16px;
    border-radius: 4px;
    background-color: ${props => props.$color};
    border: 1px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
`;

/**
 * ToolbarDropdown component for PST type selection
 * Provides a dropdown menu with color-coded options for Pioneers, Settlers, and Town Planners
 */
export const ToolbarDropdown: React.FC<ToolbarDropdownProps> = memo(({items, isOpen, onSelect, onClose, position, mapStyleDefs}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    /**
     * Handle item selection
     */
    const handleItemSelect = useCallback(
        (item: ToolbarSubItem) => {
            onSelect(item);
            onClose();
        },
        [onSelect, onClose],
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
     * Handle clicks outside the dropdown to close it
     */
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // Add event listener with a small delay to prevent immediate closing
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 10);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    /**
     * Focus the first item when dropdown opens
     */
    useEffect(() => {
        if (isOpen && dropdownRef.current) {
            const firstButton = dropdownRef.current.querySelector('button');
            if (firstButton) {
                firstButton.focus();
            }
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <DropdownContainer ref={dropdownRef} $position={position} role="menu" aria-label="PST type selection" onKeyDown={handleKeyDown}>
            {items.map((item, index) => (
                <DropdownItem
                    key={item.id}
                    $color={item.color}
                    onClick={() => handleItemSelect(item)}
                    role="menuitem"
                    tabIndex={0}
                    aria-label={`Select ${item.label}`}
                    data-testid={`dropdown-item-${item.id}`}>
                    <ColorIndicator $color={item.color} />
                    {item.label}
                </DropdownItem>
            ))}
        </DropdownContainer>
    );
});

ToolbarDropdown.displayName = 'ToolbarDropdown';

export default ToolbarDropdown;
