import { useCallback } from 'react';
import { UnifiedComponent } from '../../../../types/unified/components';
import { UnifiedWardleyMap } from '../../../../types/unified/map';
import { linkExists } from '../../../../utils/componentDetection';
import { validatePosition } from '../../utils/validation';

interface MouseMovementDependencies {
    toolbarState: {
        setIsValidDropZone: (isValid: boolean) => void;
    };
    drawingState: {
        isDrawing: boolean;
        setCurrentMousePosition: (position: {x: number; y: number}) => void;
        setDrawingCurrentPosition: (position: {x: number; y: number}) => void;
    };
    linkingState: {
        linkingState: 'idle' | 'selecting-source' | 'selecting-target';
        sourceComponent: UnifiedComponent | null;
        setHighlightedComponent: (component: UnifiedComponent | null) => void;
        setIsInvalidTarget: (isInvalid: boolean) => void;
        setIsDuplicateLink: (isDuplicate: boolean) => void;
        setShowCancellationHint: (show: boolean) => void;
    };
    wardleyMap: UnifiedWardleyMap;
}

export interface MouseMovementHandlers {
    handleMouseMove: (position: {x: number; y: number; nearestComponent?: UnifiedComponent | null}) => void;
}

export const useMouseMovementHandlers = (deps: MouseMovementDependencies): MouseMovementHandlers => {
    const handleMouseMove = useCallback(
        (position: {x: number; y: number; nearestComponent?: UnifiedComponent | null}) => {
            const validation = validatePosition(position);
            
            // Debug logging to understand what's causing invalid coordinates
            if (!validation.isValid && Math.random() < 0.01) {
                console.debug('Mouse movement validation failed:', {
                    position,
                    errors: validation.errors,
                });
            }

            updateDropZoneStatus(validation.isValid);
            updateDrawingState(position);

            if (deps.linkingState.linkingState !== 'idle') {
                updateLinkingHighlights(position);
            }
        },
        [deps],
    );

    const updateDropZoneStatus = useCallback(
        (isValid: boolean) => {
            deps.toolbarState.setIsValidDropZone(isValid);
        },
        [deps.toolbarState],
    );

    const updateDrawingState = useCallback(
        (position: {x: number; y: number}) => {
            deps.drawingState.setCurrentMousePosition(position);

            if (deps.drawingState.isDrawing) {
                deps.drawingState.setDrawingCurrentPosition(position);
            }
        },
        [deps.drawingState],
    );

    const updateLinkingHighlights = useCallback(
        (position: {x: number; y: number; nearestComponent?: UnifiedComponent | null}) => {
            if (position.nearestComponent) {
                updateComponentHighlights(position.nearestComponent);
            } else {
                clearComponentHighlights();
            }
        },
        [deps],
    );

    const updateComponentHighlights = useCallback(
        (nearestComponent: UnifiedComponent) => {
            deps.linkingState.setHighlightedComponent(nearestComponent);

            if (deps.linkingState.linkingState === 'selecting-target' && deps.linkingState.sourceComponent) {
                const isInvalid = nearestComponent.id === deps.linkingState.sourceComponent.id;
                const existingLinks = deps.wardleyMap.links || [];
                const isDuplicate = linkExists(deps.linkingState.sourceComponent, nearestComponent, existingLinks);

                deps.linkingState.setIsInvalidTarget(isInvalid);
                deps.linkingState.setIsDuplicateLink(isDuplicate && !isInvalid);
            }
        },
        [deps],
    );

    const clearComponentHighlights = useCallback(() => {
        deps.linkingState.setHighlightedComponent(null);
        deps.linkingState.setShowCancellationHint(deps.linkingState.linkingState !== 'idle');
    }, [deps.linkingState]);

    return {
        handleMouseMove,
    };
};
