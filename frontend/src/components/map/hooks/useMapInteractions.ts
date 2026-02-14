import {useCallback, useState} from 'react';
import {ToolbarItem} from '../../../types/toolbar';
import {UnifiedComponent} from '../../../types/unified/components';

/**
 * Custom hook to manage map interaction states (linking, drawing, method application)
 * Extracted from MapView to reduce complexity
 */
export const useMapInteractions = () => {
    // Component linking state management
    const [linkingState, setLinkingState] = useState<'idle' | 'selecting-source' | 'selecting-target'>('idle');
    const [sourceComponent, setSourceComponent] = useState<UnifiedComponent | null>(null);
    const [highlightedComponent, setHighlightedComponent] = useState<UnifiedComponent | null>(null);
    const [isDuplicateLink, setIsDuplicateLink] = useState(false);
    const [isInvalidTarget, setIsInvalidTarget] = useState(false);
    const [isSourceDeleted, setIsSourceDeleted] = useState(false);
    const [isTargetDeleted, setIsTargetDeleted] = useState(false);
    const [showCancellationHint, setShowCancellationHint] = useState(false);

    // PST box drawing state management
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingStartPosition, setDrawingStartPosition] = useState<{x: number; y: number} | null>(null);
    const [drawingCurrentPosition, setDrawingCurrentPosition] = useState<{x: number; y: number}>({x: 0, y: 0});

    // Method application state management
    const [methodHighlightedComponent, setMethodHighlightedComponent] = useState<UnifiedComponent | null>(null);

    // Helper function to reset all linking state
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

    // Helper function to reset drawing state
    const resetDrawingState = useCallback(() => {
        setIsDrawing(false);
        setDrawingStartPosition(null);
        setDrawingCurrentPosition({x: 0, y: 0});
    }, []);

    // Helper function to reset method application state
    const resetMethodState = useCallback(() => {
        setMethodHighlightedComponent(null);
    }, []);

    // Reset all interaction states
    const resetAllStates = useCallback(() => {
        resetLinkingState();
        resetDrawingState();
        resetMethodState();
    }, [resetLinkingState, resetDrawingState, resetMethodState]);

    return {
        // Linking state
        linkingState,
        setLinkingState,
        sourceComponent,
        setSourceComponent,
        highlightedComponent,
        setHighlightedComponent,
        isDuplicateLink,
        setIsDuplicateLink,
        isInvalidTarget,
        setIsInvalidTarget,
        isSourceDeleted,
        setIsSourceDeleted,
        isTargetDeleted,
        setIsTargetDeleted,
        showCancellationHint,
        setShowCancellationHint,

        // Drawing state
        isDrawing,
        setIsDrawing,
        drawingStartPosition,
        setDrawingStartPosition,
        drawingCurrentPosition,
        setDrawingCurrentPosition,

        // Method application state
        methodHighlightedComponent,
        setMethodHighlightedComponent,

        // Reset functions
        resetLinkingState,
        resetDrawingState,
        resetMethodState,
        resetAllStates,
    };
};
