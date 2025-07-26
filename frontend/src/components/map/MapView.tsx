import React, {LegacyRef, useCallback, useEffect, useState} from 'react';
import ReactDOMServer from 'react-dom/server';
import {EvolutionStages, MapCanvasDimensions, MapDimensions, Offsets} from '../../constants/defaults';

import {MapAnnotationsPosition} from '../../types/base';
import {MapTheme} from '../../types/map/styles';
import {ToolbarItem} from '../../types/toolbar';
import {UnifiedWardleyMap} from '../../types/unified/map';
import {UnifiedComponent} from '../../types/unified/components';
import {placeComponent, validateComponentPlacement} from '../../utils/mapTextGeneration';
import {
    synchronizeToolbarQuickAddState,
    validateMapInteractionCompatibility,
    ensureToolbarComponentEditingCompatibility,
    getCompatibleCursorStyle,
} from '../../utils/toolbarCompatibility';
import {findNearestComponent, linkExists, addLinkToMapText} from '../../utils/componentDetection';
import {useFeatureSwitches} from '../FeatureSwitchesContext';
import CanvasSpeedDial from './CanvasSpeedDial';
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
    const [quickAddTemplate, setQuickAddTemplate] = useState(() => () => console.log('nullTemplate'));
    const [quickAddInProgress, setQuickAddInProgress] = useState(false);

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

    const setQuickAdd = (quickAdd: any) => {
        // Use compatibility utility to synchronize state BEFORE changing QuickAdd state
        const {shouldClearToolbar} = synchronizeToolbarQuickAddState(
            selectedToolbarItem,
            quickAddInProgress, // Current QuickAdd state
            setQuickAddInProgress,
            setQuickAddTemplate,
        );

        // Now activate QuickAdd
        setQuickAddInProgress(true);
        svgToBase64Url(ReactDOMServer.renderToString(quickAdd.cursor), 15, 15);
        setQuickAddTemplate(() => () => quickAdd.template);

        // Clear toolbar if needed (this will always be true when toolbar is selected)
        if (selectedToolbarItem) {
            setSelectedToolbarItem(null);
            setIsValidDropZone(false);
            showUserFeedback('Switched to QuickAdd mode', 'info');
        }
    };

    const handleMapCanvasClick = () => {
        if (!featureSwitches.enableQuickAdd) return;
        if (quickAddInProgress) {
            quickAddTemplate();
            setQuickAddInProgress(false);
        }
    };

    // Handle toolbar item selection with enhanced state synchronization
    const handleToolbarItemSelect = useCallback(
        (item: ToolbarItem | null) => {
            console.log('Toolbar item selection changed:', item?.id || 'none');

            setSelectedToolbarItem(item);

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
            } else {
                // Reset linking state when switching to other tools
                setLinkingState('idle');
                setSourceComponent(null);
                setHighlightedComponent(null);
                setIsDuplicateLink(false);
                setIsInvalidTarget(false);
                setShowCancellationHint(false);
            }

            // Use compatibility utility to synchronize state
            const {shouldClearQuickAdd} = synchronizeToolbarQuickAddState(
                item,
                quickAddInProgress,
                setQuickAddInProgress,
                setQuickAddTemplate,
            );

            if (shouldClearQuickAdd) {
                console.log('Clearing QuickAdd state due to toolbar selection');
                showUserFeedback('Switched to toolbar mode', 'info');
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
        [quickAddInProgress, props.setNewComponentContext, showUserFeedback],
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
        (component: UnifiedComponent | null) => {
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

            // Handle cancellation when clicking on empty areas (component is null)
            if (component === null) {
                if (linkingState !== 'idle') {
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
        [linkingState, sourceComponent, props.wardleyMap.components, props.wardleyMap.anchors],
    );

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
        <div ref={legacyRef} className={props.mapStyleDefs.className} style={containerStyle} onClick={handleContainerClick}>
            {featureSwitches.enableQuickAdd && <CanvasSpeedDial setQuickAdd={setQuickAdd} mapStyleDefs={props.mapStyleDefs} />}

            {/* WYSIWYG Toolbar - positioned outside map container to maintain fixed position during zoom/pan */}
            <WysiwygToolbar
                mapStyleDefs={props.mapStyleDefs}
                mapDimensions={props.mapDimensions}
                mapText={props.mapText}
                mutateMapText={props.mutateMapText}
                selectedItem={selectedToolbarItem}
                onItemSelect={handleToolbarItemSelect}
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
    );
};
