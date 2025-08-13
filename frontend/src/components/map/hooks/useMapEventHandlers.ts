import {useCallback} from 'react';
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

export function useMapEventHandlers(props: MapEventHandlersProps) {
    const {convertSvgToMapCoordinates} = useCoordinateConversion({
        mapDimensions: props.mapDimensions,
        panZoomValue: props.panZoomValue,
    });

    const handleDrawingMode = useCallback(
        (event: any) => {
            if (!props.onMouseDown) return false;

            const svgX = event.x || 0;
            const svgY = event.y || 0;
            const coordinates = convertSvgToMapCoordinates(svgX, svgY);

            props.onMouseDown(coordinates);
            return true;
        },
        [props.onMouseDown, convertSvgToMapCoordinates],
    );

    const handleMethodApplication = useCallback(
        (event: any) => {
            if (!props.onMethodApplication || !props.selectedToolbarItem) return false;

            const svgX = event.x || 0;
            const svgY = event.y || 0;
            const coordinates = convertSvgToMapCoordinates(svgX, svgY);

            const allComponents = [...props.wardleyMap.components, ...props.wardleyMap.anchors];
            const methodCompatibleComponents = allComponents.filter(component => {
                return component.type === 'component' && !component.pipeline;
            });

            if (props.highlightedComponent && methodCompatibleComponents.some(c => c.id === props.highlightedComponent!.id)) {
                props.onMethodApplication(props.highlightedComponent, props.selectedToolbarItem.methodName || '');
            } else {
                // Use raw SVG coordinates for component detection (matches double-click behavior)
                const rawCoordinates = convertSvgToMapCoordinates(svgX, svgY, {x: -35, y: -45});
                const clickedComponent = findNearestComponent(rawCoordinates, methodCompatibleComponents, 0.05);

                if (clickedComponent) {
                    props.onMethodApplication(clickedComponent, props.selectedToolbarItem.methodName || '');
                } else if (props.onToolbarItemDrop) {
                    // Create new component with method using corrected coordinates
                    const offsetCorrection = {x: -30, y: -40};
                    const correctedCoordinates = convertSvgToMapCoordinates(svgX, svgY, offsetCorrection);

                    const methodName = props.selectedToolbarItem.methodName || '';
                    const modifiedToolbarItem = {
                        ...props.selectedToolbarItem,
                        toolType: 'placement' as const,
                        template: (name: string, y: string, x: string) => `component ${name} [${y}, ${x}] (${methodName})`,
                        defaultName: `New ${methodName.charAt(0).toUpperCase() + methodName.slice(1)} Component`,
                    };

                    props.onToolbarItemDrop(modifiedToolbarItem, correctedCoordinates);
                }
            }
            return true;
        },
        [
            props.onMethodApplication,
            props.selectedToolbarItem,
            props.highlightedComponent,
            props.wardleyMap,
            props.onToolbarItemDrop,
            convertSvgToMapCoordinates,
        ],
    );

    const handleComponentConversion = useCallback(
        (event: any) => {
            if (!props.onMethodApplication || !props.selectedToolbarItem || props.selectedToolbarItem.id !== 'component') return false;

            const svgX = event.x || 0;
            const svgY = event.y || 0;
            const coordinates = convertSvgToMapCoordinates(svgX, svgY);

            const allComponents = [...props.wardleyMap.components, ...props.wardleyMap.anchors];
            const methodCompatibleComponents = allComponents.filter(component => {
                return component.type === 'component' && !component.pipeline;
            });

            if (props.highlightedComponent && methodCompatibleComponents.some(c => c.id === props.highlightedComponent!.id)) {
                // Convert the highlighted component to a regular component
                props.onMethodApplication(props.highlightedComponent, 'component');
            } else {
                // Use raw SVG coordinates for component detection (matches double-click behavior)
                const rawCoordinates = convertSvgToMapCoordinates(svgX, svgY, {x: -35, y: -45});
                const clickedComponent = findNearestComponent(rawCoordinates, methodCompatibleComponents, 0.05);

                if (clickedComponent) {
                    // Convert the clicked component to a regular component
                    props.onMethodApplication(clickedComponent, 'component');
                } else if (props.onToolbarItemDrop) {
                    // Create new regular component using corrected coordinates
                    const offsetCorrection = {x: -30, y: -40};
                    const correctedCoordinates = convertSvgToMapCoordinates(svgX, svgY, offsetCorrection);

                    props.onToolbarItemDrop(props.selectedToolbarItem, correctedCoordinates);
                }
            }
            return true;
        },
        [
            props.onMethodApplication,
            props.selectedToolbarItem,
            props.highlightedComponent,
            props.wardleyMap,
            props.onToolbarItemDrop,
            convertSvgToMapCoordinates,
        ],
    );

    const handleLinkingMode = useCallback(
        (event: any) => {
            if (!props.linkingState || props.linkingState === 'idle' || !props.onComponentClick) return false;

            const svgX = event.x || 0;
            const svgY = event.y || 0;
            const coordinates = convertSvgToMapCoordinates(svgX, svgY);

            if (props.highlightedComponent) {
                props.onComponentClick(props.highlightedComponent);
            } else {
                const allComponents = [...props.wardleyMap.components, ...props.wardleyMap.anchors];
                const clickedComponent = findNearestComponent(coordinates, allComponents, 0.05);

                if (clickedComponent) {
                    props.onComponentClick(clickedComponent);
                } else {
                    // Pass the coordinates when no component is found
                    const offsetCorrection = {x: -30, y: -40};
                    const correctedCoordinates = convertSvgToMapCoordinates(svgX, svgY, offsetCorrection);
                    props.onComponentClick(null, correctedCoordinates);
                }
            }
            return true;
        },
        [
            props.linkingState,
            props.onComponentClick,
            props.highlightedComponent,
            props.wardleyMap,
            props.onToolbarItemDrop,
            convertSvgToMapCoordinates,
        ],
    );

    const handleToolbarItemPlacement = useCallback(
        (event: any) => {
            if (!props.selectedToolbarItem || props.selectedToolbarItem.toolType !== 'placement' || !props.onToolbarItemDrop) {
                return false;
            }

            const svgX = event.x || 0;
            const svgY = event.y || 0;
            const offsetCorrection = {x: -30, y: -40};
            const coordinates = convertSvgToMapCoordinates(svgX, svgY, offsetCorrection);

            props.onToolbarItemDrop(props.selectedToolbarItem, coordinates);
            return true;
        },
        [props.selectedToolbarItem, props.onToolbarItemDrop, convertSvgToMapCoordinates],
    );

    const handleMapClick = useCallback(
        (event: any) => {
            // Handle different interaction modes in priority order
            if (props.selectedToolbarItem?.toolType === 'drawing' && handleDrawingMode(event)) return;
            if (props.selectedToolbarItem?.toolType === 'method-application' && handleMethodApplication(event)) return;
            if (props.selectedToolbarItem?.id === 'component' && handleComponentConversion(event)) return;
            if (handleLinkingMode(event)) return;
            if (handleToolbarItemPlacement(event)) return;

            // Default click behavior
            if (props.enableZoomOnClick && props.handleMapCanvasClick) {
                const pos = {x: event.x || 0, y: event.y || 0};
                props.handleMapCanvasClick(pos);
            }
        },
        [
            props.selectedToolbarItem,
            props.enableZoomOnClick,
            props.handleMapCanvasClick,
            handleDrawingMode,
            handleMethodApplication,
            handleComponentConversion,
            handleLinkingMode,
            handleToolbarItemPlacement,
        ],
    );

    const handleMapDoubleClick = useCallback(
        (event: any) => {
            if (!props.enableZoomOnClick || !props.setNewComponentContext) return;

            const svgPos = {x: event.x || 0, y: event.y || 0};
            const coordinates = convertSvgToMapCoordinates(svgPos.x, svgPos.y);

            props.setNewComponentContext({
                x: coordinates.x.toFixed(2),
                y: coordinates.y.toFixed(2),
            });
        },
        [props.enableZoomOnClick, props.setNewComponentContext, convertSvgToMapCoordinates],
    );

    const handleMapMouseMove = useCallback(
        (event: any) => {
            const svgX = event.x || 0;
            const svgY = event.y || 0;
            const coordinates = convertSvgToMapCoordinates(svgX, svgY);

            if (!props.onMouseMove) return;

            // Handle different interaction modes
            if (props.selectedToolbarItem?.toolType === 'placement') {
                props.onMouseMove(coordinates);
            } else if (props.selectedToolbarItem?.toolType === 'drawing') {
                props.onMouseMove(coordinates);
            } else if (props.selectedToolbarItem?.toolType === 'method-application') {
                const allComponents = [...props.wardleyMap.components, ...props.wardleyMap.anchors];
                const methodCompatibleComponents = allComponents.filter(component => {
                    return component.type === 'component' && !component.pipeline;
                });
                // Use raw SVG coordinates for component detection (matches double-click behavior)
                const rawCoordinates = convertSvgToMapCoordinates(svgX, svgY, {x: -35, y: -45});
                const nearestComponent = findNearestComponent(rawCoordinates, methodCompatibleComponents, 0.05);
                props.onMouseMove({...coordinates, nearestComponent});
            } else if (props.selectedToolbarItem?.id === 'component') {
                // Handle component conversion mode - same logic as method application
                const allComponents = [...props.wardleyMap.components, ...props.wardleyMap.anchors];
                const methodCompatibleComponents = allComponents.filter(component => {
                    return component.type === 'component' && !component.pipeline;
                });
                // Use raw SVG coordinates for component detection (matches double-click behavior)
                const rawCoordinates = convertSvgToMapCoordinates(svgX, svgY, {x: -35, y: -45});
                const nearestComponent = findNearestComponent(rawCoordinates, methodCompatibleComponents, 0.05);
                props.onMouseMove({...coordinates, nearestComponent});
            } else if (props.linkingState === 'selecting-source' || props.linkingState === 'selecting-target') {
                const allComponents = [...props.wardleyMap.components, ...props.wardleyMap.anchors];
                const nearestComponent = findNearestComponent(coordinates, allComponents, 0.1);
                props.onMouseMove({...coordinates, nearestComponent});
            }
        },
        [props.onMouseMove, props.selectedToolbarItem, props.linkingState, props.wardleyMap, convertSvgToMapCoordinates],
    );

    const handleMapMouseUp = useCallback(
        (event: any) => {
            if (!props.onMouseUp || props.selectedToolbarItem?.toolType !== 'drawing') return;

            const svgX = event.x || 0;
            const svgY = event.y || 0;
            const coordinates = convertSvgToMapCoordinates(svgX, svgY);

            props.onMouseUp(coordinates);
        },
        [props.onMouseUp, props.selectedToolbarItem, convertSvgToMapCoordinates],
    );

    return {
        handleMapClick,
        handleMapDoubleClick,
        handleMapMouseMove,
        handleMapMouseUp,
    };
}
