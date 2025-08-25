import {useCallback} from 'react';
import {ToolbarItem} from '../../../types/toolbar';
import {UnifiedComponent} from '../../../types/unified/components';
import {ModernMapViewRefactoredProps} from '../MapView';
import {ComponentOperations} from './useComponentOperations';
import {DrawingActions, DrawingState} from './useDrawingState';
import {LinkingActions, LinkingState} from './useLinkingState';
import {useSelectionManager} from './useSelectionManager';
import {ToolbarActions, ToolbarState} from './useToolbarState';

// Import focused handlers
import {useClickHandlers} from './handlers/useClickHandlers';
import {useComponentInteractionHandlers} from './handlers/useComponentInteractionHandlers';
import {useComponentLinkingOperations} from './handlers/useComponentLinkingOperations';
import {useDrawingToolbarHandlers} from './handlers/useDrawingToolbarHandlers';
import {useLinkHandlers} from './handlers/useLinkHandlers';
import {useMouseMovementHandlers} from './handlers/useMouseMovementHandlers';
import {usePipelineHandlers} from './handlers/usePipelineHandlers';

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
    // Initialize focused handlers
    const pipelineHandlers = usePipelineHandlers({
        props,
        toolbarState,
        showUserFeedback,
    });

    const componentLinkingOps = useComponentLinkingOperations({
        props,
        linkingState,
        toolbarState,
        showUserFeedback,
    });

    const clickHandlers = useClickHandlers({
        toolbarState,
        linkingState,
        selectionManager,
        showUserFeedback,
        clearSelection,
        onPipelineHighlightClear: pipelineHandlers.clearPipelineHighlight,
    });

    const componentInteractionHandlers = useComponentInteractionHandlers({
        linkingState,
        selectionManager,
        wardleyMap: props.wardleyMap,
        componentLinkingOps,
        showUserFeedback,
    });

    const linkHandlers = useLinkHandlers({
        selectionManager,
        clearSelection,
        contextMenuActions,
    });

    const mouseMovementHandlers = useMouseMovementHandlers({
        toolbarState,
        drawingState,
        linkingState,
        wardleyMap: props.wardleyMap,
    });

    const drawingToolbarHandlers = useDrawingToolbarHandlers({
        props,
        toolbarState,
        drawingState,
        pipelineHandlers,
        showUserFeedback,
    });

    // Enhanced canvas context menu handler
    const handleCanvasContextMenu = useCallback(
        (event: React.MouseEvent) => {
            clickHandlers.handleCanvasContextMenu(event);

            if (contextMenuActions.showCanvasContextMenu) {
                contextMenuActions.showCanvasContextMenu({x: event.clientX, y: event.clientY});
            } else {
                console.warn('Canvas context menu not available - contextMenuActions.showCanvasContextMenu is not set');
            }
        },
        [clickHandlers, contextMenuActions],
    );

    return {
        // Click handling
        handleContainerClick: clickHandlers.handleContainerClick,
        handleComponentClick: componentInteractionHandlers.handleComponentClick,
        handleMapCanvasClick: clickHandlers.handleMapCanvasClick,
        handleCanvasContextMenu,

        // Mouse interactions
        handleMouseMove: mouseMovementHandlers.handleMouseMove,
        handleMouseDown: drawingToolbarHandlers.handleMouseDown,
        handleMouseUp: drawingToolbarHandlers.handleMouseUp,

        // Toolbar and drawing
        handleToolbarItemDrop: drawingToolbarHandlers.handleToolbarItemDrop,

        // Link handling
        handleLinkClick: linkHandlers.handleLinkClick,
        handleLinkContextMenu: linkHandlers.handleLinkContextMenu,

        // Pipeline handling
        highlightedPipelineId: pipelineHandlers.highlightedPipelineId,
        handlePipelineMouseEnter: pipelineHandlers.handlePipelineMouseEnter,
        handlePipelineMouseLeave: pipelineHandlers.handlePipelineMouseLeave,
    };
};
