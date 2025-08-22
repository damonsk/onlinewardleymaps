import {useCallback} from 'react';
import {useMapComponentDeletion} from '../../../hooks/useMapComponentDeletion';
import {componentEvolutionManager} from '../../../services/ComponentEvolutionManager';
import {ActionType} from '../../../types/undo-redo';
import {UnifiedComponent} from '../../../types/unified/components';
import {UnifiedWardleyMap} from '../../../types/unified/map';
import {buildComponentLine, findComponentLineInMapText, parseComponentLine} from '../../../utils/componentNameMatching';
import {useEditing} from '../../EditingContext';

interface UseComponentOperationsProps {
    mapText: string;
    mutateMapText: (newText: string, actionType?: ActionType, description?: string, groupId?: string) => void;
    wardleyMap: UnifiedWardleyMap;
    showUserFeedback: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export interface ComponentOperations {
    handleDeleteComponent: (componentId: string) => void;
    handleEditComponent: (componentId: string) => void;
    handleToggleInertia: (componentId: string) => void;
    handleEvolveComponent: (componentId: string) => void;
    handleMethodApplication: (component: UnifiedComponent, methodName: string) => void;
}

export const useComponentOperations = ({
    mapText,
    mutateMapText,
    wardleyMap,
    showUserFeedback,
}: UseComponentOperationsProps): ComponentOperations => {
    const {deleteComponent} = useMapComponentDeletion();
    const {startEditing} = useEditing();

    const findComponent = useCallback(
        (componentId: string): UnifiedComponent | null => {
            const allComponents = [...wardleyMap.components, ...wardleyMap.anchors];
            return allComponents.find(c => c.id === componentId) || allComponents.find(c => String(c.id) === String(componentId)) || null;
        },
        [wardleyMap],
    );

    const handleDeleteComponent = useCallback(
        (componentId: string) => {
            if (!componentId || !mapText) {
                console.warn('Cannot delete component: missing componentId or mapText');
                return;
            }

            try {
                deleteComponent({
                    mapText,
                    componentId,
                    componentName: componentId,
                });
                showUserFeedback('Component deleted successfully', 'success');
            } catch (error) {
                console.error('Failed to delete component:', error);
                showUserFeedback('Failed to delete component', 'error');
            }
        },
        [deleteComponent, mapText, showUserFeedback],
    );

    const handleEditComponent = useCallback(
        (componentId: string) => {
            const component = findComponent(componentId);
            if (!component) {
                showUserFeedback(`Component "${componentId}" not found`, 'error');
                return;
            }
            startEditing(componentId, 'component');
        },
        [findComponent, startEditing, showUserFeedback],
    );

    const handleToggleInertia = useCallback(
        (componentId: string) => {
            const component = findComponent(componentId);
            if (!component) {
                showUserFeedback(`Component "${componentId}" not found`, 'error');
                return;
            }
            handleMethodApplication(component, 'inertia');
        },
        [findComponent, showUserFeedback],
    );

    const handleEvolveComponent = useCallback(
        (componentId: string) => {
            const component = findComponent(componentId);
            if (!component) {
                showUserFeedback(`Component "${componentId}" not found`, 'error');
                return;
            }

            if (component.evolved) {
                showUserFeedback('Cannot evolve an already evolved component', 'warning');
                return;
            }

            try {
                const evolutionResult = componentEvolutionManager.evolveComponent(component, mapText);
                if (evolutionResult.success) {
                    mutateMapText(
                        evolutionResult.updatedMapText,
                        'toolbar-method',
                        `Evolved component "${component.name}" to "${evolutionResult.evolvedComponent.name}"`,
                    );
                    showUserFeedback(`Successfully evolved "${component.name}"`, 'success');
                } else {
                    showUserFeedback(evolutionResult.error || 'Failed to evolve component', 'error');
                }
            } catch (error) {
                console.error('Error evolving component:', error);
                showUserFeedback('Failed to evolve component due to an unexpected error', 'error');
            }
        },
        [findComponent, mapText, mutateMapText, showUserFeedback],
    );

    const handleMethodApplication = useCallback(
        (component: UnifiedComponent, methodName: string) => {
            try {
                if (!component || !methodName) {
                    showUserFeedback('Invalid method application. Please try again.', 'error');
                    return;
                }

                const allComponents = [...wardleyMap.components, ...wardleyMap.anchors];
                const componentExists = allComponents.some(c => c.id === component.id);
                if (!componentExists) {
                    showUserFeedback('Component no longer exists. Method application cancelled.', 'warning');
                    return;
                }

                if (component.type !== 'component' || component.pipeline) {
                    showUserFeedback(`Cannot apply methods to ${component.type}s. Select a regular component.`, 'warning');
                    return;
                }

                const componentLineInfo = findComponentLineInMapText(mapText, component.name);
                if (!componentLineInfo) {
                    showUserFeedback('Could not find component in map text. Please try again.', 'error');
                    return;
                }

                const {lineIndex: componentLineIndex, line: componentLine} = componentLineInfo;
                const lines = mapText.split('\n');

                const parsedLine = parseComponentLine(componentLine);
                if (!parsedLine) {
                    showUserFeedback('Could not parse component syntax. Please check the map text.', 'error');
                    return;
                }

                const {name, coordinates, method: existingMethod, inertia: existingInertia, rest} = parsedLine;
                let newComponentLine: string;
                let feedbackMessage: string;

                if (methodName === 'component') {
                    newComponentLine = buildComponentLine(name, coordinates, undefined, existingInertia, rest);
                    feedbackMessage = `Converted "${component.name}" back to regular component`;
                } else if (methodName === 'inertia') {
                    if (existingInertia) {
                        newComponentLine = buildComponentLine(name, coordinates, existingMethod, undefined, rest);
                        feedbackMessage = `Removed inertia from "${component.name}"`;
                    } else {
                        newComponentLine = buildComponentLine(name, coordinates, existingMethod, 'inertia', rest);
                        feedbackMessage = `Added inertia to "${component.name}"`;
                    }
                } else {
                    const newMethod = `(${methodName})`;
                    newComponentLine = buildComponentLine(name, coordinates, newMethod, existingInertia, rest);
                    const actionText = existingMethod ? 'updated' : 'applied';
                    feedbackMessage = `${methodName} method ${actionText} to "${component.name}"`;
                }

                const updatedLines = [...lines];
                updatedLines[componentLineIndex] = newComponentLine;
                const updatedMapText = updatedLines.join('\n');

                mutateMapText(updatedMapText, 'toolbar-method', `Applied method to "${component.name}"`);
                showUserFeedback(feedbackMessage, 'success');
            } catch (error) {
                console.error('Method application failed:', error);
                showUserFeedback('Failed to apply method. Please try again.', 'error');
            }
        },
        [wardleyMap, mapText, mutateMapText, showUserFeedback],
    );

    return {
        handleDeleteComponent,
        handleEditComponent,
        handleToggleInertia,
        handleEvolveComponent,
        handleMethodApplication,
    };
};
