import { useCallback } from 'react';
import { ToolbarItem } from '../../../../types/toolbar';

interface ClickHandlerDependencies {
    toolbarState: {
        selectedToolbarItem: ToolbarItem | null;
        setSelectedToolbarItem: (item: ToolbarItem | null) => void;
        setIsValidDropZone: (isValid: boolean) => void;
    };
    linkingState: {
        linkingState: 'idle' | 'selecting-source' | 'selecting-target';
        resetLinkingState: () => void;
    };
    selectionManager: {
        clearSelection: () => void;
    };
    showUserFeedback: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    clearSelection: () => void;
    onPipelineHighlightClear: () => void;
}

export interface ClickHandlers {
    handleContainerClick: (event: React.MouseEvent) => void;
    handleMapCanvasClick: (pos: {x: number; y: number}) => void;
    handleCanvasContextMenu: (event: React.MouseEvent) => void;
}

export const useClickHandlers = (deps: ClickHandlerDependencies): ClickHandlers => {
    const handleContainerClick = useCallback(
        (event: React.MouseEvent) => {
            if (event.target !== event.currentTarget) return;

            if (deps.toolbarState.selectedToolbarItem) {
                deps.toolbarState.setSelectedToolbarItem(null);
                deps.toolbarState.setIsValidDropZone(false);
                deps.onPipelineHighlightClear();
            }

            if (deps.linkingState.linkingState !== 'idle') {
                deps.linkingState.resetLinkingState();
                deps.showUserFeedback('Linking cancelled', 'info');
            }
        },
        [
            deps.toolbarState.selectedToolbarItem,
            deps.linkingState.linkingState,
            deps.toolbarState,
            deps.linkingState,
            deps.showUserFeedback,
            deps.onPipelineHighlightClear,
        ],
    );

    const handleMapCanvasClick = useCallback(
        (pos: {x: number; y: number}) => {
            deps.clearSelection();
            deps.selectionManager.clearSelection();
        },
        [deps.clearSelection, deps.selectionManager],
    );

    const handleCanvasContextMenu = useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();

            deps.clearSelection();
            deps.selectionManager.clearSelection();
        },
        [deps.clearSelection, deps.selectionManager],
    );

    return {
        handleContainerClick,
        handleMapCanvasClick,
        handleCanvasContextMenu,
    };
};
