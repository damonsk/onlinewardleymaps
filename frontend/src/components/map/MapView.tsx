import React, {LegacyRef, useCallback, useEffect, useState} from 'react';
import ReactDOMServer from 'react-dom/server';
import {EvolutionStages, MapCanvasDimensions, MapDimensions, Offsets} from '../../constants/defaults';

import {MapAnnotationsPosition} from '../../types/base';
import {MapTheme} from '../../types/map/styles';
import {ToolbarItem} from '../../types/toolbar';
import {UnifiedWardleyMap} from '../../types/unified/map';
import {PST_SUB_ITEMS} from '../../constants/toolbarItems';
import {UnifiedComponent} from '../../types/unified/components';
import {placeComponent, validateComponentPlacement} from '../../utils/mapTextGeneration';
import {
    validateMapInteractionCompatibility,
    ensureToolbarComponentEditingCompatibility,
    getCompatibleCursorStyle,
} from '../../utils/toolbarCompatibility';
import {findNearestComponent, linkExists, addLinkToMapText} from '../../utils/componentDetection';
import {useFeatureSwitches} from '../FeatureSwitchesContext';
import {EditingProvider} from '../EditingContext';

import DragPreview from './DragPreview';
import UnifiedMapCanvas from './UnifiedMapCanvas';
import WysiwygToolbar from './WysiwygToolbar';
import {DefaultThemes} from './foundation/Fill';

export interface ModernMapViewProps {
    wardleyMap: UnifiedWardleyMap;
    shouldHideNav: () => void;
    hideNav: boolean;
    mapTitle: string;
    mapAnnotationsPresentation: MapAnnotationsPosition;
    mapStyleDefs: MapTheme;
    mapCanvasDimensions: MapCanvasDimensions;
    mapDimensions: MapDimensions;
    mapEvolutionStates: EvolutionStages;
    mapRef: React.MutableRefObject<HTMLElement | null>;
    mapText: string;
    mutateMapText: (newText: string) => void;
    evolutionOffsets: Offsets;
    launchUrl: (urlId: string) => void;
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    setNewComponentContext: React.Dispatch<React.SetStateAction<{x: string; y: string} | null>>;
    showLinkedEvolved: boolean;
}

export const MapView: React.FunctionComponent<ModernMapViewProps> = props => {
    const featureSwitches = useFeatureSwitches();

    // Debug mode for positioning issues
    const DEBUG_POSITIONING = true;

    // WYSIWYG Toolbar state management
    const [selectedToolbarItem, setSelectedToolbarItem] = useState<ToolbarItem | null>(null);
    const [isValidDropZone, setIsValidDropZone] = useState(false);

    // Component linking state management
    const [linkingState, setLinkingState] = useState<'idle' | 'selecting-source' | 'selecting-target'>('idle');
    const [sourceComponent, setSourceComponent] = useState<UnifiedComponent | null>(null);
    const [highlightedComponent, setHighlightedComponent] = useState<UnifiedComponent | null>(null);
    const [isDuplicateLink, setIsDuplicateLink] = useState(false);
    const [isInvalidTarget, setIsInvalidTarget] = useState(false);
    const [isSourceDeleted, setIsSourceDeleted] = useState(false);
    const [isTargetDeleted, setIsTargetDeleted] = useState(false);
    const [currentMousePosition, setCurrentMousePosition] = useState<{x: number; y: number}>({x: 0, y: 0});
    const [showCancellationHint, setShowCancellationHint] = useState(false);

    // PST box drawing state management
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingStartPosition, setDrawingStartPosition] = useState<{x: number; y: number} | null>(null);
    const [drawingCurrentPosition, setDrawingCurrentPosition] = useState<{x: number; y: number}>({x: 0, y: 0});

    // Method application state management
    const [methodHighlightedComponent, setMethodHighlightedComponent] = useState<UnifiedComponent | null>(null);

    // User feedback state for error handling
    const [userFeedback, setUserFeedback] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        visible: boolean;
    }>({
        message: '',
        type: 'info',
        visible: false,
    });

    // Function to show user feedback with auto-hide
    const showUserFeedback = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setUserFeedback({
            message,
            type,
            visible: true,
        });

        // Auto-hide after 5 seconds for success/info, 8 seconds for warnings/errors
        const hideDelay = type === 'error' || type === 'warning' ? 8000 : 5000;
        setTimeout(() => {
            setUserFeedback(prev => ({...prev, visible: false}));
        }, hideDelay);
    }, []);

    // Monitor component deletion and automatically cancel linking if source or target is deleted
    useEffect(() => {
        if (linkingState !== 'idle' && sourceComponent) {
            const allComponents = [...props.wardleyMap.components, ...props.wardleyMap.anchors];
            const sourceExists = allComponents.some(c => c.id === sourceComponent.id);

            if (!sourceExists) {
                // Source component was deleted, cancel linking
                setLinkingState('idle');
                setSourceComponent(null);
                setHighlightedComponent(null);
                setSelectedToolbarItem(null);
                setShowCancellationHint(false);
                setIsDuplicateLink(false);
                setIsInvalidTarget(false);
                setIsSourceDeleted(false);
                setIsTargetDeleted(false);
                showUserFeedback('Source component was deleted. Linking cancelled.', 'warning');
            }
        }
    }, [linkingState, sourceComponent, props.wardleyMap.components, props.wardleyMap.anchors, showUserFeedback]);

    const fill: DefaultThemes = {
        wardley: 'url(#wardleyGradient)',
        colour: 'none',
        plain: 'none',
        handwritten: 'none',
        dark: '#353347',
    };

    const containerStyle: React.CSSProperties = {
        backgroundColor: fill[props.mapStyleDefs.className as keyof DefaultThemes],
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    };

    const mapStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
    };

    const legacyRef: LegacyRef<HTMLDivElement> | undefined = props.mapRef as LegacyRef<HTMLDivElement> | undefined;

    function svgToBase64Url(svgString: string, width: number, height: number) {
        console.log(svgString);
        const base64SVG = btoa(
            `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${width}px" height="${height}px">${svgString}</svg>`,
        );
        return `url('data:image/svg+xml;base64,${base64SVG}')`;
    }

    // Handle toolbar item selection with enhanced state synchronization
    const handleToolbarItemSelect = useCallback(
        (item: ToolbarItem | null) => {
            console.log('Toolbar item selection changed:', item?.id || 'none');

            // Special handling for PST tool - default to Pioneer if no sub-item is selected
            let finalItem = item;
            if (item?.id === 'pst' && !item.selectedSubItem && item.subItems) {
                const pioneerSubItem = PST_SUB_ITEMS.find(subItem => subItem.id === 'pioneers');
                if (pioneerSubItem) {
                    finalItem = {
                        ...item,
                        selectedSubItem: pioneerSubItem,
                    };
                    console.log('Auto-selected Pioneer for PST tool via keyboard shortcut');
                }
            }

            setSelectedToolbarItem(finalItem);

            // Reset drop zone validation when selection changes
            if (!item) {
                setIsValidDropZone(false);
            }

            // Handle linking tool selection
            if (item?.toolType === 'linking') {
                setLinkingState('selecting-source');
                setSourceComponent(null);
                setHighlightedComponent(null);
                setShowCancellationHint(false);
                showUserFeedback('Hover & click components to link', 'info');
                // Reset drawing state when switching to linking
                setIsDrawing(false);
                setDrawingStartPosition(null);
            } else if (item?.toolType === 'drawing') {
                // Handle PST drawing tool selection
                if (item.selectedSubItem) {
                    showUserFeedback(`Click and drag to draw ${item.selectedSubItem.label} box`, 'info');
                } else {
                    showUserFeedback('Select a PST type from the dropdown first', 'warning');
                }
                // Reset linking and method application state when switching to drawing
                setLinkingState('idle');
                setSourceComponent(null);
                setHighlightedComponent(null);
                setIsDuplicateLink(false);
                setIsInvalidTarget(false);
                setShowCancellationHint(false);
                setMethodHighlightedComponent(null);
            } else if (item?.toolType === 'method-application') {
                // Handle method application tool selection
                const methodName = item.methodName || 'method';
                showUserFeedback(`Hover over components to apply ${methodName} method`, 'info');
                // Reset linking and drawing state when switching to method application
                setLinkingState('idle');
                setSourceComponent(null);
                setHighlightedComponent(null);
                setIsDuplicateLink(false);
                setIsInvalidTarget(false);
                setShowCancellationHint(false);
                setIsDrawing(false);
                setDrawingStartPosition(null);
            } else {
                // Reset all tool states when switching to other tools
                setLinkingState('idle');
                setSourceComponent(null);
                setHighlightedComponent(null);
                setIsDuplicateLink(false);
                setIsInvalidTarget(false);
                setShowCancellationHint(false);
                setIsDrawing(false);
                setDrawingStartPosition(null);
                setMethodHighlightedComponent(null);
            }

            // Ensure map state is synchronized when toolbar selection changes
            if (item) {
                // Clear any existing component context that might interfere with toolbar placement
                props.setNewComponentContext(null);

                // Log for debugging compatibility
                console.log('Toolbar item selected:', item.id, 'Map ready for component placement');
            } else {
                // When deselecting, ensure we're back to normal map interaction mode
                console.log('Toolbar deselected, returning to normal map interaction mode');
            }
        },
        [props.setNewComponentContext, showUserFeedback],
    );

    // Helper function to handle pipeline placement with corresponding component
    const handlePipelinePlacement = useCallback(
        (item: ToolbarItem, position: {x: number; y: number}) => {
            try {
                const existingComponents = props.wardleyMap.components || [];
                const baseName = item.defaultName || 'New Pipeline';

                // Generate unique name for both the pipeline and its component
                let componentName = baseName;
                let counter = 1;
                const maxAttempts = 100;

                // Find a unique name by appending numbers if needed
                while (existingComponents.some(comp => comp.name === componentName) && counter < maxAttempts) {
                    componentName = `${baseName} ${counter}`;
                    counter++;
                }

                if (counter >= maxAttempts) {
                    throw new Error('Could not generate unique component name');
                }

                // Generate pipeline text
                const pipelineText = item.template?.(componentName, position.y.toFixed(2), position.x.toFixed(2)) || '';

                // Generate corresponding component text
                // Place the component at the same position as the pipeline
                const componentText = `component ${componentName} [${position.y.toFixed(2)}, ${position.x.toFixed(2)}]`;

                // Combine both texts
                const combinedText = componentText + '\n' + pipelineText;

                // Add to map text
                const currentText = props.mapText || '';
                const updatedMapText = currentText.trim() + (currentText.trim() ? '\n' : '') + combinedText;

                // Update map text
                props.mutateMapText(updatedMapText);
                showUserFeedback(`Pipeline "${componentName}" with component added successfully!`, 'success');

                return true;
            } catch (error) {
                console.error('Pipeline placement failed:', error);
                return false;
            }
        },
        [props.wardleyMap.components, props.mapText, props.mutateMapText, showUserFeedback],
    );

    // Handle toolbar item drop (component placement) with comprehensive error handling
    const handleToolbarItemDrop = useCallback(
        (item: ToolbarItem, position: {x: number; y: number}) => {
            // Log detailed placement information for debugging
            if (DEBUG_POSITIONING) {
                console.log(`Placing ${item.id} at position (${position.x.toFixed(4)}, ${position.y.toFixed(4)})`);
                console.log('Toolbar item:', item);
                console.log('Position:', position);
            }

            // Special handling for pipeline - needs a corresponding component
            if (item.category === 'pipeline') {
                const success = handlePipelinePlacement(item, position);
                if (success) {
                    // Clear selection after successful placement
                    setSelectedToolbarItem(null);
                    setIsValidDropZone(false);
                    return;
                }
                // If pipeline placement fails, continue with standard placement as fallback
            }

            // Validate drop zone coordinates
            if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
                console.error('Invalid drop position:', position);
                showUserFeedback('Invalid drop position. Please try again.', 'error');
                setSelectedToolbarItem(null);
                setIsValidDropZone(false);
                return;
            }

            // Validate coordinates are within bounds
            if (position.x < 0 || position.x > 1 || position.y < 0 || position.y > 1) {
                console.error('Drop position outside valid bounds:', position);
                showUserFeedback('Cannot place component outside the map boundaries.', 'error');
                setSelectedToolbarItem(null);
                setIsValidDropZone(false);
                return;
            }

            // Validate toolbar item
            if (!item || !item.defaultName || !item.template) {
                console.error('Invalid toolbar item:', item);
                showUserFeedback('Invalid component type. Please try selecting a different component.', 'error');
                setSelectedToolbarItem(null);
                setIsValidDropZone(false);
                return;
            }

            try {
                // Validate component placement parameters
                const placementParams = {
                    item,
                    position,
                    existingComponents: props.wardleyMap.components || [],
                    currentMapText: props.mapText,
                };

                const validation = validateComponentPlacement(placementParams);
                if (!validation.isValid) {
                    console.warn('Component placement validation warnings:', validation.errors);
                    // Continue with placement but log warnings
                }

                // Use enhanced utility function for component placement
                const result = placeComponent(placementParams, {
                    normalizeLineEndings: true,
                    preserveWhitespace: false,
                });

                console.log('Component placed successfully:', {
                    componentName: result.componentName,
                    mapTextLength: result.updatedMapText.length,
                });

                // Validate the generated map text before applying
                if (!result.updatedMapText || typeof result.updatedMapText !== 'string') {
                    throw new Error('Generated map text is invalid');
                }

                // Update map text with the enhanced result
                try {
                    props.mutateMapText(result.updatedMapText);
                    showUserFeedback(`Component "${result.componentName}" added successfully!`, 'success');
                } catch (mutationError) {
                    console.error('Map text mutation failed:', mutationError);
                    throw new Error('Failed to update map text');
                }

                // Clear selection after successful placement
                setSelectedToolbarItem(null);
                setIsValidDropZone(false);
            } catch (error) {
                console.error('Enhanced component placement failed:', error);
                showUserFeedback('Component placement failed. Trying alternative method...', 'warning');

                // Fallback to original implementation with enhanced error handling
                try {
                    const existingComponents = props.wardleyMap.components || [];
                    const baseName = item.defaultName || 'New Component';
                    let componentName = baseName;
                    let counter = 1;
                    const maxAttempts = 100;

                    // Find a unique name by appending numbers if needed
                    while (existingComponents.some(comp => comp.name === componentName) && counter < maxAttempts) {
                        componentName = `${baseName} ${counter}`;
                        counter++;
                    }

                    if (counter >= maxAttempts) {
                        throw new Error('Could not generate unique component name');
                    }

                    // Validate template function
                    if (typeof item.template !== 'function') {
                        throw new Error('Invalid component template');
                    }

                    // Generate map text using the item's template with validation
                    let newComponentText: string;
                    try {
                        newComponentText = item.template?.(componentName, position.y.toFixed(2), position.x.toFixed(2)) || '';
                    } catch (templateError) {
                        console.error('Template generation failed:', templateError);
                        // Use a basic fallback template
                        newComponentText = `component ${componentName} [${position.y.toFixed(2)}, ${position.x.toFixed(2)}]`;
                    }

                    if (!newComponentText || typeof newComponentText !== 'string') {
                        throw new Error('Generated component text is invalid');
                    }

                    // Validate current map text
                    const currentText = props.mapText || '';

                    // Add the new component to the map text with proper formatting
                    const updatedMapText = currentText.trim() + (currentText.trim() ? '\n' : '') + newComponentText;

                    // Validate the final map text
                    if (updatedMapText.length > 100000) {
                        // Reasonable size limit
                        throw new Error('Map text would exceed maximum size limit');
                    }

                    // Apply the map text mutation with error handling
                    try {
                        props.mutateMapText(updatedMapText);
                        showUserFeedback(`Component "${componentName}" added successfully!`, 'success');
                        console.log('Component placed using fallback method');
                    } catch (mutationError) {
                        console.error('Map text mutation failed in fallback:', mutationError);
                        throw new Error('Failed to update map text in fallback method');
                    }
                } catch (fallbackError) {
                    console.error('Fallback component placement also failed:', fallbackError);
                    showUserFeedback('Failed to add component. Please check the map and try again.', 'error');
                }

                // Clear selection regardless of success/failure
                setSelectedToolbarItem(null);
                setIsValidDropZone(false);
            }
        },
        [props.wardleyMap.components, props.mapText, props.mutateMapText, handlePipelinePlacement],
    );

    // Handle component click for linking workflow
    const handleComponentClick = useCallback(
        (component: UnifiedComponent | null, position?: {x: number; y: number}) => {
            // Helper function to reset all linking state
            const resetLinkingState = () => {
                setLinkingState('idle');
                setSourceComponent(null);
                setHighlightedComponent(null);
                setSelectedToolbarItem(null);
                setShowCancellationHint(false);
                setIsDuplicateLink(false);
                setIsInvalidTarget(false);
                setIsSourceDeleted(false);
                setIsTargetDeleted(false);
            };

            // Handle clicking on empty areas (component is null)
            if (component === null) {
                // If we're selecting a target and have a position, create a new component and link to it
                if (linkingState === 'selecting-target' && position && sourceComponent) {
                    try {
                        // Validate position
                        if (position.x < 0 || position.x > 1 || position.y < 0 || position.y > 1) {
                            showUserFeedback('Cannot create component outside the map boundaries.', 'error');
                            return;
                        }

                        // Create a unique component name
                        const existingComponents = [...props.wardleyMap.components, ...props.wardleyMap.anchors];
                        const baseName = 'New Component';
                        let componentName = baseName;
                        let counter = 1;
                        while (existingComponents.some(c => c.name === componentName)) {
                            componentName = `${baseName} ${counter}`;
                            counter++;
                        }

                        // Create the component text
                        const componentText = `component ${componentName} [${position.y.toFixed(2)}, ${position.x.toFixed(2)}]`;
                        const linkText = `${sourceComponent.name}->${componentName}`;

                        // Add both component and link to map text
                        const updatedMapText = props.mapText + '\r\n' + componentText + '\r\n' + linkText;
                        props.mutateMapText(updatedMapText);

                        showUserFeedback(`Created "${componentName}" and linked from "${sourceComponent.name}"`, 'success');

                        // Reset linking state
                        resetLinkingState();
                    } catch (error) {
                        console.error('Failed to create component and link:', error);
                        showUserFeedback('Failed to create component and link. Please try again.', 'error');
                        resetLinkingState();
                    }
                } else if (linkingState !== 'idle') {
                    // For other cases, cancel linking
                    resetLinkingState();
                    showUserFeedback('Linking cancelled', 'info');
                }
                return;
            }

            // Validate that the component still exists in the current map
            const allComponents = [...props.wardleyMap.components, ...props.wardleyMap.anchors];
            const componentExists = allComponents.some(c => c.id === component.id);
            if (!componentExists) {
                showUserFeedback('Component no longer exists. Linking cancelled.', 'warning');
                resetLinkingState();
                return;
            }

            if (linkingState === 'selecting-source') {
                // First click - select source component
                setSourceComponent(component);
                setLinkingState('selecting-target');
                showUserFeedback(`Selected "${component.name}" as source. Click another component to create a link.`, 'info');
            } else if (linkingState === 'selecting-target') {
                // Second click - create link
                if (!sourceComponent) {
                    console.error('No source component selected');
                    setLinkingState('selecting-source');
                    return;
                }

                // Validate that the source component still exists
                const sourceExists = allComponents.some(c => c.id === sourceComponent.id);
                if (!sourceExists) {
                    showUserFeedback('Source component no longer exists. Linking cancelled.', 'warning');
                    resetLinkingState();
                    return;
                }

                if (component.id === sourceComponent.id) {
                    showUserFeedback('Cannot link a component to itself. Select a different component.', 'warning');
                    return;
                }

                // Check if link already exists
                const existingLinks = props.wardleyMap.links || [];
                if (linkExists(sourceComponent, component, existingLinks)) {
                    showUserFeedback(`Link between "${sourceComponent.name}" and "${component.name}" already exists.`, 'warning');
                    return;
                }

                try {
                    // Add link to map text
                    const updatedMapText = addLinkToMapText(props.mapText, sourceComponent, component);
                    props.mutateMapText(updatedMapText);
                    showUserFeedback(`Link created: "${sourceComponent.name}" → "${component.name}"`, 'success');

                    // Reset linking state
                    resetLinkingState();
                } catch (error) {
                    console.error('Failed to create link:', error);
                    showUserFeedback('Failed to create link. Please try again.', 'error');
                    // Reset linking state on error
                    resetLinkingState();
                }
            }
        },
        [
            linkingState,
            sourceComponent,
            props.wardleyMap.links,
            props.wardleyMap.components,
            props.wardleyMap.anchors,
            props.mapText,
            props.mutateMapText,
            showUserFeedback,
        ],
    );

    // Handle mouse move for drag preview and linking with comprehensive validation
    const handleMouseMove = useCallback(
        (position: {x: number; y: number; nearestComponent?: UnifiedComponent | null}) => {
            try {
                // Validate input position
                if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
                    console.warn('Invalid position received in handleMouseMove:', position);
                    setIsValidDropZone(false);
                    return;
                }

                // Check for NaN values
                if (isNaN(position.x) || isNaN(position.y)) {
                    console.warn('NaN coordinates received in handleMouseMove:', position);
                    setIsValidDropZone(false);
                    return;
                }

                // Update current mouse position for linking preview
                setCurrentMousePosition({x: position.x, y: position.y});

                // Update drawing current position if drawing
                if (isDrawing) {
                    setDrawingCurrentPosition({x: position.x, y: position.y});
                }

                // Using CSS hover effects instead of JavaScript coordinate detection
                setMethodHighlightedComponent(null);

                // Check if source component still exists during linking
                if (linkingState !== 'idle' && sourceComponent) {
                    const allComponents = [...props.wardleyMap.components, ...props.wardleyMap.anchors];
                    const sourceExists = allComponents.some(c => c.id === sourceComponent.id);
                    setIsSourceDeleted(!sourceExists);

                    if (!sourceExists) {
                        // Source component was deleted, show error and prepare for cancellation
                        setHighlightedComponent(null);
                        setIsInvalidTarget(false);
                        setIsDuplicateLink(false);
                        setShowCancellationHint(false);
                        return;
                    }
                } else {
                    setIsSourceDeleted(false);
                }

                // Handle magnetic component highlighting for linking
                if ((linkingState === 'selecting-source' || linkingState === 'selecting-target') && position.nearestComponent) {
                    // Check if the highlighted component still exists
                    const allComponents = [...props.wardleyMap.components, ...props.wardleyMap.anchors];
                    const targetExists = allComponents.some(c => c.id === position.nearestComponent!.id);
                    setIsTargetDeleted(!targetExists);

                    if (targetExists) {
                        setHighlightedComponent(position.nearestComponent);

                        // Check for duplicate links and invalid targets when selecting target
                        if (linkingState === 'selecting-target' && sourceComponent) {
                            const isInvalid = position.nearestComponent.id === sourceComponent.id;
                            const existingLinks = props.wardleyMap.links || [];
                            const isDuplicate = linkExists(sourceComponent, position.nearestComponent, existingLinks);

                            setIsInvalidTarget(isInvalid);
                            setIsDuplicateLink(isDuplicate && !isInvalid);
                        } else {
                            setIsInvalidTarget(false);
                            setIsDuplicateLink(false);
                        }
                    } else {
                        // Target component was deleted
                        setHighlightedComponent(null);
                        setIsInvalidTarget(false);
                        setIsDuplicateLink(false);
                    }
                } else if (linkingState !== 'idle') {
                    // Clear highlighting when no component is near but still in linking mode
                    setHighlightedComponent(null);
                    setIsInvalidTarget(false);
                    setIsDuplicateLink(false);
                    setIsTargetDeleted(false);
                    // Show cancellation hint when in linking mode but no component is highlighted
                    setShowCancellationHint(true);
                } else {
                    setIsTargetDeleted(false);
                }

                // Hide cancellation hint when a component is highlighted or not in linking mode
                if (linkingState === 'idle' || position.nearestComponent) {
                    setShowCancellationHint(false);
                }

                // Validate drop zone (coordinates should be between 0 and 1)
                const isValid = position.x >= 0 && position.x <= 1 && position.y >= 0 && position.y <= 1;

                // Additional validation for edge cases
                const isReasonable = position.x >= -0.1 && position.x <= 1.1 && position.y >= -0.1 && position.y <= 1.1;

                if (!isReasonable) {
                    console.debug('Position outside reasonable bounds:', position);
                    setIsValidDropZone(false);
                    return;
                }

                setIsValidDropZone(isValid);

                // Log for debugging if coordinates are close to boundaries
                if (isValid && (position.x < 0.05 || position.x > 0.95 || position.y < 0.05 || position.y > 0.95)) {
                    console.debug('Position near map boundaries:', position);
                }
            } catch (error) {
                console.error('Error in handleMouseMove:', error);
                setIsValidDropZone(false);
            }
        },
        [linkingState, sourceComponent, props.wardleyMap.components, props.wardleyMap.anchors, isDrawing, selectedToolbarItem],
    );

    // Handle method application to components
    const handleMethodApplication = useCallback(
        (component: UnifiedComponent, methodName: string) => {
            try {
                // Validate inputs
                if (!component || !methodName) {
                    console.error('Invalid method application parameters:', {component, methodName});
                    showUserFeedback('Invalid method application. Please try again.', 'error');
                    return;
                }

                // Validate that the component still exists in the current map
                const allComponents = [...props.wardleyMap.components, ...props.wardleyMap.anchors];
                const componentExists = allComponents.some(c => c.id === component.id);
                if (!componentExists) {
                    showUserFeedback('Component no longer exists. Method application cancelled.', 'warning');
                    setSelectedToolbarItem(null);
                    setMethodHighlightedComponent(null);
                    return;
                }

                // Validate that the component is method-compatible
                if (component.type !== 'component' || component.pipeline) {
                    showUserFeedback(`Cannot apply methods to ${component.type}s. Select a regular component.`, 'warning');
                    return;
                }

                // Parse the current map text to find the component line
                const lines = props.mapText.split('\n');
                let componentLineIndex = -1;
                let componentLine = '';

                // Find the component line by matching the component name
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    // Match component lines with the exact component name
                    const componentMatch = line.match(/^component\s+(.+?)\s*\[/);
                    if (componentMatch && componentMatch[1] === component.name) {
                        componentLineIndex = i;
                        componentLine = line;
                        break;
                    }
                }

                if (componentLineIndex === -1) {
                    console.error('Component line not found in map text:', component.name);
                    showUserFeedback('Could not find component in map text. Please try again.', 'error');
                    return;
                }

                // Parse the existing component line to extract parts
                // Updated regex to capture method and inertia separately
                const componentRegex = /^component\s+(.+?)\s*(\[.+?\])(\s*\([^)]+\))?(\s+inertia)?(.*)$/;
                const match = componentLine.match(componentRegex);

                if (!match) {
                    console.error('Could not parse component line:', componentLine);
                    showUserFeedback('Could not parse component syntax. Please check the map text.', 'error');
                    return;
                }

                const [, name, coordinates, existingMethod, existingInertia, rest] = match;

                let newComponentLine;

                if (methodName === 'component') {
                    // Convert back to regular component - remove method but keep inertia if it exists
                    newComponentLine = `component ${name} ${coordinates}${existingInertia || ''}${rest || ''}`;
                    showUserFeedback(`Converted "${component.name}" back to regular component`, 'success');
                } else if (methodName === 'inertia') {
                    // Add or remove inertia - preserve existing method
                    if (existingInertia) {
                        // Remove inertia
                        newComponentLine = `component ${name} ${coordinates}${existingMethod || ''}${rest || ''}`;
                        showUserFeedback(`Removed inertia from "${component.name}"`, 'success');
                    } else {
                        // Add inertia
                        newComponentLine = `component ${name} ${coordinates}${existingMethod || ''} inertia${rest || ''}`;
                        showUserFeedback(`Added inertia to "${component.name}"`, 'success');
                    }
                } else {
                    // Apply other methods (market, ecosystem, buy, build, outsource) - preserve inertia
                    const newMethod = `(${methodName})`;
                    newComponentLine = `component ${name} ${coordinates} ${newMethod}${existingInertia || ''}${rest || ''}`;
                    const actionText = existingMethod ? 'updated' : 'applied';
                    showUserFeedback(`${methodName} method ${actionText} to "${component.name}"`, 'success');
                }

                // Update the map text
                const updatedLines = [...lines];
                updatedLines[componentLineIndex] = newComponentLine;
                const updatedMapText = updatedLines.join('\n');

                // Apply the changes
                props.mutateMapText(updatedMapText);

                // Clear the toolbar selection and highlighting
                setSelectedToolbarItem(null);
                setMethodHighlightedComponent(null);
            } catch (error) {
                console.error('Method application failed:', error);
                showUserFeedback('Failed to apply method. Please try again.', 'error');
                // Clear state on error
                setSelectedToolbarItem(null);
                setMethodHighlightedComponent(null);
            }
        },
        [props.wardleyMap.components, props.wardleyMap.anchors, props.mapText, props.mutateMapText, showUserFeedback],
    );

    // Handle mouse down for PST box drawing
    const handleMouseDown = useCallback(
        (position: {x: number; y: number}) => {
            // Only start drawing if PST tool is selected and has a sub-item
            if (selectedToolbarItem?.toolType === 'drawing' && selectedToolbarItem.selectedSubItem) {
                setIsDrawing(true);
                setDrawingStartPosition({x: position.x, y: position.y});
                setDrawingCurrentPosition({x: position.x, y: position.y});
            }
        },
        [selectedToolbarItem],
    );

    // Handle mouse up for PST box drawing completion
    const handleMouseUp = useCallback(
        (position: {x: number; y: number}) => {
            if (isDrawing && drawingStartPosition && selectedToolbarItem?.selectedSubItem) {
                // Validate input coordinates
                if (
                    !position ||
                    typeof position.x !== 'number' ||
                    typeof position.y !== 'number' ||
                    isNaN(position.x) ||
                    isNaN(position.y)
                ) {
                    console.error('Invalid position coordinates for PST box:', position);
                    showUserFeedback('Invalid position. Please try drawing the PST box again.', 'error');
                    setIsDrawing(false);
                    setDrawingStartPosition(null);
                    return;
                }

                // Convert map coordinates to correct coordinates accounting for viewBox offset
                // This applies the same transformation as DrawingPreview to ensure consistency
                const convertMapCoordinates = (mapCoord: {x: number; y: number}) => {
                    // The coordinates from UnifiedMapCanvas have been incorrectly transformed due to viewBox offset
                    // We need to reverse this transformation to get the correct map coordinates

                    // Step 1: Convert map coordinates (0-1) back to adjusted coordinates
                    const adjustedX = mapCoord.x * props.mapDimensions.width;
                    const adjustedY = (1 - mapCoord.y) * props.mapDimensions.height;

                    // Step 2: Remove the incorrect viewBox offset that was added in UnifiedMapCanvas
                    const correctedAdjustedX = adjustedX - 35;
                    const correctedAdjustedY = adjustedY - 45;

                    // Step 3: Convert back to correct map coordinates (0-1)
                    const correctedMaturity = correctedAdjustedX / props.mapDimensions.width;
                    const correctedVisibility = 1 - correctedAdjustedY / props.mapDimensions.height;

                    // Clamp to valid range [0, 1]
                    return {
                        x: Math.max(0, Math.min(1, correctedMaturity)),
                        y: Math.max(0, Math.min(1, correctedVisibility)),
                    };
                };

                // Apply coordinate correction to both start and current positions
                const correctedStart = convertMapCoordinates(drawingStartPosition);
                const correctedCurrent = convertMapCoordinates(drawingCurrentPosition);

                // Calculate rectangle dimensions with proper coordinate ordering
                const minX = Math.min(correctedStart.x, correctedCurrent.x);
                const minY = Math.min(correctedStart.y, correctedCurrent.y);
                const maxX = Math.max(correctedStart.x, correctedCurrent.x);
                const maxY = Math.max(correctedStart.y, correctedCurrent.y);

                // For PST boxes, we need to order by visibility (Y-axis) with highest visibility first
                // Since higher Y values = lower visibility in map coordinates, we need maxY first
                const highVisibility = maxY; // Higher Y value = lower on screen = higher visibility
                const lowVisibility = minY; // Lower Y value = higher on screen = lower visibility

                // Validate boundary constraints - ensure coordinates are within valid map bounds (0-1)
                if (minX < 0 || minY < 0 || maxX > 1 || maxY > 1) {
                    console.warn('PST box coordinates outside map boundaries:', {minX, minY, maxX, maxY});
                    showUserFeedback('PST box extends outside map boundaries. Please draw within the map area.', 'warning');
                    setIsDrawing(false);
                    setDrawingStartPosition(null);
                    return;
                }

                // Additional boundary validation - ensure reasonable coordinate ranges
                if (minX < -0.1 || minY < -0.1 || maxX > 1.1 || maxY > 1.1) {
                    console.warn('PST box coordinates outside reasonable bounds:', {minX, minY, maxX, maxY});
                    showUserFeedback('PST box position is invalid. Please draw within the visible map area.', 'warning');
                    setIsDrawing(false);
                    setDrawingStartPosition(null);
                    return;
                }

                // Check minimum size validation (at least 0.05 in map coordinates, roughly 50px)
                const minSize = 0.05;
                const width = maxX - minX;
                const height = maxY - minY;

                if (width < minSize || height < minSize) {
                    console.debug('PST box too small:', {width, height, minSize});
                    showUserFeedback(
                        `PST box too small (${Math.round(width * 100)}% × ${Math.round(height * 100)}%). Draw a larger rectangle.`,
                        'warning',
                    );
                    setIsDrawing(false);
                    setDrawingStartPosition(null);
                    return;
                }

                // Validate maximum size to prevent overly large boxes
                const maxSize = 0.8; // Maximum 80% of map width/height
                if (width > maxSize || height > maxSize) {
                    console.debug('PST box too large:', {width, height, maxSize});
                    showUserFeedback(
                        `PST box too large (${Math.round(width * 100)}% × ${Math.round(height * 100)}%). Draw a smaller rectangle.`,
                        'warning',
                    );
                    setIsDrawing(false);
                    setDrawingStartPosition(null);
                    return;
                }

                try {
                    // Generate PST box text using the template with proper coordinate ordering
                    // PST syntax requires: [visibility_high, maturity1, visibility_low, maturity2]
                    // Template expects (maturity1, visibility_high, maturity2, visibility_low)
                    const pstText = selectedToolbarItem.selectedSubItem.template(
                        minX.toFixed(2), // maturity1 (left edge)
                        highVisibility.toFixed(2), // visibility_high (higher visibility)
                        maxX.toFixed(2), // maturity2 (right edge)
                        lowVisibility.toFixed(2), // visibility_low (lower visibility)
                    );

                    // Validate generated PST text
                    if (!pstText || typeof pstText !== 'string' || pstText.trim().length === 0) {
                        throw new Error('Generated PST text is empty or invalid');
                    }

                    // Add to map text with proper formatting
                    const currentText = props.mapText || '';
                    const updatedMapText = currentText.trim() + (currentText.trim() ? '\n' : '') + pstText;

                    // Update map text and provide user feedback
                    props.mutateMapText(updatedMapText);

                    const boxSize = `${Math.round(width * 100)}% × ${Math.round(height * 100)}%`;
                    showUserFeedback(`${selectedToolbarItem.selectedSubItem.label} box created successfully! (${boxSize})`, 'success');

                    console.log('PST box created:', {
                        type: selectedToolbarItem.selectedSubItem.label,
                        coordinates: {minX, minY, maxX, maxY, highVisibility, lowVisibility},
                        size: {width, height},
                        text: pstText,
                    });

                    // Clear selection and drawing state
                    setSelectedToolbarItem(null);
                    setIsDrawing(false);
                    setDrawingStartPosition(null);
                } catch (error) {
                    console.error('Failed to create PST box:', error);
                    showUserFeedback('Failed to create PST box. Please try again.', 'error');
                    setIsDrawing(false);
                    setDrawingStartPosition(null);
                }
            }
        },
        [
            isDrawing,
            drawingStartPosition,
            drawingCurrentPosition,
            selectedToolbarItem,
            props.mapText,
            props.mutateMapText,
            showUserFeedback,
        ],
    );

    // Handle map canvas click for zoom functionality
    const handleMapCanvasClick = useCallback((pos: {x: number; y: number}) => {
        // This handler is used for zoom functionality when enableZoomOnClick is true
        // Currently no specific zoom behavior is implemented
        console.log('Map canvas clicked at:', pos);
    }, []);

    // Handle clicks outside the map to deselect toolbar items and cancel linking
    const handleContainerClick = useCallback(
        (event: React.MouseEvent) => {
            // Only deselect if clicking on the container itself, not child elements
            if (event.target === event.currentTarget) {
                if (selectedToolbarItem) {
                    setSelectedToolbarItem(null);
                    setIsValidDropZone(false);
                }

                // Cancel linking if in progress
                if (linkingState !== 'idle') {
                    // Use the same reset function as in handleComponentClick
                    setLinkingState('idle');
                    setSourceComponent(null);
                    setHighlightedComponent(null);
                    setShowCancellationHint(false);
                    setIsDuplicateLink(false);
                    setIsInvalidTarget(false);
                    setIsSourceDeleted(false);
                    setIsTargetDeleted(false);
                    showUserFeedback('Linking cancelled', 'info');
                }
            }
        },
        [selectedToolbarItem, linkingState, showUserFeedback],
    );

    return (
        <EditingProvider>
            <div ref={legacyRef} className={props.mapStyleDefs.className} style={containerStyle} onClick={handleContainerClick}>
                {/* WYSIWYG Toolbar - positioned outside map container to maintain fixed position during zoom/pan */}
                <WysiwygToolbar
                    mapStyleDefs={props.mapStyleDefs}
                    mapDimensions={props.mapDimensions}
                    mapText={props.mapText}
                    mutateMapText={props.mutateMapText}
                    selectedItem={selectedToolbarItem}
                    onItemSelect={handleToolbarItemSelect}
                    keyboardShortcutsEnabled={true}
                />

                {/* Drag Preview */}
                <DragPreview
                    selectedItem={selectedToolbarItem}
                    mousePosition={{x: 0, y: 0}} // Not used anymore, DragPreview tracks mouse globally
                    isValidDropZone={isValidDropZone}
                    mapStyleDefs={props.mapStyleDefs}
                />

                {/* User Feedback Notification */}
                {userFeedback.visible && (
                    <div
                        style={{
                            position: 'fixed',
                            top: '16px',
                            right: '16px',
                            zIndex: 10001,
                            maxWidth: '280px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            border: '1px solid',
                            fontSize: '12px',
                            fontWeight: '400',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            animation: 'slideInFromRight 0.2s ease-out',
                            backgroundColor:
                                userFeedback.type === 'success'
                                    ? '#d4edda'
                                    : userFeedback.type === 'error'
                                      ? '#f8d7da'
                                      : userFeedback.type === 'warning'
                                        ? '#fff3cd'
                                        : '#d1ecf1',
                            borderColor:
                                userFeedback.type === 'success'
                                    ? '#c3e6cb'
                                    : userFeedback.type === 'error'
                                      ? '#f5c6cb'
                                      : userFeedback.type === 'warning'
                                        ? '#ffeaa7'
                                        : '#bee5eb',
                            color:
                                userFeedback.type === 'success'
                                    ? '#155724'
                                    : userFeedback.type === 'error'
                                      ? '#721c24'
                                      : userFeedback.type === 'warning'
                                        ? '#856404'
                                        : '#0c5460',
                        }}
                        role="alert"
                        aria-live="polite">
                        <span
                            style={{
                                fontSize: '16px',
                                marginRight: '4px',
                            }}>
                            {userFeedback.type === 'success'
                                ? '✅'
                                : userFeedback.type === 'error'
                                  ? '❌'
                                  : userFeedback.type === 'warning'
                                    ? '⚠️'
                                    : 'ℹ️'}
                        </span>
                        <span>{userFeedback.message}</span>
                        <button
                            onClick={() => setUserFeedback(prev => ({...prev, visible: false}))}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '18px',
                                cursor: 'pointer',
                                marginLeft: 'auto',
                                padding: '0 4px',
                                color: 'inherit',
                                opacity: 0.7,
                            }}
                            aria-label="Close notification">
                            ×
                        </button>
                    </div>
                )}

                <div id="map" style={mapStyle}>
                    <UnifiedMapCanvas
                        wardleyMap={props.wardleyMap}
                        mapDimensions={props.mapDimensions}
                        mapCanvasDimensions={props.mapCanvasDimensions}
                        mapStyleDefs={props.mapStyleDefs}
                        mapEvolutionStates={props.mapEvolutionStates}
                        evolutionOffsets={props.evolutionOffsets}
                        mapText={props.mapText}
                        mutateMapText={props.mutateMapText}
                        setHighlightLine={props.setHighlightLine}
                        setNewComponentContext={props.setNewComponentContext}
                        launchUrl={props.launchUrl}
                        showLinkedEvolved={props.showLinkedEvolved}
                        shouldHideNav={props.shouldHideNav}
                        hideNav={props.hideNav}
                        mapAnnotationsPresentation={props.mapAnnotationsPresentation}
                        handleMapCanvasClick={handleMapCanvasClick}
                        selectedToolbarItem={selectedToolbarItem}
                        onToolbarItemDrop={handleToolbarItemDrop}
                        onMouseMove={handleMouseMove}
                        onComponentClick={handleComponentClick}
                        linkingState={linkingState}
                        sourceComponent={sourceComponent}
                        highlightedComponent={highlightedComponent}
                        isDuplicateLink={isDuplicateLink}
                        isInvalidTarget={isInvalidTarget}
                        showCancellationHint={showCancellationHint}
                        isSourceDeleted={isSourceDeleted}
                        isTargetDeleted={isTargetDeleted}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        isDrawing={isDrawing}
                        drawingStartPosition={drawingStartPosition}
                        drawingCurrentPosition={drawingCurrentPosition}
                        onMethodApplication={handleMethodApplication}
                        methodHighlightedComponent={methodHighlightedComponent}
                    />
                </div>

                {/* CSS Animation for notification */}
                <style>{`
                @keyframes slideInFromRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
            </div>
        </EditingProvider>
    );
};
