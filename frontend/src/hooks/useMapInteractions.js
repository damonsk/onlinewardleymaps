import { useState } from 'react';
import { TOOL_NONE } from 'react-svg-pan-zoom';
import PositionCalculator from '../components/map/PositionCalculator';

export function useMapInteractions({ setNewComponentContext, mapDimensions }) {
    const [tool, setTool] = useState(TOOL_NONE);
    const [scaleFactor, setScaleFactor] = useState(1);

    const handleZoom = (value) => {
        setScaleFactor(value.a);
    };

    const handleChangeTool = (event, newTool) => {
        setTool(newTool);
    };

    const newElementAt = (svgEvent) => {
        const positionCalc = new PositionCalculator();
        // Extract SVG coordinates from the double-click event
        // The react-svg-pan-zoom library provides SVG coordinates in the event
        const svgX = svgEvent?.x || 0;
        const svgY = svgEvent?.y || 0;

        const x = positionCalc.xToMaturity(svgX, mapDimensions.width);
        const y = positionCalc.yToVisibility(svgY, mapDimensions.height);
        setNewComponentContext({ x, y });
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
