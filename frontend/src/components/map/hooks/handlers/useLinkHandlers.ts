import { useCallback } from 'react';

interface LinkHandlerDependencies {
    selectionManager: {
        selectLink: (linkInfo: any) => void;
        clearSelection: () => void;
    };
    clearSelection: () => void;
    contextMenuActions: {
        showLinkContextMenu?: (
            position: {x: number; y: number},
            linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number},
        ) => void;
        showCanvasContextMenu?: (position: {x: number; y: number}) => void;
    };
}

export interface LinkHandlers {
    handleLinkClick: (linkInfo: any) => void;
    handleLinkContextMenu: (linkInfo: any, event: React.MouseEvent) => void;
}

export const useLinkHandlers = (deps: LinkHandlerDependencies): LinkHandlers => {
    const handleLinkClick = useCallback(
        (linkInfo: any) => {
            deps.clearSelection();
            deps.selectionManager.selectLink(linkInfo);
        },
        [deps.clearSelection, deps.selectionManager],
    );

    const handleLinkContextMenu = useCallback(
        (linkInfo: any, event: React.MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();

            deps.clearSelection();
            deps.selectionManager.selectLink(linkInfo);

            if (deps.contextMenuActions.showLinkContextMenu) {
                deps.contextMenuActions.showLinkContextMenu({x: event.clientX, y: event.clientY}, linkInfo);
            } else {
                console.warn('Link context menu not available - contextMenuActions.showLinkContextMenu is not set');
            }
        },
        [deps],
    );

    return {
        handleLinkClick,
        handleLinkContextMenu,
    };
};
