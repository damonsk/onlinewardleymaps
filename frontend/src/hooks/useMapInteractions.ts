import {Dispatch, MouseEvent, SetStateAction, useState} from 'react';
import {TOOL_NONE} from 'react-svg-pan-zoom';
import PositionCalculator from '../components/map/PositionCalculator';
import {MapDimensions} from '../constants/defaults';

interface UseMapInteractionsProps {
    setNewComponentContext: (context: {x: string; y: string} | null) => void;
    mapDimensions: MapDimensions;
}

interface UseMapInteractionsReturn {
    tool: string;
    scaleFactor: number;
    handleZoom: (value: {a: number}) => void;
    handleChangeTool: (event: MouseEvent<HTMLButtonElement>, newTool: string) => void;
    newElementAt: (svgEvent?: {x?: number; y?: number}) => void;
    setScaleFactor: Dispatch<SetStateAction<number>>;
}

export function useMapInteractions({setNewComponentContext, mapDimensions}: UseMapInteractionsProps): UseMapInteractionsReturn {
    const [tool, setTool] = useState<string>(TOOL_NONE);
    const [scaleFactor, setScaleFactor] = useState<number>(1);

    const handleZoom = (value: {a: number}): void => {
        setScaleFactor(value.a);
    };

    const handleChangeTool = (event: MouseEvent<HTMLButtonElement>, newTool: string): void => {
        setTool(newTool);
    };

    const newElementAt = (svgEvent?: {x?: number; y?: number}): void => {
        const positionCalc = new PositionCalculator();
        // Extract SVG coordinates from the double-click event
        // The react-svg-pan-zoom library provides SVG coordinates in the event
        const svgX = svgEvent?.x || 0;
        const svgY = svgEvent?.y || 0;

        // Convert to maturity/visibility (0-1 range)
        const maturity = parseFloat(positionCalc.xToMaturity(svgX, mapDimensions.width));
        const visibility = parseFloat(positionCalc.yToVisibility(svgY, mapDimensions.height));

        // Ensure the coordinates are in the valid 0-1 range
        const clampedMaturity = Math.min(1, Math.max(0, maturity));
        const clampedVisibility = Math.min(1, Math.max(0, visibility));

        // Format with precision of 2 decimal places
        const coords = {
            x: clampedMaturity.toFixed(2),
            y: clampedVisibility.toFixed(2),
        };

        console.log('Quick Add Coordinates:', {
            svgX,
            svgY,
            maturity: clampedMaturity,
            visibility: clampedVisibility,
            result: coords,
        });

        setNewComponentContext(coords);
    };

    return {
        tool,
        scaleFactor,
        handleZoom,
        handleChangeTool,
        newElementAt,
        setScaleFactor,
    };
}
