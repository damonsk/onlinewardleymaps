import React, {memo, useCallback, KeyboardEvent, useState, useRef} from 'react';
import styled from 'styled-components';
import {ToolbarItem as ToolbarItemType, ToolbarItemProps, ToolbarSubItem} from '../../types/toolbar';
import {ToolbarDropdown} from './ToolbarDropdown';

/**
 * Styled button for individual toolbar items with MIRO-style design
 * Enhanced with theme-specific styling for consistent appearance across all map themes
 */
const StyledToolbarButton = styled.button<{$isSelected: boolean}>`
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 8px;
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
        transform: scale(1.05);
    }

    /* Active state */
    &:active {
        transform: scale(0.95);
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

    /* Theme-specific styling */
    .wardley & {
        background: ${props => (props.$isSelected ? '#e3f2fd' : 'transparent')};

        &:hover {
            background: ${props => (props.$isSelected ? '#e3f2fd' : '#f5f5f5')};
        }

        &:focus-visible {
            outline-color: #1976d2;
        }

        ${props =>
            props.$isSelected &&
            `
            &::after {
                background: #1976d2;
            }
        `}
    }

    .colour & {
        background: ${props => (props.$isSelected ? '#eaf5e0' : 'transparent')};

        &:hover {
            background: ${props => (props.$isSelected ? '#eaf5e0' : '#f5f5f5')};
        }

        &:focus-visible {
            outline-color: #8cb358;
        }

        ${props =>
            props.$isSelected &&
            `
            &::after {
                background: #8cb358;
            }
        `}
    }

    .plain & {
        background: ${props => (props.$isSelected ? '#e3f2fd' : 'transparent')};

        &:hover {
            background: ${props => (props.$isSelected ? '#e3f2fd' : '#f5f5f5')};
        }
    }

    .handwritten & {
        background: ${props => (props.$isSelected ? '#f0f4f8' : 'transparent')};

        &:hover {
            background: ${props => (props.$isSelected ? '#f0f4f8' : '#f5f5f5')};
        }
    }

    .dark & {
        background: ${props => (props.$isSelected ? '#3182ce' : 'transparent')};

        &:hover {
            background: ${props => (props.$isSelected ? '#3182ce' : '#4a5568')};
        }

        &:focus-visible {
            outline-color: #63b3ed;
        }

        ${props =>
            props.$isSelected &&
            `
            &::after {
                background: #63b3ed;
            }
        `}
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

        ${props =>
            props.$isSelected &&
            `
            &::after {
                background: #63b3ed;
            }
        `}
    }

    /* Responsive behavior */
    @media (max-width: 768px) {
        width: 38px;
        height: 38px;
    }

    /* Disabled state */
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;

        &:hover {
            transform: none;
            background: ${props => (props.$isSelected ? '#e3f2fd' : 'transparent')};
        }
    }
`;

/**
 * Icon container with consistent scaling
 */
const IconContainer = styled.div`
    transform: scale(0.7);
    display: flex;
    align-items: center;
    justify-content: center;
`;

/**
 * Individual toolbar item component with visual states and accessibility support
 */
export const ToolbarItem: React.FC<ToolbarItemProps> = memo(({item, isSelected, onClick, mapStyleDefs, onSubItemSelect}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const IconComponent = item.icon;

    const handleClick = useCallback(() => {
        if (item.subItems && item.subItems.length > 0) {
            // If item has sub-items, toggle dropdown
            setIsDropdownOpen(!isDropdownOpen);
        } else {
            // Regular item click
            onClick();
        }
    }, [onClick, item.subItems, isDropdownOpen]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLButtonElement>) => {
            // Handle keyboard navigation
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleClick();
            } else if (event.key === 'Escape' && isDropdownOpen) {
                setIsDropdownOpen(false);
            }
        },
        [handleClick, isDropdownOpen],
    );

    const handleSubItemSelect = useCallback((subItem: ToolbarSubItem) => {
        setIsDropdownOpen(false);
        if (onSubItemSelect) {
            onSubItemSelect(subItem);
        }
    }, [onSubItemSelect]);

    const handleDropdownClose = useCallback(() => {
        setIsDropdownOpen(false);
    }, []);

    // Calculate dropdown position
    const getDropdownPosition = useCallback(() => {
        if (!buttonRef.current) return { x: 0, y: 0 };
        
        const rect = buttonRef.current.getBoundingClientRect();
        return {
            x: rect.right + 8, // Position to the right of the button
            y: rect.top
        };
    }, []);

    // Create tooltip text with keyboard shortcut if available
    const tooltipText = item.keyboardShortcut ? `${item.label} (${item.keyboardShortcut.toUpperCase()})` : item.label;

    return (
        <>
            <StyledToolbarButton
                ref={buttonRef}
                $isSelected={isSelected}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                title={tooltipText}
                aria-label={`${item.label} tool${isSelected ? ' (selected)' : ''}${item.keyboardShortcut ? `, keyboard shortcut ${item.keyboardShortcut.toUpperCase()}` : ''}${item.subItems ? ' (has dropdown)' : ''}`}
                aria-pressed={isSelected}
                aria-expanded={item.subItems ? isDropdownOpen : undefined}
                aria-haspopup={item.subItems ? 'menu' : undefined}
                role="button"
                tabIndex={0}
                data-testid={`toolbar-item-${item.id}`}>
                <IconContainer>
                    <IconComponent
                        id={`toolbar-${item.id}`}
                        mapStyleDefs={mapStyleDefs}
                        onClick={() => {}} // Icon click is handled by button
                    />
                </IconContainer>
            </StyledToolbarButton>
            
            {/* Dropdown for items with sub-items */}
            {item.subItems && (
                <ToolbarDropdown
                    items={item.subItems}
                    isOpen={isDropdownOpen}
                    onSelect={handleSubItemSelect}
                    onClose={handleDropdownClose}
                    position={getDropdownPosition()}
                    mapStyleDefs={mapStyleDefs}
                />
            )}
        </>
    );
});

ToolbarItem.displayName = 'ToolbarItem';

export default ToolbarItem;
