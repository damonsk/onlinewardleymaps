import { useCallback, useEffect, useRef, useState } from 'react';
import { TOOL_NONE } from 'react-svg-pan-zoom';
import PositionCalculator from '../components/map/PositionCalculator';

export function useMapInteractions({
    isModKeyPressed,
    mapText,
    mutateMapText,
    setHighlightLine,
    setNewComponentContext,
    mapDimensions, // Consumed as an object with width/height
    mousePositionRef,
}) {
    const [mapElementsClicked, setMapElementsClicked] = useState([]);
    const [tool, setTool] = useState(TOOL_NONE);
    const [scaleFactor, setScaleFactor] = useState(1);

    // Use a ref to always get the current value of isModKeyPressed
    const isModKeyPressedRef = useRef(isModKeyPressed);

    // Keep the ref updated
    useEffect(() => {
        isModKeyPressedRef.current = isModKeyPressed;
    }, [isModKeyPressed]);

    useEffect(() => {
        console.log('🔥 isModKeyPressed changed to:', isModKeyPressed);
        // Don't automatically clear mapElementsClicked when mod key is released
        // FluidLink should persist until user clicks a second component or cancels with ESC
    }, [isModKeyPressed]);

    const handleZoom = useCallback((value) => {
        setScaleFactor(value.a);
    }, []); // setScaleFactor is stable and doesn't need to be in deps

    const handleChangeTool = useCallback((event, newTool) => {
        setTool(newTool);
    }, []); // setTool is stable and doesn't need to be in deps

    const newElementAt = useCallback(() => {
        const positionCalc = new PositionCalculator();
        const x = positionCalc.xToMaturity(
            mousePositionRef.current.x,
            mapDimensions.width, // Direct access
        );
        const y = positionCalc.yToVisibility(
            mousePositionRef.current.y,
            mapDimensions.height, // Direct access
        );
        setNewComponentContext({ x, y });
    }, [mousePositionRef, mapDimensions, setNewComponentContext]);

    const handleElementClick = useCallback(
        (ctx) => {
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
        },
        [
            isModKeyPressed,
            mapElementsClicked,
            mapText,
            mutateMapText,
            setHighlightLine,
        ],
    );

    return {
        mapElementsClicked,
        tool,
        scaleFactor,
        handleZoom,
        handleChangeTool,
        newElementAt,
        handleElementClick,
        setScaleFactor, // setScaleFactor itself is stable, no useCallback needed here
    };
}
