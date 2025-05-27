import { useEffect, useState } from 'react';
import { TOOL_NONE } from 'react-svg-pan-zoom';
import PositionCalculator from '../components/map/PositionCalculator';

export function useMapInteractions({
    isModKeyPressed,
    mapText,
    mutateMapText,
    setHighlightLine,
    setNewComponentContext,
    mapDimensions,
    mousePosition, // Add mousePosition as a parameter instead of managing it internally
}) {
    const [mapElementsClicked, setMapElementsClicked] = useState([]);
    const [tool, setTool] = useState(TOOL_NONE);
    const [scaleFactor, setScaleFactor] = useState(1);

    useEffect(() => {
        if (isModKeyPressed === false) {
            setMapElementsClicked([]);
        }
    }, [isModKeyPressed]);

    const handleZoom = (value) => {
        setScaleFactor(value.a);
    };

    const handleChangeTool = (event, newTool) => {
        setTool(newTool);
    };

    const newElementAt = () => {
        const positionCalc = new PositionCalculator();
        const x = positionCalc.xToMaturity(
            mousePosition.x,
            mapDimensions.width,
        );
        const y = positionCalc.yToVisibility(
            mousePosition.y,
            mapDimensions.height,
        );
        setNewComponentContext({ x, y });
    };

    const handleElementClick = (ctx) => {
        setHighlightLine(ctx.el.line);
        if (isModKeyPressed === false) return;

        let s = [
            ...mapElementsClicked,
            { el: ctx.el, e: { pageX: ctx.e.pageX, pageY: ctx.e.pageY } },
        ];
        if (s.length === 2) {
            mutateMapText(
                mapText + '\r\n' + s.map((r) => r.el.name).join('->'),
            );
            setMapElementsClicked([]);
        } else setMapElementsClicked(s);
    };

    return {
        mapElementsClicked,
        tool,
        scaleFactor,
        handleZoom,
        handleChangeTool,
        newElementAt,
        handleElementClick,
        setScaleFactor,
    };
}
