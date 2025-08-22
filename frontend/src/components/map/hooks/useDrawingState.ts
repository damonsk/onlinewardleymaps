import { useCallback, useState } from 'react';
import { MapDimensions } from '../../../constants/defaults';

export interface DrawingState {
    isDrawing: boolean;
    drawingStartPosition: {x: number; y: number} | null;
    drawingCurrentPosition: {x: number; y: number};
    currentMousePosition: {x: number; y: number};
}

export interface DrawingActions {
    setIsDrawing: (isDrawing: boolean) => void;
    setDrawingStartPosition: (position: {x: number; y: number} | null) => void;
    setDrawingCurrentPosition: (position: {x: number; y: number}) => void;
    setCurrentMousePosition: (position: {x: number; y: number}) => void;
    startDrawing: (position: {x: number; y: number}) => void;
    stopDrawing: () => void;
}

export const useDrawingState = (mapDimensions: MapDimensions): DrawingState & DrawingActions => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingStartPosition, setDrawingStartPosition] = useState<{x: number; y: number} | null>(null);
    const [drawingCurrentPosition, setDrawingCurrentPosition] = useState<{x: number; y: number}>({x: 0, y: 0});
    const [currentMousePosition, setCurrentMousePosition] = useState<{x: number; y: number}>({x: 0, y: 0});

    const startDrawing = useCallback((position: {x: number; y: number}) => {
        setIsDrawing(true);
        setDrawingStartPosition(position);
        setDrawingCurrentPosition(position);
    }, []);

    const stopDrawing = useCallback(() => {
        setIsDrawing(false);
        setDrawingStartPosition(null);
    }, []);

    return {
        isDrawing,
        drawingStartPosition,
        drawingCurrentPosition,
        currentMousePosition,
        setIsDrawing,
        setDrawingStartPosition,
        setDrawingCurrentPosition,
        setCurrentMousePosition,
        startDrawing,
        stopDrawing,
    };
};
