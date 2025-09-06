import {useCallback, useEffect, useMemo} from 'react';
import {ToolbarItem} from '../../../types/toolbar';
import {UnifiedComponent} from '../../../types/unified/components';
import {UnifiedWardleyMap} from '../../../types/unified/map';
import {findNearestComponent} from '../../../utils/componentDetection';
import {useCoordinateConversion} from './useCoordinateConversion';

interface MapEventHandlersProps {
    // Coordinate conversion
    mapDimensions: {width: number; height: number};
    panZoomValue: any;

    // Map data
    wardleyMap: UnifiedWardleyMap;

    // Toolbar state
    selectedToolbarItem?: ToolbarItem | null;

    // Event callbacks
    onToolbarItemDrop?: (item: ToolbarItem, position: {x: number; y: number}) => void;
    onMouseMove?: (position: {x: number; y: number; nearestComponent?: UnifiedComponent | null}) => void;
    onMouseDown?: (position: {x: number; y: number}) => void;
    onMouseUp?: (position: {x: number; y: number}) => void;
    onComponentClick?: (component: UnifiedComponent | null, position?: {x: number; y: number}) => void;
    onMethodApplication?: (component: UnifiedComponent, method: string) => void;
    handleMapCanvasClick?: (pos: {x: number; y: number}) => void;
    setNewComponentContext?: React.Dispatch<React.SetStateAction<{x: string; y: string} | null>>;

    // State
    linkingState?: 'idle' | 'selecting-source' | 'selecting-target';
    highlightedComponent?: UnifiedComponent | null;
    enableZoomOnClick?: boolean;
}

export function useMapEventHandlers({
    mapDimensions,
    panZoomValue,
    wardleyMap,
    selectedToolbarItem,
    onToolbarItemDrop,
    onMouseMove,
    onMouseDown,
    onMouseUp,
    onComponentClick,
    onMethodApplication,
    handleMapCanvasClick,
    setNewComponentContext,
    linkingState,
    highlightedComponent,
    enableZoomOnClick,
}: MapEventHandlersProps) {
    const {convertSvgToMapCoordinates} = useCoordinateConversion({
        mapDimensions,
        panZoomValue,
    });

    const handleDrawingMode = useCallback(
        (event: any) => {
            if (!onMouseDown) return false;

            const svgX = event.x || 0;
            const svgY = event.y || 0;
            const coordinates = convertSvgToMapCoordinates(svgX, svgY);

            onMouseDown(coordinates);
            return true;
        },
        [onMouseDown, convertSvgToMapCoordinates],
    );

    const handleMethodApplication = useCallback(
        (event: any) => {
            if (!onMethodApplication || !selectedToolbarItem) return false;

            const svgX = event.x || 0;
            const svgY = event.y || 0;
            const coordinates = convertSvgToMapCoordinates(svgX, svgY);

            const allComponents = [...wardleyMap.components, ...wardleyMap.anchors];
            const methodCompatibleComponents = allComponents.filter(component => {
                return component.type === 'component' && !component.pipeline;
            });

            if (highlightedComponent && methodCompatibleComponents.some(c => c.id === highlightedComponent!.id)) {
                onMethodApplication(highlightedComponent, selectedToolbarItem.methodName || '');
            } else {
                // Use raw SVG coordinates for component detection (matches double-click behavior)
                const rawCoordinates = convertSvgToMapCoordinates(svgX, svgY, {x: -35, y: -45});
                const clickedComponent = findNearestComponent(rawCoordinates, methodCompatibleComponents, 0.05);

                if (clickedComponent) {
                    onMethodApplication(clickedComponent, selectedToolbarItem.methodName || '');
                } else if (onToolbarItemDrop) {
                    // Create new component with method using corrected coordinates
                    const offsetCorrection = {x: -30, y: -40};
                    const correctedCoordinates = convertSvgToMapCoordinates(svgX, svgY, offsetCorrection);

                    const methodName = selectedToolbarItem.methodName || '';
                    const modifiedToolbarItem = {
                        ...selectedToolbarItem,
                        toolType: 'placement' as const,
                        template: (name: string, y: string, x: string) => `component ${name} [${y}, ${x}] (${methodName})`,
                        defaultName: `New ${methodName.charAt(0).toUpperCase() + methodName.slice(1)} Component`,
                    };

                    onToolbarItemDrop(modifiedToolbarItem, correctedCoordinates);
                }
            }
            return true;
        },
        [onMethodApplication, selectedToolbarItem, highlightedComponent, wardleyMap, onToolbarItemDrop, convertSvgToMapCoordinates],
    );

    const handleComponentConversion = useCallback(
        (event: any) => {
            if (!onMethodApplication || !selectedToolbarItem || selectedToolbarItem.id !== 'component') return false;

            const svgX = event.x || 0;
            const svgY = event.y || 0;
            const coordinates = convertSvgToMapCoordinates(svgX, svgY);

            const allComponents = [...wardleyMap.components, ...wardleyMap.anchors];
            const methodCompatibleComponents = allComponents.filter(component => {
                return component.type === 'component' && !component.pipeline;
            });

            if (highlightedComponent && methodCompatibleComponents.some(c => c.id === highlightedComponent!.id)) {
                // Convert the highlighted component to a regular component
                onMethodApplication(highlightedComponent, 'component');
            } else {
                // Use raw SVG coordinates for component detection (matches double-click behavior)
                const rawCoordinates = convertSvgToMapCoordinates(svgX, svgY, {x: -35, y: -45});
                const clickedComponent = findNearestComponent(rawCoordinates, methodCompatibleComponents, 0.05);

                if (clickedComponent) {
                    // Convert the clicked component to a regular component
                    onMethodApplication(clickedComponent, 'component');
                } else if (onToolbarItemDrop) {
                    // Create new regular component using corrected coordinates
                    console.debug('Component placement coordinates:', {svgX, svgY, eventX: event.x, eventY: event.y});
                    const offsetCorrection = {x: -30, y: -40};
                    const correctedCoordinates = convertSvgToMapCoordinates(svgX, svgY, offsetCorrection);
                    console.debug('Corrected coordinates for component placement:', correctedCoordinates);

                    onToolbarItemDrop(selectedToolbarItem, correctedCoordinates);
                }
            }
            return true;
        },
        [onMethodApplication, selectedToolbarItem, highlightedComponent, wardleyMap, onToolbarItemDrop, convertSvgToMapCoordinates],
    );

    const handleLinkingMode = useCallback(
        (event: any) => {
            console.debug('handleLinkingMode check:', {linkingState, hasOnComponentClick: !!onComponentClick});
            if (!linkingState || linkingState === 'idle' || !onComponentClick) return false;

            console.debug('handleLinkingMode processing click');
            const svgX = event.x || 0;
            const svgY = event.y || 0;
            const coordinates = convertSvgToMapCoordinates(svgX, svgY);

            if (highlightedComponent) {
                onComponentClick(highlightedComponent);
            } else {
                const allComponents = [...wardleyMap.components, ...wardleyMap.anchors];
                const clickedComponent = findNearestComponent(coordinates, allComponents, 0.05);

                if (clickedComponent) {
                    onComponentClick(clickedComponent);
                } else {
                    // Pass the coordinates when no component is found
                    const offsetCorrection = {x: -30, y: -40};
                    const correctedCoordinates = convertSvgToMapCoordinates(svgX, svgY, offsetCorrection);
                    onComponentClick(null, correctedCoordinates);
                }
            }
            return true;
        },
        [linkingState, onComponentClick, highlightedComponent, wardleyMap, convertSvgToMapCoordinates],
    );

    const handleToolbarItemPlacement = useCallback(
        (event: any) => {
            console.debug('handleToolbarItemPlacement check:', {
                hasSelectedToolbarItem: !!selectedToolbarItem,
                toolType: selectedToolbarItem?.toolType,
                hasOnToolbarItemDrop: !!onToolbarItemDrop
            });
            
            if (!selectedToolbarItem || selectedToolbarItem.toolType !== 'placement' || !onToolbarItemDrop) {
                return false;
            }

            console.debug('handleToolbarItemPlacement processing placement');
            const svgX = event.x || 0;
            const svgY = event.y || 0;
            const offsetCorrection = {x: -30, y: -40};
            const coordinates = convertSvgToMapCoordinates(svgX, svgY, offsetCorrection);

            onToolbarItemDrop(selectedToolbarItem, coordinates);
            return true;
        },
        [selectedToolbarItem, onToolbarItemDrop, convertSvgToMapCoordinates],
    );

    // Add document click listener for debugging and cleanup
    useEffect(() => {
        const debugClickHandler = (e: MouseEvent) => {
            console.debug('Document click detected:', {
                target: e.target,
                coordinates: {x: e.clientX, y: e.clientY}
            });
        };
        
        const cleanupClickHandler = (e: MouseEvent) => {
            // If clicking outside PST elements, ensure any lingering drag states are cleared
            const target = e.target as Element;
            if (target && !target.closest('[data-testid^="pst-box"]') && !target.closest('[data-testid^="pst-handle"]')) {
                // This is a click outside PST elements - we can use this to trigger cleanup if needed
            }
        };
        
        document.addEventListener('click', debugClickHandler);
        document.addEventListener('click', cleanupClickHandler);
        return () => {
            document.removeEventListener('click', debugClickHandler);
            document.removeEventListener('click', cleanupClickHandler);
        };
    }, []);

    const handleMapClick = useCallback(
        (event: any) => {
            console.debug('handleMapClick called:', {
                selectedToolbarItem: selectedToolbarItem?.id,
                toolType: selectedToolbarItem?.toolType,
                linkingState,
                highlightedComponent: highlightedComponent?.id
            });
            
            // Handle different interaction modes in priority order
            if (selectedToolbarItem?.toolType === 'drawing' && handleDrawingMode(event)) {
                console.debug('Drawing mode handled click');
                return;
            }
            if (selectedToolbarItem?.toolType === 'method-application' && handleMethodApplication(event)) {
                console.debug('Method application handled click');
                return;
            }
            if (selectedToolbarItem?.id === 'component' && handleComponentConversion(event)) {
                console.debug('Component conversion handled click');
                return;
            }
            if (handleLinkingMode(event)) {
                console.debug('Linking mode handled click');
                return;
            }
            if (handleToolbarItemPlacement(event)) {
                console.debug('Toolbar item placement handled click');
                return;
            } else {
                console.debug('handleToolbarItemPlacement returned false - not processing click');
            }

            console.debug('No handler processed click, using default behavior');
            // Default click behavior
            if (enableZoomOnClick && handleMapCanvasClick) {
                const pos = {x: event.x || 0, y: event.y || 0};
                handleMapCanvasClick(pos);
            }
        },
        [
            selectedToolbarItem,
            enableZoomOnClick,
            handleMapCanvasClick,
            handleDrawingMode,
            handleMethodApplication,
            handleComponentConversion,
            handleLinkingMode,
            handleToolbarItemPlacement,
        ],
    );

    const handleMapDoubleClick = useCallback(
        (event: any) => {
            if (!enableZoomOnClick || !setNewComponentContext) return;

            const svgPos = {x: event.x || 0, y: event.y || 0};
            const coordinates = convertSvgToMapCoordinates(svgPos.x, svgPos.y);

            setNewComponentContext({
                x: coordinates.x.toFixed(2),
                y: coordinates.y.toFixed(2),
            });
        },
        [enableZoomOnClick, setNewComponentContext, convertSvgToMapCoordinates],
    );

    const handleMapMouseMove = useCallback(
        (event: any) => {
            const svgX = event.x || 0;
            const svgY = event.y || 0;
            const coordinates = convertSvgToMapCoordinates(svgX, svgY);

            if (!onMouseMove) return;

            // Handle different interaction modes
            if (selectedToolbarItem?.toolType === 'placement') {
                onMouseMove(coordinates);
            } else if (selectedToolbarItem?.toolType === 'drawing') {
                onMouseMove(coordinates);
            } else if (selectedToolbarItem?.toolType === 'method-application') {
                const allComponents = [...wardleyMap.components, ...wardleyMap.anchors];
                const methodCompatibleComponents = allComponents.filter(component => {
                    return component.type === 'component' && !component.pipeline;
                });
                // Use raw SVG coordinates for component detection (matches double-click behavior)
                const rawCoordinates = convertSvgToMapCoordinates(svgX, svgY, {x: -35, y: -45});
                const nearestComponent = findNearestComponent(rawCoordinates, methodCompatibleComponents, 0.05);
                onMouseMove({...coordinates, nearestComponent});
            } else if (selectedToolbarItem?.id === 'component') {
                // Handle component conversion mode - same logic as method application
                const allComponents = [...wardleyMap.components, ...wardleyMap.anchors];
                const methodCompatibleComponents = allComponents.filter(component => {
                    return component.type === 'component' && !component.pipeline;
                });
                // Use raw SVG coordinates for component detection (matches double-click behavior)
                const rawCoordinates = convertSvgToMapCoordinates(svgX, svgY, {x: -35, y: -45});
                const nearestComponent = findNearestComponent(rawCoordinates, methodCompatibleComponents, 0.05);
                onMouseMove({...coordinates, nearestComponent});
            } else if (linkingState === 'selecting-source' || linkingState === 'selecting-target') {
                const allComponents = [...wardleyMap.components, ...wardleyMap.anchors];
                const nearestComponent = findNearestComponent(coordinates, allComponents, 0.1);
                onMouseMove({...coordinates, nearestComponent});
            }
        },
        [onMouseMove, selectedToolbarItem, linkingState, wardleyMap, convertSvgToMapCoordinates],
    );

    const handleMapMouseUp = useCallback(
        (event: any) => {
            if (!onMouseUp || selectedToolbarItem?.toolType !== 'drawing') return;

            const svgX = event.x || 0;
            const svgY = event.y || 0;
            const coordinates = convertSvgToMapCoordinates(svgX, svgY);

            onMouseUp(coordinates);
        },
        [onMouseUp, selectedToolbarItem, convertSvgToMapCoordinates],
    );

    return {
        handleMapClick,
        handleMapDoubleClick,
        handleMapMouseMove,
        handleMapMouseUp,
    };
}
