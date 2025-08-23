import React, {LegacyRef, useCallback} from 'react';
import {EvolutionStages, MapCanvasDimensions, MapDimensions, Offsets} from '../../constants/defaults';
import {PST_SUB_ITEMS} from '../../constants/toolbarItems';
import {MapAnnotationsPosition} from '../../types/base';
import {MapTheme} from '../../types/map/styles';
import {ToolbarItem} from '../../types/toolbar';
import {ActionType} from '../../types/undo-redo';
import {UnifiedWardleyMap} from '../../types/unified/map';
import {useComponentSelection} from '../ComponentSelectionContext';
import {EditingProvider} from '../EditingContext';
import {useFeatureSwitches} from '../FeatureSwitchesContext';
import {ContextMenuProvider} from './ContextMenuProvider';
import {DefaultThemes} from './foundation/Fill';

// New custom hooks for separated concerns
import {useComponentOperations} from './hooks/useComponentOperations';
import {useDrawingState} from './hooks/useDrawingState';
import {useLinkingState} from './hooks/useLinkingState';
import {useMapHandlers} from './hooks/useMapHandlers';
import {useSelectionManager} from './hooks/useSelectionManager';
import {useToolbarState} from './hooks/useToolbarState';
import {useUserFeedback} from './hooks/useUserFeedback';

// New components for separated UI concerns
import {UserFeedbackNotification} from './components/UserFeedbackNotification';
import DragPreview from './DragPreview';
import UnifiedMapCanvas from './UnifiedMapCanvas';
import WysiwygToolbar from './WysiwygToolbar';

export interface ModernMapViewRefactoredProps {
    wardleyMap: UnifiedWardleyMap;
    shouldHideNav: () => void;
    hideNav: boolean;
    mapTitle: string;
    mapAnnotationsPresentation: MapAnnotationsPosition;
    mapStyleDefs: MapTheme;
    mapCanvasDimensions: MapCanvasDimensions;
    mapDimensions: MapDimensions;
    mapEvolutionStates: EvolutionStages;
    mapRef: React.MutableRefObject<HTMLElement | null>;
    mapText: string;
    mutateMapText: (newText: string, actionType?: ActionType, description?: string, groupId?: string) => void;
    evolutionOffsets: Offsets;
    launchUrl: (urlId: string) => void;
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    setNewComponentContext: React.Dispatch<React.SetStateAction<{x: string; y: string} | null>>;
    showLinkedEvolved: boolean;
}

export const MapView: React.FunctionComponent<ModernMapViewRefactoredProps> = props => {
    const featureSwitches = useFeatureSwitches();
    const {clearSelection} = useComponentSelection();

    // State to store context menu actions
    const [contextMenuActions, setContextMenuActions] = React.useState<{
        showLinkContextMenu?: (
            position: {x: number; y: number},
            linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number},
        ) => void;
    }>({});

    React.useEffect(() => {
        console.log('MapView: contextMenuActions updated:', contextMenuActions);
    }, [contextMenuActions]);

    // User feedback hook must be initialized first since other hooks depend on it
    const {showUserFeedback, userFeedback, setUserFeedback} = useUserFeedback();

    // Separated state management using custom hooks
    const linkingState = useLinkingState(props.wardleyMap, props.mapText, props.mutateMapText, showUserFeedback);
    const drawingState = useDrawingState(props.mapDimensions);

    // Toolbar state with dependencies to coordinate with other states
    const toolbarState = useToolbarState({
        onLinkingModeStart: () => {
            linkingState.setLinkingState('selecting-source');
            linkingState.setSourceComponent(null);
            linkingState.setHighlightedComponent(null);
            linkingState.setShowCancellationHint(false);
            // Reset drawing state when switching to linking
            drawingState.stopDrawing();
        },
        onDrawingModeStart: item => {
            // Reset linking state when switching to drawing
            linkingState.resetLinkingState();
            toolbarState.setMethodHighlightedComponent(null);
        },
        onMethodApplicationModeStart: item => {
            // Reset linking and drawing state when switching to method application
            linkingState.resetLinkingState();
            drawingState.stopDrawing();
        },
        onModeReset: () => {
            // Reset all tool states when switching to other tools
            linkingState.resetLinkingState();
            drawingState.stopDrawing();
            toolbarState.setMethodHighlightedComponent(null);
        },
        showUserFeedback,
    });

    // Component operations (delete, edit, evolve, etc.)
    const componentOps = useComponentOperations({
        mapText: props.mapText,
        mutateMapText: props.mutateMapText,
        wardleyMap: props.wardleyMap,
        showUserFeedback,
    });

    // Selection manager for keyboard deletion support
    const selectionManager = useSelectionManager({
        componentOps,
    });

    // Consolidated handlers using custom hook
    const handlers = useMapHandlers({
        props,
        toolbarState,
        linkingState,
        drawingState,
        showUserFeedback,
        clearSelection,
        componentOps,
        selectionManager,
    });

    // Simplified styling
    const containerStyle = getContainerStyle(props.mapStyleDefs);
    const mapStyle = getMapStyle();
    const legacyRef: LegacyRef<HTMLDivElement> | undefined = props.mapRef as LegacyRef<HTMLDivElement> | undefined;

    // Unified toolbar selection handler that coordinates between different state hooks
    const handleUnifiedToolbarSelection = useCallback(
        (item: ToolbarItem | null) => {
            console.log('Unified toolbar item selection:', item?.id || 'none');

            // Handle PST tool default selection
            let finalItem = item;
            if (item?.id === 'pst' && !item.selectedSubItem && item.subItems) {
                const pioneerSubItem = PST_SUB_ITEMS.find(subItem => subItem.id === 'pioneers');
                if (pioneerSubItem) {
                    finalItem = {...item, selectedSubItem: pioneerSubItem};
                    console.log('Auto-selected Pioneer for PST tool');
                }
            }

            toolbarState.setSelectedToolbarItem(finalItem);

            if (!item) {
                toolbarState.setIsValidDropZone(false);
                return;
            }

            // Handle different tool types with proper state coordination
            if (item?.toolType === 'linking') {
                linkingState.setLinkingState('selecting-source');
                linkingState.setSourceComponent(null);
                linkingState.setHighlightedComponent(null);
                linkingState.setShowCancellationHint(false);
                showUserFeedback('Hover & click components to link', 'info');
                // Reset drawing state when switching to linking
                drawingState.stopDrawing();
            } else if (item?.toolType === 'drawing') {
                // Reset linking state when switching to drawing
                linkingState.resetLinkingState();
                toolbarState.setMethodHighlightedComponent(null);
                if (item.selectedSubItem) {
                    showUserFeedback(`Click and drag to draw ${item.selectedSubItem.label} box`, 'info');
                } else {
                    showUserFeedback('Select a PST type from the dropdown first', 'warning');
                }
            } else if (item?.toolType === 'method-application') {
                // Reset linking and drawing state when switching to method application
                linkingState.resetLinkingState();
                drawingState.stopDrawing();
                const methodName = item.methodName || 'method';
                showUserFeedback(`Hover over components to apply ${methodName} method`, 'info');
            } else {
                // Reset all tool states when switching to other tools or deselecting
                linkingState.resetLinkingState();
                drawingState.stopDrawing();
                toolbarState.setMethodHighlightedComponent(null);
            }

            console.log('Toolbar item processed:', finalItem?.id || 'none', 'with toolType:', finalItem?.toolType || 'none');
        },
        [toolbarState, linkingState, drawingState, showUserFeedback],
    );

    return (
        <EditingProvider>
            <ContextMenuProvider
                mapText={props.mapText}
                onDeleteComponent={componentOps.handleDeleteComponent}
                onDeleteLink={componentOps.handleDeleteLink}
                onEditComponent={componentOps.handleEditComponent}
                onToggleInertia={componentOps.handleToggleInertia}
                onEvolveComponent={componentOps.handleEvolveComponent}
                wardleyMap={props.wardleyMap}
                selectionManager={selectionManager}
                onContextMenuReady={setContextMenuActions}>
                <div
                    ref={legacyRef}
                    className={props.mapStyleDefs.className}
                    style={containerStyle}
                    onClick={handlers.handleContainerClick}>
                    <WysiwygToolbar
                        mapStyleDefs={props.mapStyleDefs}
                        mapDimensions={props.mapDimensions}
                        mapText={props.mapText}
                        mutateMapText={props.mutateMapText}
                        selectedItem={toolbarState.selectedToolbarItem}
                        onItemSelect={handleUnifiedToolbarSelection}
                        keyboardShortcutsEnabled={true}
                        getSelectedLink={selectionManager.getSelectedLink}
                        onDeleteLink={componentOps.handleDeleteLink}
                        clearSelection={selectionManager.clearSelection}
                    />

                    <DragPreview
                        selectedItem={toolbarState.selectedToolbarItem}
                        mousePosition={{x: 0, y: 0}}
                        isValidDropZone={toolbarState.isValidDropZone}
                        mapStyleDefs={props.mapStyleDefs}
                    />

                    <UserFeedbackNotification userFeedback={userFeedback} setUserFeedback={setUserFeedback} />

                    <div id="map" style={mapStyle}>
                        <UnifiedMapCanvas
                            mapStyleDefs={props.mapStyleDefs}
                            mapDimensions={props.mapDimensions}
                            mapCanvasDimensions={props.mapCanvasDimensions}
                            mapEvolutionStates={props.mapEvolutionStates}
                            evolutionOffsets={props.evolutionOffsets}
                            wardleyMap={props.wardleyMap}
                            mapText={props.mapText}
                            mutateMapText={props.mutateMapText}
                            setHighlightLine={props.setHighlightLine}
                            setNewComponentContext={props.setNewComponentContext}
                            launchUrl={props.launchUrl}
                            showLinkedEvolved={props.showLinkedEvolved}
                            shouldHideNav={props.shouldHideNav}
                            hideNav={props.hideNav}
                            mapAnnotationsPresentation={props.mapAnnotationsPresentation}
                            handleMapCanvasClick={handlers.handleMapCanvasClick}
                            selectedToolbarItem={toolbarState.selectedToolbarItem}
                            onToolbarItemDrop={handlers.handleToolbarItemDrop}
                            onMouseMove={handlers.handleMouseMove}
                            onComponentClick={handlers.handleComponentClick}
                            linkingState={linkingState.linkingState}
                            sourceComponent={linkingState.sourceComponent}
                            highlightedComponent={linkingState.highlightedComponent}
                            isDuplicateLink={linkingState.isDuplicateLink}
                            isInvalidTarget={linkingState.isInvalidTarget}
                            showCancellationHint={linkingState.showCancellationHint}
                            isSourceDeleted={linkingState.isSourceDeleted}
                            isTargetDeleted={linkingState.isTargetDeleted}
                            onMouseDown={handlers.handleMouseDown}
                            onMouseUp={handlers.handleMouseUp}
                            isDrawing={drawingState.isDrawing}
                            drawingStartPosition={drawingState.drawingStartPosition}
                            drawingCurrentPosition={drawingState.drawingCurrentPosition}
                            onMethodApplication={componentOps.handleMethodApplication}
                            methodHighlightedComponent={toolbarState.methodHighlightedComponent}
                            onLinkClick={linkInfo => {
                                // Clear component selection when selecting a link
                                clearSelection();
                                selectionManager.selectLink(linkInfo);
                            }}
                            onLinkContextMenu={(linkInfo, event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                // Clear component selection when selecting a link via context menu
                                clearSelection();
                                selectionManager.selectLink(linkInfo);
                                // Show context menu for the link using the callback
                                if (contextMenuActions.showLinkContextMenu) {
                                    contextMenuActions.showLinkContextMenu({x: event.clientX, y: event.clientY}, linkInfo);
                                } else {
                                    console.warn('Link context menu not available - contextMenuActions.showLinkContextMenu is not set');
                                }
                            }}
                            isLinkSelected={linkId => selectionManager.isSelected(linkId, 'link')}
                        />
                    </div>
                </div>
            </ContextMenuProvider>
        </EditingProvider>
    );
};

// Extracted style helpers
const getContainerStyle = (mapStyleDefs: MapTheme): React.CSSProperties => {
    const fill: DefaultThemes = {
        wardley: 'url(#wardleyGradient)',
        colour: 'none',
        plain: 'none',
        handwritten: 'none',
        dark: '#353347',
    };

    return {
        backgroundColor: fill[mapStyleDefs.className as keyof DefaultThemes],
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    };
};

const getMapStyle = (): React.CSSProperties => ({
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
});
