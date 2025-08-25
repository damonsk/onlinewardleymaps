import { useCallback } from 'react';
import { ActionType } from '../../../../types/undo-redo';
import { UnifiedComponent } from '../../../../types/unified/components';
import { UnifiedWardleyMap } from '../../../../types/unified/map';
import { addLinkToMapText, generateLinkSyntax } from '../../../../utils/componentDetection';
import { generateUniqueComponentName, validatePosition } from '../../utils/validation';

interface ComponentLinkingDependencies {
    props: {
        wardleyMap: UnifiedWardleyMap;
        mapText: string;
        mutateMapText: (newText: string, actionType?: ActionType, description?: string, groupId?: string) => void;
    };
    linkingState: {
        sourceComponent: UnifiedComponent | null;
        resetLinkingState: () => void;
    };
    toolbarState: {
        setSelectedToolbarItem: (item: any) => void;
    };
    showUserFeedback: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export interface ComponentLinkingOperations {
    createComponentAndLink: (position: {x: number; y: number}) => Promise<void>;
    createLink: (component: UnifiedComponent) => void;
}

export const useComponentLinkingOperations = (deps: ComponentLinkingDependencies): ComponentLinkingOperations => {
    const createComponentAndLink = useCallback(
        async (position: {x: number; y: number}) => {
            const validation = validatePosition(position);
            if (!validation.isValid) {
                deps.showUserFeedback(validation.errors[0], 'error');
                return;
            }

            if (!deps.linkingState.sourceComponent) {
                deps.showUserFeedback('No source component selected for linking', 'error');
                return;
            }

            try {
                const componentName = generateUniqueComponentName('New Component', getAllExistingComponentNames());

                const newComponent = createComponentData(componentName, position);
                const componentText = buildComponentText(componentName, position);
                const linkText = generateLinkSyntax(deps.linkingState.sourceComponent, newComponent);

                const updatedMapText = deps.props.mapText + '\r\n' + componentText + '\r\n' + linkText;

                deps.props.mutateMapText(updatedMapText, 'toolbar-component', `Added component "${componentName}" with link`);

                deps.showUserFeedback(`Created "${componentName}" and linked from "${deps.linkingState.sourceComponent.name}"`, 'success');

                cleanupAfterOperation();
            } catch (error) {
                handleOperationError('Failed to create component and link. Please try again.', error);
            }
        },
        [deps],
    );

    const createLink = useCallback(
        (component: UnifiedComponent) => {
            if (!deps.linkingState.sourceComponent) {
                console.error('No source component selected');
                return;
            }

            try {
                const updatedMapText = addLinkToMapText(deps.props.mapText, deps.linkingState.sourceComponent, component);

                deps.props.mutateMapText(
                    updatedMapText,
                    'toolbar-link',
                    `Added link: "${deps.linkingState.sourceComponent.name}" → "${component.name}"`,
                );

                deps.showUserFeedback(`Link created: "${deps.linkingState.sourceComponent.name}" → "${component.name}"`, 'success');

                cleanupAfterOperation();
            } catch (error) {
                handleOperationError('Failed to create link. Please try again.', error);
            }
        },
        [deps],
    );

    // Helper functions
    const getAllExistingComponentNames = useCallback((): string[] => {
        const existingComponents = [...deps.props.wardleyMap.components, ...deps.props.wardleyMap.anchors];
        return existingComponents.map(c => c.name);
    }, [deps.props.wardleyMap]);

    const createComponentData = useCallback((componentName: string, position: {x: number; y: number}): UnifiedComponent => {
        return {
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
    }, []);

    const buildComponentText = useCallback((componentName: string, position: {x: number; y: number}): string => {
        return `component ${componentName} [${position.y.toFixed(2)}, ${position.x.toFixed(2)}]`;
    }, []);

    const cleanupAfterOperation = useCallback(() => {
        deps.linkingState.resetLinkingState();
        deps.toolbarState.setSelectedToolbarItem(null);
    }, [deps]);

    const handleOperationError = useCallback(
        (userMessage: string, error: unknown) => {
            console.error(userMessage, error);
            deps.showUserFeedback(userMessage, 'error');
            cleanupAfterOperation();
        },
        [deps, cleanupAfterOperation],
    );

    return {
        createComponentAndLink,
        createLink,
    };
};
