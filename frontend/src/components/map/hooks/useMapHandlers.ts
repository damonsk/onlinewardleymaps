import {useCallback} from 'react';
import {ToolbarItem} from '../../../types/toolbar';
import {UnifiedComponent} from '../../../types/unified/components';
import {addLinkToMapText, generateLinkSyntax, linkExists} from '../../../utils/componentDetection';
import {placeComponent} from '../../../utils/mapTextGeneration';
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
}

export interface MapHandlers {
    handleContainerClick: (event: React.MouseEvent) => void;
    handleComponentClick: (component: UnifiedComponent | null, position?: {x: number; y: number}) => void;
    handleMouseMove: (position: {x: number; y: number; nearestComponent?: UnifiedComponent | null}) => void;
    handleMouseDown: (position: {x: number; y: number}) => void;
    handleMouseUp: (position: {x: number; y: number}) => void;
    handleMapCanvasClick: (pos: {x: number; y: number}) => void;
    handleToolbarItemDrop: (item: ToolbarItem, position: {x: number; y: number}) => void;
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
}: UseMapHandlersProps): MapHandlers => {
    const handleContainerClick = useCallback(
        (event: React.MouseEvent) => {
            if (event.target === event.currentTarget) {
                if (toolbarState.selectedToolbarItem) {
                    toolbarState.setSelectedToolbarItem(null);
                    toolbarState.setIsValidDropZone(false);
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
                return;
            }

            drawingState.setCurrentMousePosition(position);

            if (drawingState.isDrawing) {
                drawingState.setDrawingCurrentPosition(position);
            }

            toolbarState.setIsValidDropZone(validation.isValid);

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
            const validation = validatePosition(position);
            if (!validation.isValid) {
                showUserFeedback(validation.errors[0], 'error');
                return;
            }

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

                props.mutateMapText(result.updatedMapText, 'toolbar-component', `Added component \"${result.componentName}\"`);
                showUserFeedback(`Component \"${result.componentName}\" added successfully!`, 'success');

                toolbarState.setSelectedToolbarItem(null);
                toolbarState.setIsValidDropZone(false);
            } catch (error) {
                console.error('Component placement failed:', error);
                showUserFeedback('Failed to add component. Please try again.', 'error');
                toolbarState.setSelectedToolbarItem(null);
                toolbarState.setIsValidDropZone(false);
            }
        },
        [props, toolbarState, showUserFeedback],
    );

    return {
        handleContainerClick,
        handleComponentClick,
        handleMouseMove,
        handleMouseDown,
        handleMouseUp,
        handleMapCanvasClick,
        handleToolbarItemDrop,
    };
};
