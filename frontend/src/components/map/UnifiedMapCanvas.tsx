import React, {MouseEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ReactSVGPanZoom, TOOL_NONE, UncontrolledReactSVGPanZoom} from 'react-svg-pan-zoom';
import {EvolutionStages, MapCanvasDimensions, MapDimensions, Offsets} from '../../constants/defaults';
import {MapElements} from '../../processing/MapElements';
import {MapTheme} from '../../types/map/styles';
import {ToolbarItem} from '../../types/toolbar';
import {UnifiedWardleyMap} from '../../types/unified/map';
import {UnifiedComponent} from '../../types/unified/components';
import {processLinks} from '../../utils/mapProcessing';
import {findNearestComponent} from '../../utils/componentDetection';
import {useFeatureSwitches} from '../FeatureSwitchesContext';
import {useModKeyPressedConsumer} from '../KeyPressContext';
import {useEditing} from '../EditingContext';
import MapCanvasToolbar from './MapCanvasToolbar';
import MapGridGroup from './MapGridGroup';
import PositionCalculator from './PositionCalculator';
import ModernPositionCalculator from './ModernPositionCalculator';
import UnifiedMapContent from './UnifiedMapContent';

interface ModernUnifiedMapCanvasProps {
    wardleyMap: UnifiedWardleyMap;
    mapDimensions: MapDimensions;
    mapCanvasDimensions: MapCanvasDimensions;
    mapStyleDefs: MapTheme;
    mapEvolutionStates: EvolutionStages;
    evolutionOffsets: Offsets;
    mapText: string;
    mutateMapText: (newText: string) => void;
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    setNewComponentContext: React.Dispatch<React.SetStateAction<{x: string; y: string} | null>>;
    launchUrl: (urlId: string) => void;
    showLinkedEvolved: boolean;
    shouldHideNav?: () => void;
    hideNav?: boolean;
    mapAnnotationsPresentation: any;
    handleMapCanvasClick?: (pos: {x: number; y: number}) => void;
    // New props for toolbar drag and drop support
    selectedToolbarItem?: ToolbarItem | null;
    onToolbarItemDrop?: (item: ToolbarItem, position: {x: number; y: number}) => void;
    onMouseMove?: (position: {x: number; y: number; nearestComponent?: UnifiedComponent | null}) => void;
    // New props for linking functionality
    onComponentClick?: (component: UnifiedComponent | null) => void;
    linkingState?: 'idle' | 'selecting-source' | 'selecting-target';
    sourceComponent?: UnifiedComponent | null;
    highlightedComponent?: UnifiedComponent | null;
    isDuplicateLink?: boolean;
    isInvalidTarget?: boolean;
    showCancellationHint?: boolean;
    isSourceDeleted?: boolean;
    isTargetDeleted?: boolean;
    // New props for PST box drawing functionality
    onMouseDown?: (position: {x: number; y: number}) => void;
    onMouseUp?: (position: {x: number; y: number}) => void;
    isDrawing?: boolean;
    drawingStartPosition?: {x: number; y: number} | null;
    drawingCurrentPosition?: {x: number; y: number};
    // New props for method application functionality
    onMethodApplication?: (component: UnifiedComponent, method: string) => void;
    methodHighlightedComponent?: UnifiedComponent | null;
}

function UnifiedMapCanvas(props: ModernUnifiedMapCanvasProps) {
    const featureSwitches = useFeatureSwitches();
    const {enableAccelerators, showMapToolbar, allowMapZoomMouseWheel} = featureSwitches;

    // Debug mode for coordinate issues - set to false to disable debug indicators
    const DEBUG_COORDINATES = false;

    // State to track the last click position for debugging
    const [lastClickPosition, setLastClickPosition] = useState<{
        x: number;
        y: number;
        correctedX?: number;
        correctedY?: number;
    } | null>(null);

    // State to track current mouse position for linking preview
    const [currentMousePosition, setCurrentMousePosition] = useState<{x: number; y: number}>({x: 0, y: 0});

    const {
        wardleyMap,
        mapText,
        mutateMapText,
        setHighlightLine,
        setNewComponentContext,
        showLinkedEvolved,
        launchUrl,
        mapDimensions,
        mapCanvasDimensions,
        mapStyleDefs,
        evolutionOffsets,
        mapEvolutionStates,
        mapAnnotationsPresentation,
    } = props;

    const isModKeyPressed = useModKeyPressedConsumer();
    const {isAnyElementEditing} = useEditing();
    const Viewer = useRef<ReactSVGPanZoom>(null);

    const mapElements = useMemo(() => {
        return new MapElements(wardleyMap);
    }, [wardleyMap]);

    const processedLinks = useMemo(() => {
        return processLinks(
            wardleyMap.links.map(link => ({
                start: link.start,
                end: link.end,
                line: link.line ?? 0,
                flow: link.flow ?? false,
                flowValue: link.flowValue ?? '',
                future: link.future ?? false,
                past: link.past ?? false,
                context: link.context ?? '',
            })),
            mapElements,
            wardleyMap.anchors.map(anchor => ({
                ...anchor,
                line: anchor.line ?? 0,
                evolved: anchor.evolved ?? false,
                inertia: anchor.inertia ?? false,
                increaseLabelSpacing: anchor.increaseLabelSpacing ?? 0,
                pseudoComponent: anchor.pseudoComponent ?? false,
                offsetY: anchor.offsetY ?? 0,
                evolving: anchor.evolving ?? false,
                decorators: anchor.decorators ?? {
                    buy: false,
                    build: false,
                    outsource: false,
                    ecosystem: false,
                    market: false,
                },
            })),
            showLinkedEvolved,
        );
    }, [wardleyMap.links, mapElements, wardleyMap.anchors, showLinkedEvolved]);

    const [enableZoomOnClick] = useState(true);
    const [tool, setTool] = useState(TOOL_NONE as any);

    // Disable pan/zoom when editing is active
    useEffect(() => {
        if (isAnyElementEditing()) {
            setTool(TOOL_NONE);
        }
    }, [isAnyElementEditing]);
    const [scaleFactor, setScaleFactor] = useState(1);
    const [value, setValue] = useState({
        version: 2 as const,
        mode: TOOL_NONE as any,
        focus: false,
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
        viewerWidth: mapCanvasDimensions.width,
        viewerHeight: mapCanvasDimensions.height,
        SVGWidth: mapDimensions.width + 105,
        SVGHeight: mapDimensions.height + 137,
        miniatureOpen: false,
    });

    const handleZoomChange = (newValue: any) => {
        setValue(newValue);
        setScaleFactor(newValue.a); // a is the scale factor
    };

    const [mapElementsClicked, setMapElementsClicked] = useState<
        Array<{
            el: any;
            e: MouseEvent<Element>;
        }>
    >([]);

    // Position calculator for coordinate conversion
    const positionCalculator = useMemo(() => new PositionCalculator(), []);

    useEffect(() => {
        if (!isModKeyPressed && mapElementsClicked.length > 0) {
            setMapElementsClicked([]);
        }
    }, [isModKeyPressed, mapElementsClicked]);

    // Convert screen coordinates to map coordinates with comprehensive error handling
    const convertScreenToMapCoordinates = useCallback(
        (screenX: number, screenY: number) => {
            try {
                // Validate input parameters
                if (typeof screenX !== 'number' || typeof screenY !== 'number' || isNaN(screenX) || isNaN(screenY)) {
                    console.warn('Invalid screen coordinates provided:', {screenX, screenY});
                    return null;
                }

                // Get the SVG element and its bounding rect
                const svgElement = document.getElementById('svgMap');
                if (!svgElement) {
                    console.warn('SVG element not found for coordinate conversion');
                    // Fallback: return center coordinates
                    return {
                        svgX: mapDimensions.width / 2,
                        svgY: mapDimensions.height / 2,
                        maturity: '0.50',
                        visibility: '0.50',
                        isFallback: true,
                    };
                }

                const svgRect = svgElement.getBoundingClientRect();

                // Validate SVG rect
                if (svgRect.width === 0 || svgRect.height === 0) {
                    console.warn('SVG element has invalid dimensions:', svgRect);
                    return null;
                }

                // Calculate relative position within the SVG
                const relativeX = screenX - svgRect.left;
                const relativeY = screenY - svgRect.top;

                // Log for debugging
                console.debug('Screen to SVG coordinate conversion:', {
                    screenX,
                    screenY,
                    svgRect,
                    relativeX,
                    relativeY,
                });

                // Validate relative coordinates are within SVG bounds
                if (relativeX < 0 || relativeX > svgRect.width || relativeY < 0 || relativeY > svgRect.height) {
                    console.debug('Click outside SVG bounds:', {relativeX, relativeY, svgRect});
                    return null;
                }

                // Account for current zoom and pan transformation
                const transform = value;

                // Validate transform values
                if (transform.a === 0 || transform.d === 0) {
                    console.warn('Invalid transform scale factors:', transform);
                    return null;
                }

                // Convert screen coordinates to SVG coordinates considering zoom and pan
                const svgX = (relativeX - transform.e) / transform.a;
                const svgY = (relativeY - transform.f) / transform.d;

                // Adjust for SVG viewBox offset (-35, -45)
                const adjustedX = svgX + 35;
                const adjustedY = svgY + 45;

                // Log for debugging
                console.debug('Coordinate transformation details:', {
                    transform,
                    svgX,
                    svgY,
                    adjustedX,
                    adjustedY,
                });

                // Validate adjusted coordinates are reasonable
                if (
                    adjustedX < -100 ||
                    adjustedX > mapDimensions.width + 100 ||
                    adjustedY < -100 ||
                    adjustedY > mapDimensions.height + 100
                ) {
                    console.debug('Adjusted coordinates outside reasonable bounds:', {adjustedX, adjustedY});
                    return null;
                }

                // Convert to map coordinates (maturity and visibility) with error handling
                let maturity: number;
                let visibility: number;

                try {
                    maturity = parseFloat(positionCalculator.xToMaturity(adjustedX, mapDimensions.width));
                    visibility = parseFloat(positionCalculator.yToVisibility(adjustedY, mapDimensions.height));
                } catch (calcError) {
                    console.error('Error in position calculation:', calcError);
                    // Fallback to proportional calculation
                    maturity = Math.max(0, Math.min(1, adjustedX / mapDimensions.width));
                    visibility = Math.max(0, Math.min(1, 1 - adjustedY / mapDimensions.height));
                }

                // Validate and clamp coordinates to valid range [0, 1]
                maturity = Math.max(0, Math.min(1, maturity));
                visibility = Math.max(0, Math.min(1, visibility));

                // Additional validation for NaN values
                if (isNaN(maturity) || isNaN(visibility)) {
                    console.error('Calculated coordinates are NaN:', {maturity, visibility});
                    return null;
                }

                // Log final calculated coordinates
                console.debug('Final calculated map coordinates:', {
                    svgX: adjustedX,
                    svgY: adjustedY,
                    maturity: maturity.toFixed(2),
                    visibility: visibility.toFixed(2),
                });

                return {
                    svgX: adjustedX,
                    svgY: adjustedY,
                    maturity: maturity.toFixed(2),
                    visibility: visibility.toFixed(2),
                    isFallback: false,
                };
            } catch (error) {
                console.error('Error converting screen coordinates to map coordinates:', error);

                // Fallback positioning: place component near center of map
                const fallbackMaturity = 0.5 + (Math.random() - 0.5) * 0.2; // 0.4 to 0.6
                const fallbackVisibility = 0.5 + (Math.random() - 0.5) * 0.2; // 0.4 to 0.6

                console.info('Using fallback positioning:', {
                    maturity: fallbackMaturity.toFixed(2),
                    visibility: fallbackVisibility.toFixed(2),
                });

                return {
                    svgX: mapDimensions.width * fallbackMaturity,
                    svgY: mapDimensions.height * (1 - fallbackVisibility),
                    maturity: fallbackMaturity.toFixed(2),
                    visibility: fallbackVisibility.toFixed(2),
                    isFallback: true,
                };
            }
        },
        [mapDimensions.width, mapDimensions.height, positionCalculator, value],
    );

    // Check if a position is a valid drop zone with comprehensive validation
    const isValidDropZone = useCallback(
        (svgX: number, svgY: number) => {
            try {
                // Validate input parameters
                if (typeof svgX !== 'number' || typeof svgY !== 'number' || isNaN(svgX) || isNaN(svgY)) {
                    return false;
                }

                // Adjust for SVG viewBox offset (-35, -45)
                const adjustedX = svgX + 35;
                const adjustedY = svgY + 45;

                // Check if coordinates are within the map dimensions
                if (adjustedX < 0 || adjustedX > mapDimensions.width || adjustedY < 0 || adjustedY > mapDimensions.height) {
                    return false;
                }

                return true;
            } catch (error) {
                console.error('Error validating drop zone:', error);
                return false;
            }
        },
        [mapDimensions.width, mapDimensions.height],
    );

    const handleMapClick = (event: any) => {
        // Handle PST box drawing when in drawing mode
        if (props.selectedToolbarItem?.toolType === 'drawing' && props.onMouseDown) {
            // The react-svg-pan-zoom library provides SVG coordinates directly in the event
            const svgX = event.x || 0;
            const svgY = event.y || 0;

            // Adjust for SVG viewBox offset (-35, -45)
            const adjustedX = svgX + 35;
            const adjustedY = svgY + 45;

            // Convert to map coordinates (maturity and visibility)
            const maturity = parseFloat(positionCalculator.xToMaturity(adjustedX, mapDimensions.width));
            const visibility = parseFloat(positionCalculator.yToVisibility(adjustedY, mapDimensions.height));

            // Validate and clamp coordinates to valid range [0, 1]
            const clampedMaturity = Math.max(0, Math.min(1, maturity));
            const clampedVisibility = Math.max(0, Math.min(1, visibility));

            props.onMouseDown({x: clampedMaturity, y: clampedVisibility});
            return; // Don't process other click handlers when in drawing mode
        }

        // Handle method application when in method application mode
        if (props.selectedToolbarItem?.toolType === 'method-application' && props.onMethodApplication) {
            // The react-svg-pan-zoom library provides SVG coordinates directly in the event
            const svgX = event.x || 0;
            const svgY = event.y || 0;

            // Adjust for SVG viewBox offset (-35, -45)
            const adjustedX = svgX + 35;
            const adjustedY = svgY + 45;

            // Convert to map coordinates (maturity and visibility)
            const maturity = parseFloat(positionCalculator.xToMaturity(adjustedX, mapDimensions.width));
            const visibility = parseFloat(positionCalculator.yToVisibility(adjustedY, mapDimensions.height));

            // Validate and clamp coordinates to valid range [0, 1]
            const clampedMaturity = Math.max(0, Math.min(1, maturity));
            const clampedVisibility = Math.max(0, Math.min(1, visibility));

            // Find the nearest method-compatible component
            const allComponents = [...wardleyMap.components, ...wardleyMap.anchors];
            const methodCompatibleComponents = allComponents.filter(component => {
                return component.type === 'component' && !component.pipeline;
            });

            // Prioritize highlighted component if it exists (for better UX when component is highlighted)
            if (props.highlightedComponent && methodCompatibleComponents.some(c => c.id === props.highlightedComponent!.id)) {
                props.onMethodApplication(props.highlightedComponent, props.selectedToolbarItem.methodName || '');
            } else {
                // Fallback: Find the nearest method-compatible component to the click position
                // Use raw SVG coordinates for consistency with component positioning
                const rawMaturity = parseFloat(positionCalculator.xToMaturity(svgX, mapDimensions.width));
                const rawVisibility = parseFloat(positionCalculator.yToVisibility(svgY, mapDimensions.height));
                const clampedRawMaturity = Math.max(0, Math.min(1, rawMaturity));
                const clampedRawVisibility = Math.max(0, Math.min(1, rawVisibility));

                const clickedComponent = findNearestComponent(
                    {x: clampedRawMaturity, y: clampedRawVisibility},
                    methodCompatibleComponents,
                    0.05, // Slightly larger threshold since we're using raw coordinates
                );

                if (clickedComponent) {
                    // Apply method to existing component
                    props.onMethodApplication(clickedComponent, props.selectedToolbarItem.methodName || '');
                } else {
                    // No compatible component found - create a new component with the method
                    // Use the same offset correction as regular component placement
                    if (props.onToolbarItemDrop) {
                        // Apply the same correction factor used for regular component placement
                        const offsetCorrectionX = -30; // Same as regular placement
                        const offsetCorrectionY = -40; // Same as regular placement

                        const correctedX = adjustedX + offsetCorrectionX;
                        const correctedY = adjustedY + offsetCorrectionY;

                        const correctedMaturity = parseFloat(positionCalculator.xToMaturity(correctedX, mapDimensions.width));
                        const correctedVisibility = parseFloat(positionCalculator.yToVisibility(correctedY, mapDimensions.height));

                        // Validate and clamp corrected coordinates to valid range [0, 1]
                        const clampedCorrectedMaturity = Math.max(0, Math.min(1, correctedMaturity));
                        const clampedCorrectedVisibility = Math.max(0, Math.min(1, correctedVisibility));

                        // Create a modified toolbar item that includes the method
                        const methodName = props.selectedToolbarItem.methodName || '';
                        const modifiedToolbarItem = {
                            ...props.selectedToolbarItem,
                            toolType: 'placement' as const,
                            template: (name: string, y: string, x: string) => `component ${name} [${y}, ${x}] (${methodName})`,
                            defaultName: `New ${methodName.charAt(0).toUpperCase() + methodName.slice(1)} Component`,
                        };

                        props.onToolbarItemDrop(modifiedToolbarItem, {
                            x: clampedCorrectedMaturity,
                            y: clampedCorrectedVisibility,
                        });
                    }
                }
            }
            return; // Always return early when in method application mode to prevent other handlers
        }

        // Handle component linking when in linking mode
        if (props.linkingState && props.linkingState !== 'idle' && props.onComponentClick) {
            // The react-svg-pan-zoom library provides SVG coordinates directly in the event
            const svgX = event.x || 0;
            const svgY = event.y || 0;

            // Adjust for SVG viewBox offset (-35, -45)
            const adjustedX = svgX + 35;
            const adjustedY = svgY + 45;

            // Convert to map coordinates (maturity and visibility)
            const maturity = parseFloat(positionCalculator.xToMaturity(adjustedX, mapDimensions.width));
            const visibility = parseFloat(positionCalculator.yToVisibility(adjustedY, mapDimensions.height));

            // Validate and clamp coordinates to valid range [0, 1]
            const clampedMaturity = Math.max(0, Math.min(1, maturity));
            const clampedVisibility = Math.max(0, Math.min(1, visibility));

            // Prioritize highlighted component if it exists (for better UX when component is pulsating)
            if (props.highlightedComponent) {
                props.onComponentClick(props.highlightedComponent);
            } else {
                // Fallback: Find the nearest component to the click position
                const allComponents = [...wardleyMap.components, ...wardleyMap.anchors];
                const clickedComponent = findNearestComponent(
                    {x: clampedMaturity, y: clampedVisibility},
                    allComponents,
                    0.05, // Click tolerance
                );

                if (clickedComponent) {
                    props.onComponentClick(clickedComponent);
                } else {
                    // No component found - cancel linking by calling onComponentClick with null
                    // This allows the parent component to handle the cancellation
                    if (props.onComponentClick) {
                        // Signal cancellation by calling with a special null component
                        props.onComponentClick(null as any);
                    }
                }
            }
            return; // Always return early when in linking mode to prevent placement logic
        }

        // Handle toolbar item placement when an item is selected (only for placement tools)
        if (props.selectedToolbarItem && props.selectedToolbarItem.toolType === 'placement' && props.onToolbarItemDrop) {
            if (DEBUG_COORDINATES) {
                // Log the entire event object to understand its structure
                console.log('Click event structure:', event);

                // Also log the original event if available
                if (event.originalEvent) {
                    console.log('Original event:', {
                        clientX: event.originalEvent.clientX,
                        clientY: event.originalEvent.clientY,
                        pageX: event.originalEvent.pageX,
                        pageY: event.originalEvent.pageY,
                        screenX: event.originalEvent.screenX,
                        screenY: event.originalEvent.screenY,
                    });
                }
            }

            // The react-svg-pan-zoom library provides SVG coordinates directly in the event
            // These are already adjusted for pan and zoom
            const svgX = event.x || 0;
            const svgY = event.y || 0;

            // Get the original event coordinates if available
            const originalClientX = event.originalEvent?.clientX;
            const originalClientY = event.originalEvent?.clientY;

            // Adjust for SVG viewBox offset (-35, -45)
            // This is critical for correct positioning
            const adjustedX = svgX + 35;
            const adjustedY = svgY + 45;

            // Log exact coordinates for debugging
            console.log('Click coordinates:', {
                eventX: event.x,
                eventY: event.y,
                svgX,
                svgY,
                adjustedX,
                adjustedY,
            });

            // Convert to map coordinates (maturity and visibility)
            // Apply a correction factor to compensate for the offset
            // Based on the images, we need to adjust the coordinates to match the cursor position
            const offsetCorrectionX = -30; // Adjusted to fix the right offset
            const offsetCorrectionY = -40; // Adjusted to fix the down offset (increased by 10px)

            const correctedX = adjustedX + offsetCorrectionX;
            const correctedY = adjustedY + offsetCorrectionY;

            const maturity = parseFloat(positionCalculator.xToMaturity(correctedX, mapDimensions.width));
            const visibility = parseFloat(positionCalculator.yToVisibility(correctedY, mapDimensions.height));

            // Validate and clamp coordinates to valid range [0, 1]
            const clampedMaturity = Math.max(0, Math.min(1, maturity));
            const clampedVisibility = Math.max(0, Math.min(1, visibility));

            if (DEBUG_COORDINATES) {
                console.log('Direct SVG coordinate conversion:', {
                    svgX,
                    svgY,
                    adjustedX,
                    adjustedY,
                    correctedX,
                    correctedY,
                    mapWidth: mapDimensions.width,
                    mapHeight: mapDimensions.height,
                    maturity: clampedMaturity.toFixed(2),
                    visibility: clampedVisibility.toFixed(2),
                });
            }

            // Store the last click position for debugging visualization
            if (DEBUG_COORDINATES) {
                setLastClickPosition({
                    x: adjustedX,
                    y: adjustedY,
                    correctedX,
                    correctedY,
                });
            }

            // Use these coordinates directly, but adjust for the offset
            // This is the key fix - we need to place the component exactly at the cursor position
            props.onToolbarItemDrop(props.selectedToolbarItem, {
                x: clampedMaturity,
                y: clampedVisibility,
            });
            return; // Don't process other click handlers when placing toolbar items
        }

        // Handle existing click functionality
        if (enableZoomOnClick && props.handleMapCanvasClick) {
            const pos = {x: event.x || 0, y: event.y || 0};
            props.handleMapCanvasClick(pos);
        }
    };

    const handleMapDoubleClick = (event: any) => {
        if (enableZoomOnClick) {
            const svgPos = {x: event.x || 0, y: event.y || 0};

            const positionCalc = new PositionCalculator();
            const maturity = parseFloat(positionCalc.xToMaturity(svgPos.x, mapDimensions.width));
            const visibility = parseFloat(positionCalc.yToVisibility(svgPos.y, mapDimensions.height));

            console.log('Double-click coordinates:', {
                svgX: svgPos.x,
                svgY: svgPos.y,
                maturity,
                visibility,
            });

            setNewComponentContext({
                x: maturity.toFixed(2),
                y: visibility.toFixed(2),
            });
        }
    };

    const handleMapMouseMove = (event: any) => {
        // The react-svg-pan-zoom library provides SVG coordinates directly in the event
        // These are already adjusted for pan and zoom
        const svgX = event.x || 0;
        const svgY = event.y || 0;

        // Adjust for SVG viewBox offset (-35, -45)
        const adjustedX = svgX + 35;
        const adjustedY = svgY + 45;

        // Convert to map coordinates (maturity and visibility)
        const maturity = parseFloat(positionCalculator.xToMaturity(adjustedX, mapDimensions.width));
        const visibility = parseFloat(positionCalculator.yToVisibility(adjustedY, mapDimensions.height));

        // Validate and clamp coordinates to valid range [0, 1]
        const clampedMaturity = Math.max(0, Math.min(1, maturity));
        const clampedVisibility = Math.max(0, Math.min(1, visibility));

        // Handle mouse move for drag preview when toolbar item is selected (placement tools only)
        if (props.selectedToolbarItem && props.selectedToolbarItem.toolType === 'placement' && props.onMouseMove) {
            if (DEBUG_COORDINATES) {
                // Only log occasionally to avoid flooding the console
                if (Math.random() < 0.05) {
                    console.log('Mouse move coordinates:', {
                        svgX,
                        svgY,
                        adjustedX,
                        adjustedY,
                        maturity: clampedMaturity.toFixed(2),
                        visibility: clampedVisibility.toFixed(2),
                    });
                }
            }

            // Pass the precise coordinates to the mouse move handler
            props.onMouseMove({
                x: clampedMaturity,
                y: clampedVisibility,
            });
        }

        // Handle mouse move for drawing functionality
        if (props.selectedToolbarItem?.toolType === 'drawing' && props.onMouseMove) {
            props.onMouseMove({
                x: clampedMaturity,
                y: clampedVisibility,
            });
        }

        // Handle mouse move for method application functionality
        if (props.selectedToolbarItem?.toolType === 'method-application' && props.onMouseMove) {
            // Find the nearest component for method application highlighting
            const allComponents = [...wardleyMap.components, ...wardleyMap.anchors];

            // Filter components that can receive method decorators
            // Only regular components (not notes, anchors, or other special types) can have methods applied
            const methodCompatibleComponents = allComponents.filter(component => {
                return component.type === 'component' && !component.pipeline;
            });

            // Try using the raw SVG coordinates (without viewBox offset) for component detection
            // This matches how double-click positioning works
            const rawMaturity = parseFloat(positionCalculator.xToMaturity(svgX, mapDimensions.width));
            const rawVisibility = parseFloat(positionCalculator.yToVisibility(svgY, mapDimensions.height));
            const clampedRawMaturity = Math.max(0, Math.min(1, rawMaturity));
            const clampedRawVisibility = Math.max(0, Math.min(1, rawVisibility));

            const nearestComponent = findNearestComponent(
                {x: clampedRawMaturity, y: clampedRawVisibility},
                methodCompatibleComponents,
                0.05, // Slightly larger threshold since we're using raw coordinates
            );

            // Pass mouse position and highlighted component to parent
            props.onMouseMove({
                x: clampedMaturity,
                y: clampedVisibility,
                nearestComponent,
            });
        }

        // Update current mouse position for linking preview
        setCurrentMousePosition({x: clampedMaturity, y: clampedVisibility});

        // Handle mouse move for linking functionality
        if ((props.linkingState === 'selecting-source' || props.linkingState === 'selecting-target') && props.onMouseMove) {
            // Find the nearest component for magnetic linking
            const allComponents = [...wardleyMap.components, ...wardleyMap.anchors];
            const nearestComponent = findNearestComponent(
                {x: clampedMaturity, y: clampedVisibility},
                allComponents,
                0.1, // Increased magnetic distance threshold for better detection
            );

            // Pass mouse position and highlighted component to parent
            props.onMouseMove({
                x: clampedMaturity,
                y: clampedVisibility,
                nearestComponent,
            });
        }
    };

    const handleMapMouseUp = (event: any) => {
        // Handle PST box drawing completion when in drawing mode
        if (props.isDrawing && props.onMouseUp) {
            // The react-svg-pan-zoom library provides SVG coordinates directly in the event
            const svgX = event.x || 0;
            const svgY = event.y || 0;

            // Adjust for SVG viewBox offset (-35, -45)
            const adjustedX = svgX + 35;
            const adjustedY = svgY + 45;

            // Convert to map coordinates (maturity and visibility)
            const maturity = parseFloat(positionCalculator.xToMaturity(adjustedX, mapDimensions.width));
            const visibility = parseFloat(positionCalculator.yToVisibility(adjustedY, mapDimensions.height));

            // Validate and clamp coordinates to valid range [0, 1]
            const clampedMaturity = Math.max(0, Math.min(1, maturity));
            const clampedVisibility = Math.max(0, Math.min(1, visibility));

            props.onMouseUp({x: clampedMaturity, y: clampedVisibility});
        }
    };

    const clicked = function (ctx: {el: any; e: MouseEvent<Element> | null}) {
        console.log('mapElementsClicked::clicked', ctx);
        setHighlightLine(ctx.el.line || 0);
        if (isModKeyPressed === false) return;
        if (ctx.e === null) return;
        const s = [...mapElementsClicked, {el: ctx.el, e: ctx.e}];
        if (s.length === 2) {
            mutateMapText(mapText + '\r\n' + s.map(r => r.el.name).join('->'));
            setMapElementsClicked([]);
        } else setMapElementsClicked(s);
    };

    useEffect(() => {
        if (Viewer.current) {
            const element = Viewer.current;
            if (element && element.setState) {
                element.setState(value);
            }
        }
    }, [value]);

    useEffect(() => {
        if (mapDimensions.width > 0 && mapDimensions.height > 0) {
            console.log('Initial fit effect triggered', {
                width: mapDimensions.width,
                height: mapDimensions.height,
                components: wardleyMap.components.length,
            });

            const performDelayedFit = () => {
                console.log('performDelayedFit called');
                if (Viewer.current && Viewer.current.fitSelection) {
                    // Check if map has actually rendered components
                    const mapContainer = document.getElementById('map');
                    const renderedComponents = mapContainer?.querySelectorAll('circle, rect');

                    console.log('Checking rendered components:', renderedComponents?.length);

                    if (renderedComponents && renderedComponents.length > 0) {
                        console.log('Components found, scheduling fit');
                        // Wait for any localStorage restoration or other initialization to complete
                        setTimeout(() => {
                            if (Viewer.current && Viewer.current.fitSelection) {
                                console.log('EXECUTING INITIAL FIT TO SELECTION');
                                // Gentle fit with conservative margins
                                Viewer.current.fitSelection(
                                    -60, // Margin for value chain labels on left
                                    -70, // Margin for title at top
                                    mapDimensions.width + 80, // Margin for evolution labels on right
                                    mapDimensions.height + 90, // Margin for evolution labels at bottom
                                );
                            }
                        }, 1500); // Wait for localStorage restoration to complete
                    } else {
                        console.log('Components not rendered yet, retrying...');
                        // Components not rendered yet, try again
                        setTimeout(performDelayedFit, 300);
                    }
                } else {
                    console.log('Viewer.current or fitSelection not available');
                }
            };

            // Start the fit process after a delay
            const timer = setTimeout(performDelayedFit, 800);
            return () => clearTimeout(timer);
        } else {
            console.log('Initial fit conditions not met', {
                width: mapDimensions.width,
                height: mapDimensions.height,
                components: wardleyMap.components.length,
            });
        }
    }, [mapDimensions.width, mapDimensions.height]);
    const fill = {
        wardley: 'url(#wardleyGradient)',
        colour: 'white',
        plain: 'white',
        handwritten: 'white',
        dark: '#353347',
    };

    const svgBackground = mapStyleDefs.className === 'wardley' ? 'white' : fill[mapStyleDefs.className as keyof typeof fill] || 'white';

    // Determine cursor style based on toolbar item selection with compatibility
    const getCursorStyle = () => {
        if (props.selectedToolbarItem) {
            // Show crosshair for drawing tools (PST boxes)
            if (props.selectedToolbarItem.toolType === 'drawing') {
                return 'crosshair';
            }
            // Check if current position is a valid drop zone for other tools
            const isValid = true; // For now, assume valid - this could be enhanced
            return isValid ? 'crosshair' : 'not-allowed';
        }
        return 'default';
    };

    return (
        <div id="map-canvas" style={{width: '100%', height: '100%', position: 'relative'}}>
            <UncontrolledReactSVGPanZoom
                ref={Viewer}
                SVGBackground={svgBackground}
                background="white"
                tool={tool}
                width={mapCanvasDimensions.width || window.innerWidth - 100} // Use larger fallback width
                height={mapCanvasDimensions.height || window.innerHeight - 200} // Use larger fallback height
                detectAutoPan={false}
                detectWheel={allowMapZoomMouseWheel && !isAnyElementEditing()}
                miniatureProps={{
                    position: 'none',
                    background: '#eee',
                    width: 200,
                    height: 200,
                }}
                toolbarProps={{
                    position: 'none',
                }}
                preventPanOutside={false}
                onClick={handleMapClick}
                onDoubleClick={handleMapDoubleClick}
                onMouseMove={handleMapMouseMove}
                onMouseUp={handleMapMouseUp}
                onZoom={handleZoomChange}
                scaleFactorOnWheel={allowMapZoomMouseWheel ? 1.1 : 1}
                style={{
                    userSelect: 'none',
                    fontFamily: mapStyleDefs.fontFamily,
                    cursor: getCursorStyle(),
                    width: '100%',
                    height: '100%', // Use full height since toolbar is now fixed position
                    display: 'block',
                }}>
                <svg
                    className={[mapStyleDefs.className, 'mapCanvas'].join(' ')}
                    width={mapDimensions.width + 105}
                    height={mapDimensions.height + 137}
                    viewBox={`-35 -45 ${mapDimensions.width + 105} ${mapDimensions.height + 137}`}
                    id="svgMap"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink">
                    <MapGridGroup
                        mapDimensions={mapDimensions}
                        mapStyleDefs={mapStyleDefs}
                        mapEvolutionStates={mapEvolutionStates}
                        evolutionOffsets={evolutionOffsets}
                        mapTitle={wardleyMap.title}
                    />

                    {/* Debug indicator for last click position */}
                    {DEBUG_COORDINATES && lastClickPosition && (
                        <g>
                            {/* Original click position */}
                            <circle cx={lastClickPosition.x} cy={lastClickPosition.y} r="5" fill="red" fillOpacity="0.7" />
                            <circle
                                cx={lastClickPosition.x}
                                cy={lastClickPosition.y}
                                r="10"
                                stroke="red"
                                strokeWidth="2"
                                fill="none"
                                strokeOpacity="0.7"
                            />
                            <line
                                x1={lastClickPosition.x - 20}
                                y1={lastClickPosition.y}
                                x2={lastClickPosition.x + 20}
                                y2={lastClickPosition.y}
                                stroke="red"
                                strokeWidth="2"
                                strokeOpacity="0.7"
                            />
                            <line
                                x1={lastClickPosition.x}
                                y1={lastClickPosition.y - 20}
                                x2={lastClickPosition.x}
                                y2={lastClickPosition.y + 20}
                                stroke="red"
                                strokeWidth="2"
                                strokeOpacity="0.7"
                            />
                            <text x={lastClickPosition.x + 15} y={lastClickPosition.y} fill="red" fontSize="12px">
                                Cursor: ({lastClickPosition.x.toFixed(0)}, {lastClickPosition.y.toFixed(0)})
                            </text>

                            {/* Corrected position */}
                            {lastClickPosition.correctedX && lastClickPosition.correctedY && (
                                <>
                                    <circle
                                        cx={lastClickPosition.correctedX}
                                        cy={lastClickPosition.correctedY}
                                        r="5"
                                        fill="blue"
                                        fillOpacity="0.7"
                                    />
                                    <circle
                                        cx={lastClickPosition.correctedX}
                                        cy={lastClickPosition.correctedY}
                                        r="10"
                                        stroke="blue"
                                        strokeWidth="2"
                                        fill="none"
                                        strokeOpacity="0.7"
                                    />
                                    <line
                                        x1={lastClickPosition.correctedX - 20}
                                        y1={lastClickPosition.correctedY}
                                        x2={lastClickPosition.correctedX + 20}
                                        y2={lastClickPosition.correctedY}
                                        stroke="blue"
                                        strokeWidth="2"
                                        strokeOpacity="0.7"
                                    />
                                    <line
                                        x1={lastClickPosition.correctedX}
                                        y1={lastClickPosition.correctedY - 20}
                                        x2={lastClickPosition.correctedX}
                                        y2={lastClickPosition.correctedY + 20}
                                        stroke="blue"
                                        strokeWidth="2"
                                        strokeOpacity="0.7"
                                    />
                                    <text
                                        x={lastClickPosition.correctedX + 15}
                                        y={lastClickPosition.correctedY + 20}
                                        fill="blue"
                                        fontSize="12px">
                                        Component: ({lastClickPosition.correctedX.toFixed(0)}, {lastClickPosition.correctedY.toFixed(0)})
                                    </text>

                                    {/* Line connecting original and corrected positions */}
                                    <line
                                        x1={lastClickPosition.x}
                                        y1={lastClickPosition.y}
                                        x2={lastClickPosition.correctedX}
                                        y2={lastClickPosition.correctedY}
                                        stroke="purple"
                                        strokeWidth="1"
                                        strokeDasharray="5,5"
                                        strokeOpacity="0.7"
                                    />
                                </>
                            )}
                        </g>
                    )}
                    <UnifiedMapContent
                        mapElements={mapElements}
                        mapDimensions={mapDimensions}
                        mapStyleDefs={mapStyleDefs}
                        launchUrl={launchUrl}
                        mapAttitudes={wardleyMap.attitudes}
                        mapText={mapText}
                        mutateMapText={mutateMapText}
                        scaleFactor={scaleFactor}
                        mapElementsClicked={mapElementsClicked}
                        links={processedLinks}
                        evolutionOffsets={evolutionOffsets}
                        enableNewPipelines={true}
                        setHighlightLine={setHighlightLine}
                        clicked={clicked}
                        enableAccelerators={enableAccelerators}
                        mapAccelerators={wardleyMap.accelerators.map((accelerator: any) => ({
                            ...accelerator,
                            type: accelerator.deaccelerator ? 'deaccelerator' : 'accelerator',
                            label: accelerator.label || {x: 0, y: 0},
                        }))}
                        mapNotes={wardleyMap.notes}
                        mapAnnotations={wardleyMap.annotations}
                        mapAnnotationsPresentation={mapAnnotationsPresentation}
                        mapMethods={wardleyMap.methods}
                        linkingState={props.linkingState}
                        sourceComponent={props.sourceComponent}
                        mousePosition={currentMousePosition}
                        highlightedComponent={props.highlightedComponent}
                        isDuplicateLink={props.isDuplicateLink}
                        isInvalidTarget={props.isInvalidTarget}
                        showCancellationHint={props.showCancellationHint}
                        isSourceDeleted={props.isSourceDeleted}
                        isTargetDeleted={props.isTargetDeleted}
                        isDrawing={props.isDrawing}
                        drawingStartPosition={props.drawingStartPosition}
                        drawingCurrentPosition={props.drawingCurrentPosition}
                        selectedToolbarItem={props.selectedToolbarItem}
                        methodHighlightedComponent={props.methodHighlightedComponent}
                    />
                </svg>
            </UncontrolledReactSVGPanZoom>
            {showMapToolbar && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: '20px', // Reduced from 60px to 20px, saving 40px
                        left: '20px',
                        zIndex: 1000,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        padding: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(0,0,0,0.1)',
                    }}>
                    <MapCanvasToolbar
                        shouldHideNav={props.shouldHideNav || (() => { })}
                        hideNav={props.hideNav || false}
                        tool={tool}
                        handleChangeTool={(event, newTool) => setTool(newTool)}
                        _fitToViewer={() => {
                            if (Viewer.current) {
                                // Use conservative margins to avoid clipping
                                if (Viewer.current.fitSelection) {
                                    Viewer.current.fitSelection(
                                        -60, // Margin for value chain labels on left
                                        -70, // Margin for title at top
                                        mapDimensions.width + 80, // Margin for evolution labels on right
                                        mapDimensions.height + 90, // Margin for evolution labels at bottom
                                    );
                                }
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default UnifiedMapCanvas;
