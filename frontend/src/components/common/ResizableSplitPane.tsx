import {Box} from '@mui/material';
import React, {useCallback, useEffect, useRef, useState} from 'react';

interface ResizableSplitPaneProps {
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
    defaultLeftWidth?: number;
    minLeftWidth?: number;
    maxLeftWidth?: number;
    resizerWidth?: number;
    onResize?: (leftWidth: number) => void;
    storageKey?: string;
    isDarkTheme?: boolean;
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
    const getInitialWidth = useCallback(() => {
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
    }, [defaultLeftWidth, minLeftWidth, maxLeftWidth, storageKey]);

    const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef<number>(0);
    const startWidthRef = useRef<number>(0);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load width from localStorage on mount only
    useEffect(() => {
        const initialWidth = getInitialWidth();
        console.log('ResizableSplitPane: localStorage check', {
            initialWidth,
            defaultLeftWidth,
            willRestore: initialWidth !== defaultLeftWidth,
        });

        if (initialWidth !== defaultLeftWidth) {
            setLeftWidth(initialWidth);
            onResize?.(initialWidth);

            // Dispatch panel resize event immediately after setting width
            // Use requestAnimationFrame to ensure the DOM has updated
            requestAnimationFrame(() => {
                console.log('ResizableSplitPane: Dispatching panelResize event');
                const mapContainer = document.getElementById('map');
                if (mapContainer) {
                    const panelResizeEvent = new CustomEvent('panelResize', {
                        detail: {
                            leftWidthPercent: initialWidth,
                            rightWidthPercent: 100 - initialWidth,
                            mapContainerWidth: mapContainer.clientWidth,
                            mapContainerHeight: mapContainer.clientHeight,
                        },
                    });
                    window.dispatchEvent(panelResizeEvent);
                    console.log('ResizableSplitPane: panelResize event dispatched');
                } else {
                    console.log('ResizableSplitPane: map container not found, retrying...');
                    // Retry once if map container not found
                    setTimeout(() => {
                        const retryMapContainer = document.getElementById('map');
                        if (retryMapContainer) {
                            const retryEvent = new CustomEvent('panelResize', {
                                detail: {
                                    leftWidthPercent: initialWidth,
                                    rightWidthPercent: 100 - initialWidth,
                                    mapContainerWidth: retryMapContainer.clientWidth,
                                    mapContainerHeight: retryMapContainer.clientHeight,
                                },
                            });
                            window.dispatchEvent(retryEvent);
                            console.log('ResizableSplitPane: panelResize event dispatched on retry');
                        }
                    }, 100);
                }
            });
        }
        // Only run this effect once on mount - eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Dispatch resize events when width changes to notify the map
    const updateWidth = useCallback(
        (newWidth: number) => {
            setLeftWidth(newWidth);
            onResize?.(newWidth);
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            resizeTimeoutRef.current = setTimeout(() => {
                const mapContainer = document.getElementById('map');
                if (mapContainer) {
                    const panelResizeEvent = new CustomEvent('panelResize', {
                        detail: {
                            leftWidthPercent: newWidth,
                            rightWidthPercent: 100 - newWidth,
                            mapContainerWidth: mapContainer.clientWidth,
                            mapContainerHeight: mapContainer.clientHeight,
                        },
                    });
                    window.dispatchEvent(panelResizeEvent);
                }
            }, 150); // 150ms debounce
        },
        [onResize],
    );

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
            const newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, startWidthRef.current + deltaPercent));

            updateWidth(newLeftWidth);
        },
        [isDragging, minLeftWidth, maxLeftWidth, updateWidth],
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
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
            }}>
            <Box
                sx={{
                    width: `${leftWidth}%`,
                    height: '100%',
                    overflow: 'hidden',
                }}>
                {leftPanel}
            </Box>
            <Box
                onMouseDown={handleMouseDown}
                sx={{
                    width: `${resizerWidth}px`,
                    height: '100%',
                    cursor: 'col-resize',
                    backgroundColor: isDragging ? 'rgba(0, 133, 208, 1)' : 'rgba(0, 133, 208, 0.1)',
                    transition: isDragging ? 'none' : 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: ' rgba(0, 133, 208, 1)',
                    },
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&::before': {
                        content: '"⋮"',
                        position: 'absolute',
                        fontSize: '24px',
                        color: isDarkTheme ? 'white' : 'rgba(0, 0, 0, 0.6)',
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
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                    },
                    '&:hover::after': {
                        opacity: 1,
                        backgroundColor: 'rgb(0, 133, 208)',
                    },
                }}
            />
            <Box
                sx={{
                    width: `${100 - leftWidth}%`,
                    height: '100%',
                    overflow: 'hidden',
                }}>
                {rightPanel}
            </Box>
        </Box>
    );
};
