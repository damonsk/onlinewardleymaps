import {useCallback, useEffect, useState} from 'react';
import {ActionType} from '../../../types/undo-redo';
import {UnifiedComponent} from '../../../types/unified/components';
import {UnifiedWardleyMap} from '../../../types/unified/map';

export interface LinkingState {
    linkingState: 'idle' | 'selecting-source' | 'selecting-target';
    sourceComponent: UnifiedComponent | null;
    highlightedComponent: UnifiedComponent | null;
    isDuplicateLink: boolean;
    isInvalidTarget: boolean;
    isSourceDeleted: boolean;
    isTargetDeleted: boolean;
    showCancellationHint: boolean;
}

export interface LinkingActions {
    setLinkingState: (state: 'idle' | 'selecting-source' | 'selecting-target') => void;
    setSourceComponent: (component: UnifiedComponent | null) => void;
    setHighlightedComponent: (component: UnifiedComponent | null) => void;
    setIsDuplicateLink: (isDuplicate: boolean) => void;
    setIsInvalidTarget: (isInvalid: boolean) => void;
    setIsSourceDeleted: (isDeleted: boolean) => void;
    setIsTargetDeleted: (isDeleted: boolean) => void;
    setShowCancellationHint: (show: boolean) => void;
    resetLinkingState: () => void;
}

export const useLinkingState = (
    wardleyMap: UnifiedWardleyMap,
    mapText: string,
    mutateMapText: (newText: string, actionType?: ActionType, description?: string, groupId?: string) => void,
    showUserFeedback?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void,
): LinkingState & LinkingActions => {
    const [linkingState, setLinkingState] = useState<'idle' | 'selecting-source' | 'selecting-target'>('idle');
    const [sourceComponent, setSourceComponent] = useState<UnifiedComponent | null>(null);
    const [highlightedComponent, setHighlightedComponent] = useState<UnifiedComponent | null>(null);
    const [isDuplicateLink, setIsDuplicateLink] = useState(false);
    const [isInvalidTarget, setIsInvalidTarget] = useState(false);
    const [isSourceDeleted, setIsSourceDeleted] = useState(false);
    const [isTargetDeleted, setIsTargetDeleted] = useState(false);
    const [showCancellationHint, setShowCancellationHint] = useState(false);

    const resetLinkingState = useCallback(() => {
        setLinkingState('idle');
        setSourceComponent(null);
        setHighlightedComponent(null);
        setShowCancellationHint(false);
        setIsDuplicateLink(false);
        setIsInvalidTarget(false);
        setIsSourceDeleted(false);
        setIsTargetDeleted(false);
    }, []);

    // Monitor component deletion and automatically cancel linking if source is deleted
    useEffect(() => {
        if (linkingState !== 'idle' && sourceComponent) {
            const allComponents = [...wardleyMap.components, ...wardleyMap.anchors];
            const sourceExists = allComponents.some(c => c.id === sourceComponent.id);

            if (!sourceExists) {
                resetLinkingState();
                showUserFeedback?.('Source component was deleted. Linking cancelled.', 'warning');
            }
        }
    }, [linkingState, sourceComponent, wardleyMap.components, wardleyMap.anchors, resetLinkingState, showUserFeedback]);

    return {
        linkingState,
        sourceComponent,
        highlightedComponent,
        isDuplicateLink,
        isInvalidTarget,
        isSourceDeleted,
        isTargetDeleted,
        showCancellationHint,
        setLinkingState,
        setSourceComponent,
        setHighlightedComponent,
        setIsDuplicateLink,
        setIsInvalidTarget,
        setIsSourceDeleted,
        setIsTargetDeleted,
        setShowCancellationHint,
        resetLinkingState,
    };
};
