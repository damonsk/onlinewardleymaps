import { useCallback } from 'react';
import { ToolbarItem } from '../../../../types/toolbar';
import { ActionType } from '../../../../types/undo-redo';
import { UnifiedWardleyMap } from '../../../../types/unified/map';
import { placeComponent } from '../../../../utils/mapTextGeneration';
import { validatePositionWithPipelineDetection } from '../../../../utils/pipelineDetection';
import { validatePosition, validateRectangle } from '../../utils/validation';

interface DrawingToolbarDependencies {
    props: {
        wardleyMap: UnifiedWardleyMap;
        mapText: string;
        mutateMapText: (newText: string, actionType?: ActionType, description?: string, groupId?: string) => void;
    };
    toolbarState: {
        selectedToolbarItem: ToolbarItem | null;
        setSelectedToolbarItem: (item: ToolbarItem | null) => void;
        setIsValidDropZone: (isValid: boolean) => void;
    };
    drawingState: {
        isDrawing: boolean;
        drawingStartPosition: {x: number; y: number} | null;
        setCurrentMousePosition: (position: {x: number; y: number}) => void;
        setDrawingCurrentPosition: (position: {x: number; y: number}) => void;
        startDrawing: (position: {x: number; y: number}) => void;
        stopDrawing: () => void;
    };
    pipelineHandlers: {
        handlePipelineComponentInsertion: (pipelineBounds: any, position: {x: number; y: number}) => void;
        clearPipelineHighlight: () => void;
    };
    showUserFeedback: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export interface DrawingToolbarHandlers {
    handleMouseDown: (position: {x: number; y: number}) => void;
    handleMouseUp: (position: {x: number; y: number}) => void;
    handleToolbarItemDrop: (item: ToolbarItem, position: {x: number; y: number}) => void;
}

export const useDrawingToolbarHandlers = (deps: DrawingToolbarDependencies): DrawingToolbarHandlers => {
    const handleMouseDown = useCallback(
        (position: {x: number; y: number}) => {
            const isDrawingTool =
                deps.toolbarState.selectedToolbarItem?.toolType === 'drawing' && deps.toolbarState.selectedToolbarItem.selectedSubItem;

            if (isDrawingTool) {
                deps.drawingState.startDrawing(position);
            }
        },
        [deps.toolbarState.selectedToolbarItem, deps.drawingState],
    );

    const handleMouseUp = useCallback(
        (position: {x: number; y: number}) => {
            const shouldCompletePSTDrawing =
                deps.drawingState.isDrawing &&
                deps.drawingState.drawingStartPosition &&
                deps.toolbarState.selectedToolbarItem?.selectedSubItem;

            if (shouldCompletePSTDrawing) {
                handleCompletePSTDrawing(position);
            }
        },
        [deps.drawingState.isDrawing, deps.drawingState.drawingStartPosition, deps.toolbarState.selectedToolbarItem],
    );

    const handleCompletePSTDrawing = useCallback(
        (position: {x: number; y: number}) => {
            if (!deps.drawingState.drawingStartPosition || !deps.toolbarState.selectedToolbarItem?.selectedSubItem) {
                return;
            }

            const validation = validateRectangle(deps.drawingState.drawingStartPosition, position);
            if (!validation.isValid) {
                deps.showUserFeedback(validation.errors[0], 'warning');
                deps.drawingState.stopDrawing();
                return;
            }

            try {
                const rectangle = calculateRectangle(deps.drawingState.drawingStartPosition, position);
                const pstText = deps.toolbarState.selectedToolbarItem.selectedSubItem.template(
                    rectangle.minX.toFixed(2),
                    rectangle.maxY.toFixed(2),
                    rectangle.maxX.toFixed(2),
                    rectangle.minY.toFixed(2),
                );

                const updatedMapText = deps.props.mapText.trim() + (deps.props.mapText.trim() ? '\n' : '') + pstText;
                deps.props.mutateMapText(updatedMapText, 'toolbar-pst', 'Added PST box');

                const boxSize = `${Math.round(rectangle.width * 100)}% × ${Math.round(rectangle.height * 100)}%`;
                deps.showUserFeedback(
                    `${deps.toolbarState.selectedToolbarItem.selectedSubItem.label} box created successfully! (${boxSize})`,
                    'success',
                );

                cleanupAfterDrawing();
            } catch (error) {
                handleDrawingError(error);
            }
        },
        [deps],
    );

    const handleToolbarItemDrop = useCallback(
        (item: ToolbarItem, position: {x: number; y: number}) => {
            if (item.id === 'component') {
                handleComponentDrop(item, position);
            } else {
                handleStandardItemDrop(item, position);
            }
        },
        [deps],
    );

    const handleComponentDrop = useCallback(
        (item: ToolbarItem, position: {x: number; y: number}) => {
            const validation = validatePositionWithPipelineDetection(position, deps.props.wardleyMap, {
                tolerance: 0.1,
                enablePipelineSnapping: true,
            });

            if (!validation.isValid) {
                deps.showUserFeedback(validation.errors[0], 'error');
                return;
            }

            if (validation.shouldSnapToPipeline && validation.nearbyPipeline) {
                deps.pipelineHandlers.handlePipelineComponentInsertion(validation.nearbyPipeline, position);
                return;
            }

            handleStandardItemDrop(item, position);
        },
        [deps],
    );

    const handleStandardItemDrop = useCallback(
        (item: ToolbarItem, position: {x: number; y: number}) => {
            const validation = validatePosition(position);
            if (!validation.isValid) {
                deps.showUserFeedback(validation.errors[0], 'error');
                return;
            }

            try {
                const placementParams = {
                    item,
                    position,
                    existingComponents: deps.props.wardleyMap.components.concat(deps.props.wardleyMap.anchors) || [],
                    currentMapText: deps.props.mapText,
                };

                const result = placeComponent(placementParams, {
                    normalizeLineEndings: true,
                    preserveWhitespace: false,
                });

                const actionDescription = item.id === 'pipeline' ? 'Added pipeline' : `Added component "${result.componentName}"`;
                deps.props.mutateMapText(result.updatedMapText, 'toolbar-component', actionDescription);

                const successMessage =
                    item.id === 'pipeline'
                        ? `Pipeline "${result.componentName}" created with default components!`
                        : `Component "${result.componentName}" added successfully!`;

                deps.showUserFeedback(successMessage, 'success');
                cleanupAfterPlacement();
            } catch (error) {
                handlePlacementError(error);
            }
        },
        [deps],
    );

    // Helper functions
    const calculateRectangle = useCallback((start: {x: number; y: number}, end: {x: number; y: number}) => {
        const minX = Math.min(start.x, end.x);
        const minY = Math.min(start.y, end.y);
        const maxX = Math.max(start.x, end.x);
        const maxY = Math.max(start.y, end.y);
        const width = maxX - minX;
        const height = maxY - minY;

        return {minX, minY, maxX, maxY, width, height};
    }, []);

    const cleanupAfterDrawing = useCallback(() => {
        deps.toolbarState.setSelectedToolbarItem(null);
        deps.drawingState.stopDrawing();
    }, [deps]);

    const cleanupAfterPlacement = useCallback(() => {
        deps.toolbarState.setSelectedToolbarItem(null);
        deps.toolbarState.setIsValidDropZone(false);
        deps.pipelineHandlers.clearPipelineHighlight();
    }, [deps]);

    const handleDrawingError = useCallback(
        (error: unknown) => {
            console.error('Failed to create PST box:', error);
            deps.showUserFeedback('Failed to create PST box. Please try again.', 'error');
            deps.drawingState.stopDrawing();
        },
        [deps],
    );

    const handlePlacementError = useCallback(
        (error: unknown) => {
            console.error('Component placement failed:', error);
            deps.showUserFeedback('Failed to add component. Please try again.', 'error');
            cleanupAfterPlacement();
        },
        [deps, cleanupAfterPlacement],
    );

    return {
        handleMouseDown,
        handleMouseUp,
        handleToolbarItemDrop,
    };
};
