import React, {memo, useEffect, useState} from 'react';
import styled from 'styled-components';
import {DragPreviewProps} from '../../types/toolbar';

/**
 * Styled container for the drag preview that follows the mouse cursor
 */
const PreviewContainer = styled.div<{
    x: number;
    y: number;
    isValidDropZone: boolean;
    isVisible: boolean;
}>`
    position: fixed;
    left: ${props => props.x}px;
    top: ${props => props.y}px;
    transform: translate(-50%, -50%); /* Center on cursor */
    pointer-events: none;
    z-index: 10000;
    opacity: ${props => (props.isVisible ? 0.7 : 0)};
    transition: opacity 0.2s ease;

    /* Visual feedback for drop zone validity */
    filter: ${props => (props.isValidDropZone ? 'none' : 'grayscale(100%) brightness(0.5)')};
`;

/**
 * Styled ghost preview of the component being dragged
 * Enhanced with theme-specific styling for consistent appearance across all map themes
 */
const GhostPreview = styled.div<{isValidDropZone: boolean}>`
    background: ${props => (props.isValidDropZone ? '#e3f2fd' : '#ffebee')};
    border: 2px dashed ${props => (props.isValidDropZone ? '#1976d2' : '#d32f2f')};
    border-radius: 8px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 120px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px);

    /* Animation for visual feedback */
    animation: ${props => (props.isValidDropZone ? 'pulse-valid' : 'pulse-invalid')} 2s infinite;

    @keyframes pulse-valid {
        0%,
        100% {
            border-color: #1976d2;
            background: #e3f2fd;
        }
        50% {
            border-color: #42a5f5;
            background: #f3f9ff;
        }
    }

    @keyframes pulse-invalid {
        0%,
        100% {
            border-color: #d32f2f;
            background: #ffebee;
        }
        50% {
            border-color: #f44336;
            background: #fce4ec;
        }
    }

    /* Theme-specific styling */
    .wardley & {
        background: ${props => (props.isValidDropZone ? '#e3f2fd' : '#ffebee')};
        border-color: ${props => (props.isValidDropZone ? '#1976d2' : '#d32f2f')};

        @keyframes pulse-valid {
            0%,
            100% {
                border-color: #1976d2;
                background: #e3f2fd;
            }
            50% {
                border-color: #42a5f5;
                background: #f3f9ff;
            }
        }

        @keyframes pulse-invalid {
            0%,
            100% {
                border-color: #d32f2f;
                background: #ffebee;
            }
            50% {
                border-color: #f44336;
                background: #fce4ec;
            }
        }
    }

    .colour & {
        background: ${props => (props.isValidDropZone ? '#eaf5e0' : '#ffebee')};
        border-color: ${props => (props.isValidDropZone ? '#8cb358' : '#d32f2f')};

        @keyframes pulse-valid {
            0%,
            100% {
                border-color: #8cb358;
                background: #eaf5e0;
            }
            50% {
                border-color: #a4c97e;
                background: #f3f9e8;
            }
        }

        @keyframes pulse-invalid {
            0%,
            100% {
                border-color: #d32f2f;
                background: #ffebee;
            }
            50% {
                border-color: #f44336;
                background: #fce4ec;
            }
        }
    }

    .plain & {
        background: ${props => (props.isValidDropZone ? '#e3f2fd' : '#ffebee')};
        border-color: ${props => (props.isValidDropZone ? '#1976d2' : '#d32f2f')};
    }

    .handwritten & {
        background: ${props => (props.isValidDropZone ? '#f0f4f8' : '#ffebee')};
        border-color: ${props => (props.isValidDropZone ? '#1976d2' : '#d32f2f')};
        font-family: 'Gloria Hallelujah', cursive;
    }

    .dark & {
        background: ${props => (props.isValidDropZone ? '#1e3a8a' : '#7f1d1d')};
        border-color: ${props => (props.isValidDropZone ? '#3b82f6' : '#ef4444')};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

        @keyframes pulse-valid {
            0%,
            100% {
                border-color: #3b82f6;
                background: #1e3a8a;
            }
            50% {
                border-color: #60a5fa;
                background: #1e40af;
            }
        }

        @keyframes pulse-invalid {
            0%,
            100% {
                border-color: #ef4444;
                background: #7f1d1d;
            }
            50% {
                border-color: #f87171;
                background: #991b1b;
            }
        }
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
        background: ${props => (props.isValidDropZone ? '#1e3a8a' : '#7f1d1d')};
        border-color: ${props => (props.isValidDropZone ? '#3b82f6' : '#ef4444')};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

        @keyframes pulse-valid {
            0%,
            100% {
                border-color: #3b82f6;
                background: #1e3a8a;
            }
            50% {
                border-color: #60a5fa;
                background: #1e40af;
            }
        }

        @keyframes pulse-invalid {
            0%,
            100% {
                border-color: #ef4444;
                background: #7f1d1d;
            }
            50% {
                border-color: #f87171;
                background: #991b1b;
            }
        }
    }

    /* Responsive behavior */
    @media (max-width: 768px) {
        min-width: 100px;
        padding: 6px 10px;
    }
`;

/**
 * Icon container for the preview
 */
const PreviewIcon = styled.div`
    transform: scale(0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
`;

/**
 * Text label for the preview
 * Enhanced with theme-specific styling for consistent appearance across all map themes
 */
const PreviewLabel = styled.span<{isValidDropZone: boolean}>`
    font-size: 12px;
    font-weight: 500;
    color: ${props => (props.isValidDropZone ? '#1976d2' : '#d32f2f')};
    white-space: nowrap;

    /* Theme-specific styling */
    .wardley & {
        color: ${props => (props.isValidDropZone ? '#1976d2' : '#d32f2f')};
        font-family:
            Consolas,
            Lucida Console,
            monospace;
    }

    .colour & {
        color: ${props => (props.isValidDropZone ? '#8cb358' : '#d32f2f')};
    }

    .plain & {
        color: ${props => (props.isValidDropZone ? '#1976d2' : '#d32f2f')};
    }

    .handwritten & {
        color: ${props => (props.isValidDropZone ? '#1976d2' : '#d32f2f')};
        font-family: 'Gloria Hallelujah', cursive;
    }

    .dark & {
        color: ${props => (props.isValidDropZone ? '#60a5fa' : '#f87171')};
    }

    @media (prefers-color-scheme: dark) {
        color: ${props => (props.isValidDropZone ? '#60a5fa' : '#f87171')};
    }

    /* Responsive behavior */
    @media (max-width: 768px) {
        font-size: 11px;
    }
`;

/**
 * Drop zone indicator text
 * Enhanced with theme-specific styling for consistent appearance across all map themes
 */
const DropZoneIndicator = styled.div<{isValidDropZone: boolean}>`
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: ${props => (props.isValidDropZone ? '#1976d2' : '#d32f2f')};
    margin-top: 2px;

    /* Theme-specific styling */
    .wardley & {
        color: ${props => (props.isValidDropZone ? '#1976d2' : '#d32f2f')};
        font-family:
            Consolas,
            Lucida Console,
            monospace;
    }

    .colour & {
        color: ${props => (props.isValidDropZone ? '#8cb358' : '#d32f2f')};
    }

    .plain & {
        color: ${props => (props.isValidDropZone ? '#1976d2' : '#d32f2f')};
    }

    .handwritten & {
        color: ${props => (props.isValidDropZone ? '#1976d2' : '#d32f2f')};
        font-family: 'Gloria Hallelujah', cursive;
        font-size: 9px;
    }

    .dark & {
        color: ${props => (props.isValidDropZone ? '#60a5fa' : '#f87171')};
    }

    @media (prefers-color-scheme: dark) {
        color: ${props => (props.isValidDropZone ? '#60a5fa' : '#f87171')};
    }

    /* Responsive behavior */
    @media (max-width: 768px) {
        font-size: 9px;
    }
`;

/**
 * DragPreview component that provides visual feedback during drag operations
 * Shows a ghost preview of the selected component that follows the mouse cursor
 * and provides visual indicators for valid/invalid drop zones
 */
export const DragPreview: React.FC<DragPreviewProps> = memo(({selectedItem, mousePosition, isValidDropZone, mapStyleDefs}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentMousePosition, setCurrentMousePosition] = useState({x: 0, y: 0});

    // Track global mouse position when item is selected with error handling
    useEffect(() => {
        if (!selectedItem) return;

        const handleMouseMove = (event: MouseEvent) => {
            try {
                // Validate mouse event
                if (!event || typeof event.clientX !== 'number' || typeof event.clientY !== 'number') {
                    console.warn('Invalid mouse event received:', event);
                    return;
                }

                // Use exact mouse position without any offset
                setCurrentMousePosition({
                    x: event.clientX,
                    y: event.clientY,
                });

                // Log position occasionally for debugging
                if (Math.random() < 0.01) {
                    console.debug('Mouse position updated:', {
                        clientX: event.clientX,
                        clientY: event.clientY,
                    });
                }
            } catch (error) {
                console.error('Error handling mouse move in drag preview:', error);
            }
        };

        try {
            document.addEventListener('mousemove', handleMouseMove);
        } catch (error) {
            console.error('Error adding mouse move listener:', error);
        }

        return () => {
            try {
                document.removeEventListener('mousemove', handleMouseMove);
            } catch (error) {
                console.error('Error removing mouse move listener:', error);
            }
        };
    }, [selectedItem]);

    // Show/hide preview based on selected item
    useEffect(() => {
        if (selectedItem) {
            // Small delay to prevent flicker when selection changes
            const timer = setTimeout(() => setIsVisible(true), 50);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [selectedItem]);

    // Don't render if no item is selected
    if (!selectedItem) {
        return null;
    }

    const IconComponent = selectedItem.icon;

    return (
        <>
            {/* Crosshair indicator at exact cursor position */}
            <div
                style={{
                    position: 'fixed',
                    left: currentMousePosition.x,
                    top: currentMousePosition.y,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: '2px solid red',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 10001,
                    opacity: isVisible ? 1 : 0,
                }}
            />
            <PreviewContainer
                x={currentMousePosition.x}
                y={currentMousePosition.y}
                isValidDropZone={isValidDropZone}
                isVisible={isVisible}
                data-testid="drag-preview"
                role="img"
                aria-label={`Dragging ${selectedItem.label}`}>
                <GhostPreview isValidDropZone={isValidDropZone}>
                    <PreviewIcon>
                        <IconComponent
                            id={`preview-${selectedItem.id}`}
                            mapStyleDefs={mapStyleDefs}
                            onClick={() => {}} // No-op for preview
                        />
                    </PreviewIcon>
                    <div>
                        <PreviewLabel isValidDropZone={isValidDropZone}>{selectedItem.label}</PreviewLabel>
                        <DropZoneIndicator isValidDropZone={isValidDropZone}>
                            {isValidDropZone ? 'Drop to place' : 'Invalid drop zone'}
                        </DropZoneIndicator>
                    </div>
                </GhostPreview>
            </PreviewContainer>
        </>
    );
});

DragPreview.displayName = 'DragPreview';

export default DragPreview;
