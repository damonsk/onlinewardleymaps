import {useCallback, useState} from 'react';
import {ToolbarItem} from '../../../types/toolbar';
import {UnifiedComponent} from '../../../types/unified/components';
import {addLinkToMapText, generateLinkSyntax, linkExists} from '../../../utils/componentDetection';
import {extractAllComponentNames, insertPipelineComponent, placeComponent} from '../../../utils/mapTextGeneration';
import {
    detectNearbyPipeline,
    generateUniquePipelineComponentName,
    validatePositionWithPipelineDetection,
} from '../../../utils/pipelineDetection';
import {ModernMapViewRefactoredProps} from '../MapView';
import {generateUniqueComponentName, validatePosition, validateRectangle} from '../utils/validation';
import {ComponentOperations} from './useComponentOperations';
import {DrawingActions, DrawingState} from './useDrawingState';
import {LinkingActions, LinkingState} from './useLinkingState';
import {useSelectionManager} from './useSelectionManager';
import {ToolbarActions, ToolbarState} from './useToolbarState';

interface UseMapHandlersProps {
    props: ModernMapViewRefactoredProps;
    toolbarState: ToolbarState & ToolbarActions;
    linkingState: LinkingState & LinkingActions;
    drawingState: DrawingState & DrawingActions;
    showUserFeedback: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    clearSelection: () => void;
    componentOps: ComponentOperations;
    selectionManager: ReturnType<typeof useSelectionManager>;
    contextMenuActions: {
        showLinkContextMenu?: (
            position: {x: number; y: number},
            linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number},
        ) => void;
        showCanvasContextMenu?: (position: {x: number; y: number}) => void;
    };
}

export interface MapHandlers {
    handleContainerClick: (event: React.MouseEvent) => void;
    handleComponentClick: (component: UnifiedComponent | null, position?: {x: number; y: number}) => void;
    handleMouseMove: (position: {x: number; y: number; nearestComponent?: UnifiedComponent | null}) => void;
    handleMouseDown: (position: {x: number; y: number}) => void;
    handleMouseUp: (position: {x: number; y: number}) => void;
    handleMapCanvasClick: (pos: {x: number; y: number}) => void;
    handleToolbarItemDrop: (item: ToolbarItem, position: {x: number; y: number}) => void;
    handleLinkClick: (linkInfo: any) => void;
    handleLinkContextMenu: (linkInfo: any, event: React.MouseEvent) => void;
    handleCanvasContextMenu: (event: React.MouseEvent) => void;
    highlightedPipelineId: string | null;
    handlePipelineMouseEnter: (pipelineId: string) => void;
    handlePipelineMouseLeave: () => void;
}

export const useMapHandlers = ({
    props,
    toolbarState,
    linkingState,
    drawingState,
    showUserFeedback,
    clearSelection,
    componentOps,
    selectionManager,
    contextMenuActions,
}: UseMapHandlersProps): MapHandlers => {
    // Pipeline highlighting state for hover detection
    const [highlightedPipelineId, setHighlightedPipelineId] = useState<string | null>(null);
    const handleContainerClick = useCallback(
        (event: React.MouseEvent) => {
            if (event.target === event.currentTarget) {
                if (toolbarState.selectedToolbarItem) {
                    toolbarState.setSelectedToolbarItem(null);
                    toolbarState.setIsValidDropZone(false);
                    setHighlightedPipelineId(null); // Clear pipeline highlighting
                }

                if (linkingState.linkingState !== 'idle') {
                    linkingState.resetLinkingState();
                    showUserFeedback('Linking cancelled', 'info');
                }
            }
        },
        [toolbarState.selectedToolbarItem, linkingState.linkingState, toolbarState, linkingState, showUserFeedback],
    );

    const handleComponentClick = useCallback(
        (component: UnifiedComponent | null, position?: {x: number; y: number}) => {
            if (component === null) {
                if (linkingState.linkingState === 'selecting-target' && position && linkingState.sourceComponent) {
                    handleCreateComponentAndLink(position);
                } else if (linkingState.linkingState !== 'idle') {
                    linkingState.resetLinkingState();
                    showUserFeedback('Linking cancelled', 'info');
                }
                selectionManager.clearSelection();
                return;
            }

            if (linkingState.linkingState === 'selecting-source') {
                linkingState.setSourceComponent(component);
                linkingState.setLinkingState('selecting-target');
                showUserFeedback(`Selected \"${component.name}\" as source. Click another component to create a link.`, 'info');
            } else if (linkingState.linkingState === 'selecting-target') {
                handleCreateLink(component);
            } else if (linkingState.linkingState === 'idle') {
                selectionManager.selectComponent(component);
            }
        },
        [linkingState, showUserFeedback, selectionManager],
    );

    const handleCreateComponentAndLink = useCallback(
        async (position: {x: number; y: number}) => {
            const validation = validatePosition(position);
            if (!validation.isValid) {
                showUserFeedback(validation.errors[0], 'error');
                return;
            }

            try {
                const existingComponents = [...props.wardleyMap.components, ...props.wardleyMap.anchors];
                const existingNames = existingComponents.map(c => c.name);
                const componentName = generateUniqueComponentName('New Component', existingNames);

                const componentText = `component ${componentName} [${position.y.toFixed(2)}, ${position.x.toFixed(2)}]`;

                const newComponent: UnifiedComponent = {
                    id: `temp-${componentName}`,
                    name: componentName,
                    type: 'component',
                    maturity: position.x,
                    visibility: position.y,
                    line: 0,
                    label: {x: 0, y: 0},
                    evolved: false,
                    inertia: false,
                    increaseLabelSpacing: 0,
                    pseudoComponent: false,
                    offsetY: 0,
                    evolving: false,
                    decorators: {
                        buy: false,
                        build: false,
                        outsource: false,
                        ecosystem: false,
                        market: false,
                    },
                };

                const linkText = generateLinkSyntax(linkingState.sourceComponent!, newComponent);
                const updatedMapText = props.mapText + '\r\n' + componentText + '\r\n' + linkText;

                props.mutateMapText(updatedMapText, 'toolbar-component', `Added component \"${componentName}\" with link`);
                showUserFeedback(`Created \"${componentName}\" and linked from \"${linkingState.sourceComponent!.name}\"`, 'success');

                linkingState.resetLinkingState();
                toolbarState.setSelectedToolbarItem(null);
            } catch (error) {
                console.error('Failed to create component and link:', error);
                showUserFeedback('Failed to create component and link. Please try again.', 'error');
                linkingState.resetLinkingState();
                toolbarState.setSelectedToolbarItem(null);
            }
        },
        [props, linkingState, toolbarState, showUserFeedback],
    );

    const handleCreateLink = useCallback(
        (component: UnifiedComponent) => {
            if (!linkingState.sourceComponent) {
                console.error('No source component selected');
                return;
            }

            if (component.id === linkingState.sourceComponent.id) {
                showUserFeedback('Cannot link a component to itself. Select a different component.', 'warning');
                linkingState.resetLinkingState();
                toolbarState.setSelectedToolbarItem(null);
                return;
            }

            const existingLinks = props.wardleyMap.links || [];
            if (linkExists(linkingState.sourceComponent, component, existingLinks)) {
                showUserFeedback(
                    `Link between \"${linkingState.sourceComponent.name}\" and \"${component.name}\" already exists.`,
                    'warning',
                );
                linkingState.resetLinkingState();
                toolbarState.setSelectedToolbarItem(null);
                return;
            }

            try {
                const updatedMapText = addLinkToMapText(props.mapText, linkingState.sourceComponent, component);
                props.mutateMapText(
                    updatedMapText,
                    'toolbar-link',
                    `Added link: \"${linkingState.sourceComponent.name}\" → \"${component.name}\"`,
                );
                showUserFeedback(`Link created: \"${linkingState.sourceComponent.name}\" → \"${component.name}\"`, 'success');
                linkingState.resetLinkingState();
                toolbarState.setSelectedToolbarItem(null);
            } catch (error) {
                console.error('Failed to create link:', error);
                showUserFeedback('Failed to create link. Please try again.', 'error');
                linkingState.resetLinkingState();
                toolbarState.setSelectedToolbarItem(null);
            }
        },
        [linkingState, toolbarState, props, showUserFeedback],
    );

    const handleMouseMove = useCallback(
        (position: {x: number; y: number; nearestComponent?: UnifiedComponent | null}) => {
            const validation = validatePosition(position);
            if (!validation.isValid) {
                toolbarState.setIsValidDropZone(false);
                // Only clear highlighting if not set by direct hover
                if (!highlightedPipelineId) {
                    setHighlightedPipelineId(null);
                }
                return;
            }

            drawingState.setCurrentMousePosition(position);

            if (drawingState.isDrawing) {
                drawingState.setDrawingCurrentPosition(position);
            }

            toolbarState.setIsValidDropZone(validation.isValid);

            // Pipeline highlighting is now handled via direct SVG hover events
            // (onMouseEnter/onMouseLeave on ModernPipelineBoxSymbol)
            // Coordinate-based detection is disabled to prevent excessive re-renders

            // Handle linking state updates
            if (linkingState.linkingState !== 'idle') {
                updateLinkingHighlights(position);
            }
        },
        [toolbarState, drawingState, linkingState],
    );

    const updateLinkingHighlights = useCallback(
        (position: {x: number; y: number; nearestComponent?: UnifiedComponent | null}) => {
            if (position.nearestComponent) {
                linkingState.setHighlightedComponent(position.nearestComponent);

                if (linkingState.linkingState === 'selecting-target' && linkingState.sourceComponent) {
                    const isInvalid = position.nearestComponent.id === linkingState.sourceComponent.id;
                    const existingLinks = props.wardleyMap.links || [];
                    const isDuplicate = linkExists(linkingState.sourceComponent, position.nearestComponent, existingLinks);

                    linkingState.setIsInvalidTarget(isInvalid);
                    linkingState.setIsDuplicateLink(isDuplicate && !isInvalid);
                }
            } else {
                linkingState.setHighlightedComponent(null);
                linkingState.setShowCancellationHint(linkingState.linkingState !== 'idle');
            }
        },
        [linkingState, props.wardleyMap.links],
    );

    const handleMouseDown = useCallback(
        (position: {x: number; y: number}) => {
            if (toolbarState.selectedToolbarItem?.toolType === 'drawing' && toolbarState.selectedToolbarItem.selectedSubItem) {
                drawingState.startDrawing(position);
            }
        },
        [toolbarState.selectedToolbarItem, drawingState],
    );

    const handleMouseUp = useCallback(
        (position: {x: number; y: number}) => {
            if (drawingState.isDrawing && drawingState.drawingStartPosition && toolbarState.selectedToolbarItem?.selectedSubItem) {
                handleCompletePSTDrawing(position);
            }
        },
        [drawingState.isDrawing, drawingState.drawingStartPosition, toolbarState.selectedToolbarItem],
    );

    const handleCompletePSTDrawing = useCallback(
        (position: {x: number; y: number}) => {
            if (!drawingState.drawingStartPosition || !toolbarState.selectedToolbarItem?.selectedSubItem) return;

            const validation = validateRectangle(drawingState.drawingStartPosition, position);
            if (!validation.isValid) {
                showUserFeedback(validation.errors[0], 'warning');
                drawingState.stopDrawing();
                return;
            }

            try {
                const minX = Math.min(drawingState.drawingStartPosition.x, position.x);
                const minY = Math.min(drawingState.drawingStartPosition.y, position.y);
                const maxX = Math.max(drawingState.drawingStartPosition.x, position.x);
                const maxY = Math.max(drawingState.drawingStartPosition.y, position.y);

                const pstText = toolbarState.selectedToolbarItem.selectedSubItem.template(
                    minX.toFixed(2),
                    maxY.toFixed(2),
                    maxX.toFixed(2),
                    minY.toFixed(2),
                );

                const updatedMapText = props.mapText.trim() + (props.mapText.trim() ? '\n' : '') + pstText;
                props.mutateMapText(updatedMapText, 'toolbar-pst', 'Added PST box');

                const width = maxX - minX;
                const height = maxY - minY;
                const boxSize = `${Math.round(width * 100)}% × ${Math.round(height * 100)}%`;
                showUserFeedback(
                    `${toolbarState.selectedToolbarItem.selectedSubItem.label} box created successfully! (${boxSize})`,
                    'success',
                );

                toolbarState.setSelectedToolbarItem(null);
                drawingState.stopDrawing();
            } catch (error) {
                console.error('Failed to create PST box:', error);
                showUserFeedback('Failed to create PST box. Please try again.', 'error');
                drawingState.stopDrawing();
            }
        },
        [drawingState, toolbarState, props, showUserFeedback],
    );

    const handleMapCanvasClick = useCallback(
        (pos: {x: number; y: number}) => {
            // Clear both component selection (ComponentSelectionContext) and link selection (SelectionManager)
            clearSelection(); // Clears component selection
            selectionManager.clearSelection(); // Clears link selection
        },
        [clearSelection, selectionManager],
    );

    const handleToolbarItemDrop = useCallback(
        (item: ToolbarItem, position: {x: number; y: number}) => {
            // Enhanced validation with pipeline detection for component items
            if (item.id === 'component') {
                const validation = validatePositionWithPipelineDetection(position, props.wardleyMap, {
                    tolerance: 0.1,
                    enablePipelineSnapping: true,
                });

                if (!validation.isValid) {
                    showUserFeedback(validation.errors[0], 'error');
                    return;
                }

                // Handle pipeline component insertion
                if (validation.shouldSnapToPipeline && validation.nearbyPipeline) {
                    handlePipelineComponentInsertion(validation.nearbyPipeline, position);
                    return;
                }
            }

            // Default position validation for non-component items or components not near pipelines
            const basicValidation = validatePosition(position);
            if (!basicValidation.isValid) {
                showUserFeedback(basicValidation.errors[0], 'error');
                return;
            }

            // Standard component placement logic
            try {
                const placementParams = {
                    item,
                    position,
                    existingComponents: props.wardleyMap.components.concat(props.wardleyMap.anchors) || [],
                    currentMapText: props.mapText,
                };

                const result = placeComponent(placementParams, {
                    normalizeLineEndings: true,
                    preserveWhitespace: false,
                });

                const actionDescription = item.id === 'pipeline' ? 'Added pipeline' : `Added component \"${result.componentName}\"`;
                props.mutateMapText(result.updatedMapText, 'toolbar-component', actionDescription);

                const successMessage =
                    item.id === 'pipeline'
                        ? `Pipeline \"${result.componentName}\" created with default components!`
                        : `Component \"${result.componentName}\" added successfully!`;
                showUserFeedback(successMessage, 'success');

                toolbarState.setSelectedToolbarItem(null);
                toolbarState.setIsValidDropZone(false);
                setHighlightedPipelineId(null); // Clear pipeline highlighting after placement
            } catch (error) {
                console.error('Component placement failed:', error);
                showUserFeedback('Failed to add component. Please try again.', 'error');
                toolbarState.setSelectedToolbarItem(null);
                toolbarState.setIsValidDropZone(false);
                setHighlightedPipelineId(null); // Clear pipeline highlighting on error
            }
        },
        [props, toolbarState, showUserFeedback],
    );

    const handlePipelineComponentInsertion = useCallback(
        (pipelineBounds: any, position: {x: number; y: number}) => {
            try {
                // Get all existing component names from map text to generate unique name
                const existingNames = extractAllComponentNames(props.mapText);

                // Generate unique component name
                const componentName = generateUniquePipelineComponentName('New Component', existingNames);

                // Insert component into pipeline
                const updatedMapText = insertPipelineComponent(
                    props.mapText,
                    pipelineBounds.name,
                    componentName,
                    position.x, // Use maturity (x) position
                );

                props.mutateMapText(
                    updatedMapText,
                    'toolbar-component',
                    `Added component "${componentName}" to pipeline "${pipelineBounds.name}"`,
                );

                showUserFeedback(`Component "${componentName}" added to pipeline "${pipelineBounds.name}"!`, 'success');

                toolbarState.setSelectedToolbarItem(null);
                toolbarState.setIsValidDropZone(false);
                setHighlightedPipelineId(null); // Clear pipeline highlighting after successful insertion
            } catch (error) {
                console.error('Pipeline component insertion failed:', error);
                showUserFeedback(`Failed to add component to pipeline "${pipelineBounds.name}". Please try again.`, 'error');
                toolbarState.setSelectedToolbarItem(null);
                toolbarState.setIsValidDropZone(false);
                setHighlightedPipelineId(null); // Clear pipeline highlighting on error
            }
        },
        [props, toolbarState, showUserFeedback],
    );

    const handleLinkClick = useCallback(
        (linkInfo: any) => {
            // Clear component selection when selecting a link
            clearSelection();
            selectionManager.selectLink(linkInfo);
        },
        [clearSelection, selectionManager],
    );

    const handleLinkContextMenu = useCallback(
        (linkInfo: any, event: React.MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            // Clear component selection when selecting a link via context menu
            clearSelection();
            selectionManager.selectLink(linkInfo);
            // Show context menu for the link using the callback
            if (contextMenuActions.showLinkContextMenu) {
                contextMenuActions.showLinkContextMenu({x: event.clientX, y: event.clientY}, linkInfo);
            } else {
                console.warn('Link context menu not available - contextMenuActions.showLinkContextMenu is not set');
            }
        },
        [clearSelection, selectionManager, contextMenuActions],
    );

    const handleCanvasContextMenu = useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();

            // Clear all selections when right-clicking on canvas
            clearSelection();
            selectionManager.clearSelection();

            // Show canvas context menu
            if (contextMenuActions.showCanvasContextMenu) {
                contextMenuActions.showCanvasContextMenu({x: event.clientX, y: event.clientY});
            } else {
                console.warn('Canvas context menu not available - contextMenuActions.showCanvasContextMenu is not set');
            }
        },
        [clearSelection, selectionManager, contextMenuActions],
    );

    const handlePipelineMouseEnter = useCallback((pipelineId: string) => {
        setHighlightedPipelineId(pipelineId);
    }, []);

    const handlePipelineMouseLeave = useCallback(() => {
        setHighlightedPipelineId(null);
    }, []);

    return {
        handleContainerClick,
        handleComponentClick,
        handleMouseMove,
        handleMouseDown,
        handleMouseUp,
        handleMapCanvasClick,
        handleToolbarItemDrop,
        handleLinkClick,
        handleLinkContextMenu,
        handleCanvasContextMenu,
        highlightedPipelineId,
        handlePipelineMouseEnter,
        handlePipelineMouseLeave,
    };
};
