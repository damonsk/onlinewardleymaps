import React, {memo, useEffect, useState} from 'react';
import styled from 'styled-components';
import {DragPreviewProps} from '../../types/toolbar';

/**
 * Styled container for the drag preview that follows the mouse cursor
 */
const PreviewContainer = styled.div.withConfig({
    shouldForwardProp: prop => !['isValidDropZone', 'isVisible'].includes(prop),
})<{
    x: number;
    y: number;
    isValidDropZone: boolean;
    isVisible: boolean;
}>`
    position: fixed;
    left: ${props => props.x}px;
    top: ${props => props.y}px;
    transform: translate(calc(-50% + 13px), calc(-50% + 6px)); /* Fine-tuned cursor offset */
    pointer-events: none;
    z-index: 10000;
    opacity: ${props => (props.isVisible ? 0.7 : 0)};
    transition: opacity 0.2s ease;

    /* Visual feedback for drop zone validity */
    filter: ${props => (props.isValidDropZone ? 'none' : 'grayscale(100%) brightness(0.5)')};
`;

/**
 * Styled ghost preview of the component being dragged
 * Compact and subtle design for better user experience
 */
const GhostPreview = styled.div.withConfig({
    shouldForwardProp: prop => prop !== 'isValidDropZone',
})<{isValidDropZone: boolean}>`
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 4px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 70px;
    box-shadow: none;
    backdrop-filter: none;

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
        background: ${props => (props.isValidDropZone ? 'rgba(227, 242, 253, 0.3)' : 'rgba(255, 235, 238, 0.3)')};
        border-color: ${props => (props.isValidDropZone ? '#1976d2' : '#d32f2f')};

        @keyframes pulse-valid {
            0%,
            100% {
                border-color: #1976d2;
                background: rgba(227, 242, 253, 0.3);
            }
            50% {
                border-color: #42a5f5;
                background: rgba(243, 249, 255, 0.3);
            }
        }

        @keyframes pulse-invalid {
            0%,
            100% {
                border-color: #d32f2f;
                background: rgba(255, 235, 238, 0.3);
            }
            50% {
                border-color: #f44336;
                background: rgba(252, 228, 236, 0.3);
            }
        }
    }

    .colour & {
        background: ${props => (props.isValidDropZone ? 'rgba(234, 245, 224, 0.3)' : 'rgba(255, 235, 238, 0.3)')};
        border-color: ${props => (props.isValidDropZone ? '#8cb358' : '#d32f2f')};

        @keyframes pulse-valid {
            0%,
            100% {
                border-color: #8cb358;
                background: rgba(234, 245, 224, 0.3);
            }
            50% {
                border-color: #a4c97e;
                background: rgba(243, 249, 232, 0.3);
            }
        }

        @keyframes pulse-invalid {
            0%,
            100% {
                border-color: #d32f2f;
                background: rgba(255, 235, 238, 0.3);
            }
            50% {
                border-color: #f44336;
                background: rgba(252, 228, 236, 0.3);
            }
        }
    }

    .plain & {
        background: ${props => (props.isValidDropZone ? 'rgba(227, 242, 253, 0.3)' : 'rgba(255, 235, 238, 0.3)')};
        border-color: ${props => (props.isValidDropZone ? '#1976d2' : '#d32f2f')};
    }

    .handwritten & {
        background: ${props => (props.isValidDropZone ? 'rgba(240, 244, 248, 0.3)' : 'rgba(255, 235, 238, 0.3)')};
        border-color: ${props => (props.isValidDropZone ? '#1976d2' : '#d32f2f')};
        font-family: 'Gloria Hallelujah', cursive;
    }

    .dark & {
        background: ${props => (props.isValidDropZone ? 'rgba(30, 58, 138, 0.3)' : 'rgba(127, 29, 29, 0.3)')};
        border-color: ${props => (props.isValidDropZone ? '#3b82f6' : '#ef4444')};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

        @keyframes pulse-valid {
            0%,
            100% {
                border-color: #3b82f6;
                background: rgba(30, 58, 138, 0.3);
            }
            50% {
                border-color: #60a5fa;
                background: rgba(30, 64, 175, 0.3);
            }
        }

        @keyframes pulse-invalid {
            0%,
            100% {
                border-color: #ef4444;
                background: rgba(127, 29, 29, 0.3);
            }
            50% {
                border-color: #f87171;
                background: rgba(153, 27, 27, 0.3);
            }
        }
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
        background: ${props => (props.isValidDropZone ? 'rgba(30, 58, 138, 0.3)' : 'rgba(127, 29, 29, 0.3)')};
        border-color: ${props => (props.isValidDropZone ? '#3b82f6' : '#ef4444')};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

        @keyframes pulse-valid {
            0%,
            100% {
                border-color: #3b82f6;
                background: rgba(30, 58, 138, 0.3);
            }
            50% {
                border-color: #60a5fa;
                background: rgba(30, 64, 175, 0.3);
            }
        }

        @keyframes pulse-invalid {
            0%,
            100% {
                border-color: #ef4444;
                background: rgba(127, 29, 29, 0.3);
            }
            50% {
                border-color: #f87171;
                background: rgba(153, 27, 27, 0.3);
            }
        }
    }

    /* Responsive behavior */
    @media (max-width: 768px) {
        min-width: 100px;
        padding: 6px 10px;
    }

    /* Keep drag preview chrome-free across all theme overrides */
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
`;

/**
 * Icon container for the preview
 */
const PreviewIcon = styled.div.withConfig({
    shouldForwardProp: prop => !['offsetX', 'offsetY'].includes(prop),
})<{
    offsetX?: number;
    offsetY?: number;
}>`
    transform: scale(0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
    margin-left: ${props => (props.offsetX ? `${props.offsetX}px` : '0')};
    margin-top: ${props => (props.offsetY ? `${props.offsetY}px` : '0')};
`;

/**
 * Drop zone indicator text
 * Enhanced with theme-specific styling for consistent appearance across all map themes
 */
const DropZoneIndicator = styled.div.withConfig({
    shouldForwardProp: prop => prop !== 'isValidDropZone',
})<{isValidDropZone: boolean}>`
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

    // For linking tools, don't show drag preview (they have their own visual feedback)
    if (selectedItem.toolType === 'linking') {
        return null;
    }

    const IconComponent = selectedItem.icon;
    const previewIconOffset =
        selectedItem.id === 'method-market' || selectedItem.id === 'method-ecosystem'
            ? {
                  x: -8,
                  y: 6,
              }
            : {
                  x: 0,
                  y: 0,
              };

    return (
        <PreviewContainer
            x={currentMousePosition.x}
            y={currentMousePosition.y}
            isValidDropZone={isValidDropZone}
            isVisible={isVisible}
            data-testid="drag-preview"
            role="img"
            aria-label={`Dragging ${selectedItem.label}`}>
            <GhostPreview isValidDropZone={isValidDropZone}>
                <PreviewIcon offsetX={previewIconOffset.x} offsetY={previewIconOffset.y}>
                    <IconComponent
                        id={`preview-${selectedItem.id}`}
                        mapStyleDefs={mapStyleDefs}
                        onClick={() => {}} // No-op for preview
                    />
                </PreviewIcon>
                <DropZoneIndicator isValidDropZone={isValidDropZone}>
                    {isValidDropZone ? 'Click to Drop' : 'Invalid drop zone'}
                </DropZoneIndicator>
            </GhostPreview>
        </PreviewContainer>
    );
});

DragPreview.displayName = 'DragPreview';

export default DragPreview;
