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
}) {
    const [mapElementsClicked, setMapElementsClicked] = useState([]);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [tool, setTool] = useState(TOOL_NONE);
    const [scaleFactor, setScaleFactor] = useState(1);

    useEffect(() => {
        if (isModKeyPressed === false) {
            setMapElementsClicked([]);
        }
    }, [isModKeyPressed]);

    const handleMouseMove = (event) => {
        setMousePosition({ x: event.x, y: event.y });
    };

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
        mousePosition,
        tool,
        scaleFactor,
        handleMouseMove,
        handleZoom,
        handleChangeTool,
        newElementAt,
        handleElementClick,
        setScaleFactor,
    };
}
