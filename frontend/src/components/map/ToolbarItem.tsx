import React, {memo, useCallback, KeyboardEvent, useState, useRef} from 'react';
import styled from 'styled-components';
import {ToolbarItem as ToolbarItemType, ToolbarItemProps, ToolbarSubItem} from '../../types/toolbar';
import {ToolbarDropdown} from './ToolbarDropdown';

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

        ${props =>
            props.$isSelected &&
            `
            &::after {
                background: #ffffff;
                border: 1px solid #000000;
            }
        `}
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

        ${props =>
            props.$isSelected &&
            `
            &::after {
                background: #000000;
                border: 1px solid #ffffff;
            }
        `}
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
 * Keyboard shortcut indicator positioned in the bottom-right corner
 */
const KeyboardShortcutIndicator = styled.div<{$isSelected: boolean}>`
    position: absolute;
    bottom: 1px;
    right: 1px;
    width: 10px;
    height: 10px;
    background: ${props => (props.$isSelected ? '#1976d2' : '#666')};
    color: white;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7px;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    text-transform: uppercase;
    line-height: 1;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

    /* High contrast mode support */
    @media (prefers-contrast: high) {
        background: ${props => (props.$isSelected ? '#000' : '#333')};
        border: 1px solid ${props => (props.$isSelected ? '#fff' : '#ccc')};
        font-weight: 700;
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
        background: ${props => (props.$isSelected ? '#63b3ed' : '#4a5568')};
        color: ${props => (props.$isSelected ? '#000' : '#fff')};
    }

    /* Theme-specific styling */
    .wardley & {
        background: ${props => (props.$isSelected ? '#1976d2' : '#666')};
    }

    .colour & {
        background: ${props => (props.$isSelected ? '#8cb358' : '#666')};
    }

    .dark & {
        background: ${props => (props.$isSelected ? '#63b3ed' : '#4a5568')};
        color: ${props => (props.$isSelected ? '#000' : '#fff')};
    }

    /* Responsive behavior */
    @media (max-width: 1200px) {
        width: 9px;
        height: 9px;
        font-size: 6px;
    }

    @media (max-width: 768px) {
        width: 8px;
        height: 8px;
        font-size: 5px;
        bottom: 1px;
        right: 1px;
    }
`;

/**
 * Individual toolbar item component with visual states and accessibility support
 */
export const ToolbarItem: React.FC<ToolbarItemProps> = memo(({item, isSelected, onClick, mapStyleDefs, onSubItemSelect}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [announceText, setAnnounceText] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);
    const IconComponent = item.icon;

    const handleClick = useCallback(() => {
        if (item.subItems && item.subItems.length > 0) {
            // If item has sub-items, toggle dropdown
            setIsDropdownOpen(!isDropdownOpen);
            // Announce dropdown state for screen readers
            setAnnounceText(`${item.label} dropdown ${isDropdownOpen ? 'closed' : 'opened'}`);
        } else {
            // Regular item click
            onClick();
            // Announce tool selection for screen readers
            const shortcutText = item.keyboardShortcut ? ` (keyboard shortcut ${item.keyboardShortcut.toUpperCase()})` : '';
            setAnnounceText(`${item.label} tool ${isSelected ? 'deselected' : 'selected'}${shortcutText}`);
        }

        // Clear announcement after a short delay
        setTimeout(() => setAnnounceText(''), 1000);
    }, [onClick, item.subItems, item.label, item.keyboardShortcut, isSelected, isDropdownOpen]);

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

    const handleSubItemSelect = useCallback(
        (subItem: ToolbarSubItem) => {
            setIsDropdownOpen(false);
            if (onSubItemSelect) {
                onSubItemSelect(subItem);
            }
        },
        [onSubItemSelect],
    );

    const handleDropdownClose = useCallback(() => {
        setIsDropdownOpen(false);
    }, []);

    // Calculate dropdown position
    const getDropdownPosition = useCallback(() => {
        if (!buttonRef.current) return {x: 0, y: 0};

        const rect = buttonRef.current.getBoundingClientRect();
        return {
            x: rect.right + 8, // Position to the right of the button
            y: rect.top,
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

                {/* Keyboard shortcut visual indicator */}
                {item.keyboardShortcut && (
                    <KeyboardShortcutIndicator $isSelected={isSelected} aria-hidden="true">
                        {item.keyboardShortcut.toUpperCase()}
                    </KeyboardShortcutIndicator>
                )}
            </StyledToolbarButton>

            {/* Screen reader announcements */}
            {announceText && (
                <ScreenReaderAnnouncement role="status" aria-live="polite" aria-atomic="true">
                    {announceText}
                </ScreenReaderAnnouncement>
            )}

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
