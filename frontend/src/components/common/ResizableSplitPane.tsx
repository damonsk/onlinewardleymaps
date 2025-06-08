import { Box } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ResizableSplitPaneProps {
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
    defaultLeftWidth?: number; // percentage (0-100)
    minLeftWidth?: number; // percentage (0-100)
    maxLeftWidth?: number; // percentage (0-100)
    resizerWidth?: number; // pixels
    onResize?: (leftWidth: number) => void;
    storageKey?: string; // localStorage key for persisting width
    isDarkTheme?: boolean; // for theme-aware styling
}

export const ResizableSplitPane: React.FC<ResizableSplitPaneProps> = ({
    leftPanel,
    rightPanel,
    defaultLeftWidth = 33,
    minLeftWidth = 15,
    maxLeftWidth = 70,
    resizerWidth = 8,
    onResize,
    storageKey = 'resizableSplitPane_leftWidth',
    isDarkTheme = false,
}) => {
    // Initialize width from localStorage if available
    const getInitialWidth = () => {
        if (typeof window !== 'undefined' && storageKey) {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const savedWidth = parseFloat(saved);
                if (savedWidth >= minLeftWidth && savedWidth <= maxLeftWidth) {
                    return savedWidth;
                }
            }
        }
        return defaultLeftWidth;
    };

    const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef<number>(0);
    const startWidthRef = useRef<number>(0);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load width from localStorage on mount
    useEffect(() => {
        const initialWidth = getInitialWidth();
        if (initialWidth !== defaultLeftWidth) {
            setLeftWidth(initialWidth);
            onResize?.(initialWidth);
            
            // Wait for map to be properly initialized before triggering resize
            const checkMapReady = () => {
                const mapContainer = document.getElementById('map');
                const mapCanvas = mapContainer?.querySelector('svg');
                
                if (mapContainer && mapCanvas) {
                    const panelResizeEvent = new CustomEvent('panelResize', {
                        detail: {
                            leftWidthPercent: initialWidth,
                            rightWidthPercent: 100 - initialWidth,
                            mapContainerWidth: mapContainer.clientWidth,
                            mapContainerHeight: mapContainer.clientHeight,
                        }
                    });
                    window.dispatchEvent(panelResizeEvent);
                } else {
                    // Map not ready yet, check again in a bit
                    setTimeout(checkMapReady, 200);
                }
            };
            
            // Start checking after a reasonable delay
            setTimeout(checkMapReady, 800);
        }
    }, []);

    // Dispatch resize events when width changes to notify the map
    const updateWidth = useCallback((newWidth: number) => {
        setLeftWidth(newWidth);
        onResize?.(newWidth);
        
        // Debounced dispatch of resize events to avoid excessive updates
        if (resizeTimeoutRef.current) {
            clearTimeout(resizeTimeoutRef.current);
        }
        resizeTimeoutRef.current = setTimeout(() => {
            // Only dispatch the custom panelResize event to avoid conflicts
            // Don't dispatch generic 'resize' event to prevent double-handling
            const mapContainer = document.getElementById('map');
            if (mapContainer) {
                const panelResizeEvent = new CustomEvent('panelResize', {
                    detail: {
                        leftWidthPercent: newWidth,
                        rightWidthPercent: 100 - newWidth,
                        mapContainerWidth: mapContainer.clientWidth,
                        mapContainerHeight: mapContainer.clientHeight,
                    }
                });
                window.dispatchEvent(panelResizeEvent);
            }
        }, 150); // 150ms debounce
    }, [onResize]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            setIsDragging(true);
            startXRef.current = e.clientX;
            startWidthRef.current = leftWidth;
        },
        [leftWidth],
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const deltaX = e.clientX - startXRef.current;
            const deltaPercent = (deltaX / containerRect.width) * 100;
            const newLeftWidth = Math.max(
                minLeftWidth,
                Math.min(maxLeftWidth, startWidthRef.current + deltaPercent),
            );

            updateWidth(newLeftWidth);
        },
        [isDragging, minLeftWidth, maxLeftWidth, updateWidth],
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        // Save to localStorage when dragging ends
        if (typeof window !== 'undefined' && storageKey) {
            localStorage.setItem(storageKey, leftWidth.toString());
        }
    }, [leftWidth, storageKey]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, []);

    return (
        <Box
            ref={containerRef}
            sx={{
                display: 'flex',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
            }}
        >
            {/* Left Panel */}
            <Box
                sx={{
                    width: `${leftWidth}%`,
                    height: '100%',
                    overflow: 'hidden',
                    borderRight: '2px solid rgba(0, 133, 208, 0.2)',
                }}
            >
                {leftPanel}
            </Box>

            {/* Resizer */}
            <Box
                onMouseDown={handleMouseDown}
                sx={{
                    width: `${resizerWidth}px`,
                    height: '100%',
                    cursor: 'col-resize',
                    backgroundColor: isDragging
                        ? 'rgba(0, 133, 208, 0.4)'
                        : 'rgba(0, 133, 208, 0.1)',
                    borderLeft: '1px solid rgba(0, 133, 208, 0.3)',
                    borderRight: '1px solid rgba(0, 133, 208, 0.3)',
                    transition: isDragging
                        ? 'none'
                        : 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 133, 208, 0.25)',
                        borderLeft: '1px solid rgba(0, 133, 208, 0.6)',
                        borderRight: '1px solid rgba(0, 133, 208, 0.6)',
                    },
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&::before': {
                        content: '"⋮"',
                        position: 'absolute',
                        fontSize: '24px',
                        color: isDarkTheme 
                            ? 'rgba(255, 255, 255, 0.6)' 
                            : 'rgba(0, 0, 0, 0.6)',
                        fontWeight: 'bold',
                        lineHeight: 1,
                        userSelect: 'none',
                        pointerEvents: 'none',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '2px',
                        height: '40px',
                        backgroundColor: 'rgba(0, 133, 208, 0.4)',
                        borderRadius: '1px',
                        opacity: isDragging ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                    },
                    '&:hover::before': {
                        color: isDarkTheme 
                            ? 'rgba(255, 255, 255, 0.9)' 
                            : 'rgba(0, 0, 0, 0.9)',
                    },
                    '&:hover::after': {
                        opacity: 1,
                        backgroundColor: 'rgb(0, 133, 208)',
                    },
                }}
            />

            {/* Right Panel */}
            <Box
                sx={{
                    width: `${100 - leftWidth}%`,
                    height: '100%',
                    overflow: 'hidden',
                }}
            >
                {rightPanel}
            </Box>
        </Box>
    );
};
