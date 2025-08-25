import { useCallback, useState } from 'react';
import { ActionType } from '../../../../types/undo-redo';
import { UnifiedWardleyMap } from '../../../../types/unified/map';
import { extractAllComponentNames, insertPipelineComponent } from '../../../../utils/mapTextGeneration';
import { generateUniquePipelineComponentName } from '../../../../utils/pipelineDetection';

interface PipelineHandlerDependencies {
    props: {
        wardleyMap: UnifiedWardleyMap;
        mapText: string;
        mutateMapText: (newText: string, actionType?: ActionType, description?: string, groupId?: string) => void;
    };
    toolbarState: {
        setSelectedToolbarItem: (item: any) => void;
        setIsValidDropZone: (isValid: boolean) => void;
    };
    showUserFeedback: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export interface PipelineHandlers {
    highlightedPipelineId: string | null;
    handlePipelineMouseEnter: (pipelineId: string) => void;
    handlePipelineMouseLeave: () => void;
    handlePipelineComponentInsertion: (pipelineBounds: any, position: {x: number; y: number}) => void;
    clearPipelineHighlight: () => void;
}

export const usePipelineHandlers = (deps: PipelineHandlerDependencies): PipelineHandlers => {
    const [highlightedPipelineId, setHighlightedPipelineId] = useState<string | null>(null);

    const handlePipelineMouseEnter = useCallback((pipelineId: string) => {
        setHighlightedPipelineId(pipelineId);
    }, []);

    const handlePipelineMouseLeave = useCallback(() => {
        setHighlightedPipelineId(null);
    }, []);

    const clearPipelineHighlight = useCallback(() => {
        setHighlightedPipelineId(null);
    }, []);

    const handlePipelineComponentInsertion = useCallback(
        (pipelineBounds: any, position: {x: number; y: number}) => {
            try {
                const existingNames = extractAllComponentNames(deps.props.mapText);
                const componentName = generateUniquePipelineComponentName('New Component', existingNames);

                const updatedMapText = insertPipelineComponent(
                    deps.props.mapText,
                    pipelineBounds.name,
                    componentName,
                    position.x, // Use maturity (x) position
                );

                deps.props.mutateMapText(
                    updatedMapText,
                    'toolbar-component',
                    `Added component "${componentName}" to pipeline "${pipelineBounds.name}"`,
                );

                deps.showUserFeedback(`Component "${componentName}" added to pipeline "${pipelineBounds.name}"!`, 'success');

                cleanupAfterOperation();
            } catch (error) {
                handlePipelineError(pipelineBounds.name, error);
            }
        },
        [deps],
    );

    const cleanupAfterOperation = useCallback(() => {
        deps.toolbarState.setSelectedToolbarItem(null);
        deps.toolbarState.setIsValidDropZone(false);
        setHighlightedPipelineId(null);
    }, [deps]);

    const handlePipelineError = useCallback(
        (pipelineName: string, error: unknown) => {
            console.error('Pipeline component insertion failed:', error);
            deps.showUserFeedback(`Failed to add component to pipeline "${pipelineName}". Please try again.`, 'error');
            cleanupAfterOperation();
        },
        [deps, cleanupAfterOperation],
    );

    return {
        highlightedPipelineId,
        handlePipelineMouseEnter,
        handlePipelineMouseLeave,
        handlePipelineComponentInsertion,
        clearPipelineHighlight,
    };
};
