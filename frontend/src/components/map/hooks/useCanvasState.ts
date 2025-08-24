import {useCallback, useEffect, useState} from 'react';
import {TOOL_NONE} from 'react-svg-pan-zoom';

interface UseCanvasStateProps {
    mapDimensions: {width: number; height: number};
    mapCanvasDimensions: {width: number; height: number};
    isEditing?: boolean;
}

interface UseCanvasStateReturn {
    // Pan/zoom state
    value: {
        version: 2;
        mode: any;
        focus: boolean;
        a: number; // scale factor
        b: number;
        c: number;
        d: number;
        e: number; // pan x
        f: number; // pan y
        viewerWidth: number;
        viewerHeight: number;
        SVGWidth: number;
        SVGHeight: number;
        miniatureOpen: boolean;
    };
    setValue: (value: any) => void;
    
    // Tool and interaction state
    tool: any;
    setTool: (tool: any) => void;
    enableZoomOnClick: boolean;
    scaleFactor: number;
    setScaleFactor: (factor: number) => void;
    
    // Mouse tracking
    currentMousePosition: {x: number; y: number};
    setCurrentMousePosition: (position: {x: number; y: number}) => void;
    lastClickPosition: {x: number; y: number; correctedX?: number; correctedY?: number} | null;
    setLastClickPosition: (position: {x: number; y: number; correctedX?: number; correctedY?: number} | null) => void;
    
    // Sizing state
    isInitialSizingComplete: boolean;
    setIsInitialSizingComplete: (complete: boolean) => void;
    waitingForPanelRestore: boolean;
    setWaitingForPanelRestore: (waiting: boolean) => void;
    
    // Event handlers
    handleZoomChange: (newValue: any) => void;
}

export const useCanvasState = (props: UseCanvasStateProps): UseCanvasStateReturn => {
    const {mapDimensions, mapCanvasDimensions, isEditing} = props;

    // Pan/zoom state
    const [value, setValue] = useState({
        version: 2 as const,
        mode: TOOL_NONE as any,
        focus: false,
        a: 1, // scale factor
        b: 0,
        c: 0,
        d: 1,
        e: 0, // pan x
        f: 0, // pan y
        viewerWidth: mapCanvasDimensions.width,
        viewerHeight: mapCanvasDimensions.height,
        SVGWidth: mapDimensions.width + 105,
        SVGHeight: mapDimensions.height + 137,
        miniatureOpen: false,
    });

    // Tool and interaction state
    const [tool, setTool] = useState(TOOL_NONE as any);
    const [enableZoomOnClick] = useState(true);
    const [scaleFactor, setScaleFactor] = useState(1);

    // Mouse tracking state
    const [currentMousePosition, setCurrentMousePosition] = useState<{x: number; y: number}>({x: 0, y: 0});
    const [lastClickPosition, setLastClickPosition] = useState<{
        x: number;
        y: number;
        correctedX?: number;
        correctedY?: number;
    } | null>(null);

    // Sizing state
    const [isInitialSizingComplete, setIsInitialSizingComplete] = useState(false);
    const [waitingForPanelRestore, setWaitingForPanelRestore] = useState(false);

    // Update dimensions when they change
    useEffect(() => {
        setValue(prev => ({
            ...prev,
            viewerWidth: mapCanvasDimensions.width,
            viewerHeight: mapCanvasDimensions.height,
            SVGWidth: mapDimensions.width + 105,
            SVGHeight: mapDimensions.height + 137,
        }));
    }, [mapDimensions, mapCanvasDimensions]);

    // Disable pan/zoom when editing is active
    useEffect(() => {
        if (isEditing) {
            setTool(TOOL_NONE);
        }
    }, [isEditing]);

    const handleZoomChange = useCallback((newValue: any) => {
        setValue(newValue);
        setScaleFactor(newValue.a); // a is the scale factor
    }, []);

    return {
        // Pan/zoom state
        value,
        setValue,
        
        // Tool and interaction state
        tool,
        setTool,
        enableZoomOnClick,
        scaleFactor,
        setScaleFactor,
        
        // Mouse tracking
        currentMousePosition,
        setCurrentMousePosition,
        lastClickPosition,
        setLastClickPosition,
        
        // Sizing state
        isInitialSizingComplete,
        setIsInitialSizingComplete,
        waitingForPanelRestore,
        setWaitingForPanelRestore,
        
        // Event handlers
        handleZoomChange,
    };
};