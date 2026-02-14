import {useCallback} from 'react';
import {useI18n} from '../../../../hooks/useI18n';
import {UnifiedComponent} from '../../../../types/unified/components';
import {linkExists} from '../../../../utils/componentDetection';
import {ComponentLinkingOperations} from './useComponentLinkingOperations';

interface ComponentInteractionDependencies {
    linkingState: {
        linkingState: 'idle' | 'selecting-source' | 'selecting-target';
        sourceComponent: UnifiedComponent | null;
        setSourceComponent: (component: UnifiedComponent | null) => void;
        setLinkingState: (state: 'idle' | 'selecting-source' | 'selecting-target') => void;
        resetLinkingState: () => void;
    };
    selectionManager: {
        selectComponent: (component: UnifiedComponent) => void;
        clearSelection: () => void;
    };
    wardleyMap: {
        links?: Array<any>;
    };
    componentLinkingOps: ComponentLinkingOperations;
    showUserFeedback: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export interface ComponentInteractionHandlers {
    handleComponentClick: (component: UnifiedComponent | null, position?: {x: number; y: number}) => void;
}

export const useComponentInteractionHandlers = (deps: ComponentInteractionDependencies): ComponentInteractionHandlers => {
    const {t, originalT} = useI18n();

    const isInvalidTarget = useCallback(
        (component: UnifiedComponent): boolean => {
            return component.id === deps.linkingState.sourceComponent?.id;
        },
        [deps.linkingState.sourceComponent],
    );

    const isDuplicateLink = useCallback(
        (component: UnifiedComponent): boolean => {
            if (!deps.linkingState.sourceComponent) return false;
            const existingLinks = deps.wardleyMap.links || [];
            return linkExists(deps.linkingState.sourceComponent, component, existingLinks);
        },
        [deps.linkingState.sourceComponent, deps.wardleyMap.links],
    );

    const startLinking = useCallback(
        (component: UnifiedComponent) => {
            deps.linkingState.setSourceComponent(component);
            deps.linkingState.setLinkingState('selecting-target');
            deps.showUserFeedback(
                originalT('map.feedback.linking.sourceSelected', {componentName: component.name}) ||
                    `Selected "${component.name}" as source. Click another component to create a link.`,
                'info',
            );
        },
        [deps, originalT],
    );

    const completeLinking = useCallback(
        (component: UnifiedComponent) => {
            if (!deps.linkingState.sourceComponent) {
                console.error('No source component selected');
                return;
            }

            if (isInvalidTarget(component)) {
                deps.showUserFeedback(t('map.feedback.linking.cannotLinkSelf', 'Cannot link a component to itself. Select a different component.'), 'warning');
                deps.linkingState.resetLinkingState();
                return;
            }

            if (isDuplicateLink(component)) {
                deps.showUserFeedback(
                    originalT('map.feedback.linking.duplicateLink', {
                        sourceName: deps.linkingState.sourceComponent.name,
                        targetName: component.name,
                    }) || `Link between "${deps.linkingState.sourceComponent.name}" and "${component.name}" already exists.`,
                    'warning',
                );
                deps.linkingState.resetLinkingState();
                return;
            }

            deps.componentLinkingOps.createLink(component);
        },
        [isDuplicateLink, isInvalidTarget, deps, t, originalT],
    );

    const selectComponent = useCallback(
        (component: UnifiedComponent) => {
            deps.selectionManager.selectComponent(component);
        },
        [deps],
    );

    const handleNullComponentClick = useCallback(
        (position?: {x: number; y: number}) => {
            if (deps.linkingState.linkingState === 'selecting-target' && position && deps.linkingState.sourceComponent) {
                deps.componentLinkingOps.createComponentAndLink(position);
            } else if (deps.linkingState.linkingState !== 'idle') {
                deps.linkingState.resetLinkingState();
                deps.showUserFeedback(t('map.feedback.linking.cancelled', 'Linking cancelled'), 'info');
            }
            deps.selectionManager.clearSelection();
        },
        [deps, t],
    );

    const handleValidComponentClick = useCallback(
        (component: UnifiedComponent) => {
            switch (deps.linkingState.linkingState) {
                case 'selecting-source':
                    startLinking(component);
                    break;
                case 'selecting-target':
                    completeLinking(component);
                    break;
                case 'idle':
                default:
                    selectComponent(component);
                    break;
            }
        },
        [completeLinking, selectComponent, startLinking, deps.linkingState.linkingState],
    );

    const handleComponentClick = useCallback(
        (component: UnifiedComponent | null, position?: {x: number; y: number}) => {
            if (component === null) {
                handleNullComponentClick(position);
                return;
            }

            handleValidComponentClick(component);
        },
        [handleNullComponentClick, handleValidComponentClick],
    );

    return {
        handleComponentClick,
    };
};
