import {useCallback, useEffect, useRef, useState} from 'react';
import {ToolbarPositioning} from '../services/ToolbarPositioning';

interface Position {
    x: number;
    y: number;
}

interface UseToolbarStateProps {
    defaultPosition?: Position;
    storageKey?: string;
}

interface UseToolbarStateReturn {
    position: Position;
    isDragging: boolean;
    toolbarRef: React.RefObject<HTMLDivElement>;
    renderKey: number;
    handleMouseDown: (e: React.MouseEvent) => void;
    resetPosition: () => void;
}

export const useToolbarState = (props: UseToolbarStateProps = {}): UseToolbarStateReturn => {
    const {
        defaultPosition,
        storageKey = 'wysiwyg-toolbar-position',
    } = props;

    const [position, setPosition] = useState<Position>(() => {
        return ToolbarPositioning.loadSavedPosition(storageKey);
    });

    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
    const [renderKey, setRenderKey] = useState(0);
    const toolbarRef = useRef<HTMLDivElement>(null);

    // Force a re-render after initial mount to ensure styled-components classes are stable
    useEffect(() => {
        const timer = setTimeout(() => setRenderKey(1), 10);
        return () => clearTimeout(timer);
    }, []);

    // Save position to localStorage whenever it changes
    useEffect(() => {
        ToolbarPositioning.savePosition(position, storageKey);
    }, [position, storageKey]);

    // Constrain position to viewport bounds
    const constrainPosition = useCallback((x: number, y: number): Position => {
        return ToolbarPositioning.constrainToViewport({x, y}, toolbarRef.current);
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!toolbarRef.current) return;

        const offset = ToolbarPositioning.calculateDragOffset(e, toolbarRef.current);
        setDragOffset(offset);
        setIsDragging(true);
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;

            const newPosition = ToolbarPositioning.calculateDragPosition(e, dragOffset, toolbarRef.current);
            setPosition(newPosition);
        },
        [isDragging, dragOffset],
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const resetPosition = useCallback(() => {
        const newPosition = defaultPosition || ToolbarPositioning.getDefaultPosition();
        setPosition(newPosition);
    }, [defaultPosition]);

    // Add global mouse event listeners when dragging
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Handle window resize to keep toolbar in bounds
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setPosition((prev: Position) => ToolbarPositioning.adjustForWindowResize(prev, toolbarRef.current));
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        position,
        isDragging,
        toolbarRef,
        renderKey,
        handleMouseDown,
        resetPosition,
    };
};