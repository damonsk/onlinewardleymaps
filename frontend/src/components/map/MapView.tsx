import React, {LegacyRef, useCallback, useMemo, useState} from 'react';
import {TOOL_NONE} from 'react-svg-pan-zoom';
import {EvolutionStages, MapCanvasDimensions, MapDimensions, Offsets} from '../../constants/defaults';
import {PST_SUB_ITEMS} from '../../constants/toolbarItems';
import {MapPropertiesManager} from '../../services/MapPropertiesManager';
import {MapAnnotationsPosition} from '../../types/base';
import {MapTheme} from '../../types/map/styles';
import {ToolbarItem} from '../../types/toolbar';
import {ActionType} from '../../types/undo-redo';
import {UnifiedWardleyMap} from '../../types/unified/map';
import {useI18n} from '../../hooks/useI18n';
import {useComponentSelection} from '../ComponentSelectionContext';
import {useFeatureSwitches} from '../FeatureSwitchesContext';
import {ContextMenuProvider} from './ContextMenuProvider';
import EvolutionStagesDialog from './EvolutionStagesDialog';
import {DefaultThemes} from './foundation/Fill';
import MapSizeDialog from './MapSizeDialog';

// New custom hooks for separated concerns
import {useComponentOperations} from './hooks/useComponentOperations';
import {useDrawingState} from './hooks/useDrawingState';
import {useLinkingState} from './hooks/useLinkingState';
import {useMapHandlers} from './hooks/useMapHandlers';
import {useSelectionManager} from './hooks/useSelectionManager';
import {useToolbarItemState} from './hooks/useToolbarItemState';
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
    showWysiwygToolbar?: boolean;
    toolbarSnapped?: boolean;
    onToolbarSnapChange?: (isSnapped: boolean) => void;
    mapOnlyView?: boolean; // Presentation mode vs Editor mode
}

const MapViewComponent: React.FunctionComponent<ModernMapViewRefactoredProps> = props => {
    const featureSwitches = useFeatureSwitches();
    const {clearSelection} = useComponentSelection();
    const {t, originalT} = useI18n();

    // State to store context menu actions
    const [contextMenuActions, setContextMenuActions] = React.useState<{
        showLinkContextMenu?: (
            position: {x: number; y: number},
            linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number},
        ) => void;
        showCanvasContextMenu?: (position: {x: number; y: number}) => void;
    }>({});

    React.useEffect(() => {
        console.log('MapView: contextMenuActions updated:', contextMenuActions);
    }, [contextMenuActions]);

    // User feedback hook must be initialized first since other hooks depend on it
    const {showUserFeedback, userFeedback, setUserFeedback} = useUserFeedback();

    // Separated state management using custom hooks
    const linkingState = useLinkingState(props.wardleyMap, props.mapText, props.mutateMapText, showUserFeedback);
    const drawingState = useDrawingState(props.mapDimensions);

    // Toolbar item selection state management
    const toolbarState = useToolbarItemState();

    // Component operations (delete, edit, evolve, etc.)
    const componentOps = useComponentOperations({
        mapText: props.mapText,
        mutateMapText: props.mutateMapText,
        wardleyMap: props.wardleyMap,
        showUserFeedback,
    });

    // Canvas context menu handlers
    const handleChangeMapStyle = useCallback(
        (style: 'plain' | 'wardley' | 'colour') => {
            try {
                const result = MapPropertiesManager.updateMapStyle(props.mapText, style);
                props.mutateMapText(result.updatedMapText, 'editor-text', `Changed map style to ${style}`);
                showUserFeedback(originalT('map.feedback.mapStyleChanged', {style}) || `Map style changed to ${style}`, 'success');
            } catch (error) {
                console.error('Failed to change map style:', error);
                showUserFeedback(t('map.feedback.mapStyleChangeFailed', 'Failed to change map style'), 'error');
            }
        },
        [props, showUserFeedback, t, originalT],
    );

    // Dialog opening handlers for context menu
    const handleOpenMapSizeDialog = useCallback(() => {
        setMapSizeDialogOpen(true);
    }, []);

    const handleOpenEvolutionStagesDialog = useCallback(() => {
        setEvolutionStagesDialogOpen(true);
    }, []);

    // Dialog confirmation handlers
    const handleConfirmMapSize = useCallback(
        (size: {width: number; height: number}) => {
            try {
                const result = MapPropertiesManager.updateMapSize(props.mapText, size.width, size.height);
                props.mutateMapText(result.updatedMapText, 'editor-text', `Set map size to ${size.width}x${size.height}`);
                showUserFeedback(originalT('map.feedback.mapSizeSet', {width: size.width, height: size.height}) || `Map size set to ${size.width}x${size.height}`, 'success');
                setMapSizeDialogOpen(false);
            } catch (error) {
                console.error('Failed to set map size:', error);
                showUserFeedback(t('map.feedback.mapSizeSetFailed', 'Failed to set map size'), 'error');
            }
        },
        [props, showUserFeedback, t, originalT],
    );

    const handleConfirmEvolutionStages = useCallback(
        (stages: {stage1: string; stage2: string; stage3: string; stage4: string}) => {
            try {
                const result = MapPropertiesManager.updateEvolutionStages(props.mapText, stages);
                props.mutateMapText(result.updatedMapText, 'editor-text', 'Updated evolution stages');
                showUserFeedback(t('map.feedback.evolutionStagesUpdated', 'Evolution stages updated'), 'success');
                setEvolutionStagesDialogOpen(false);
            } catch (error) {
                console.error('Failed to update evolution stages:', error);
                showUserFeedback(t('map.feedback.evolutionStagesUpdateFailed', 'Failed to update evolution stages'), 'error');
            }
        },
        [props, showUserFeedback, t],
    );

    // Dialog cancellation handlers
    const handleCancelMapSize = useCallback(() => {
        setMapSizeDialogOpen(false);
    }, []);

    const handleCancelEvolutionStages = useCallback(() => {
        setEvolutionStagesDialogOpen(false);
    }, []);

    // Dialog state management
    const [mapSizeDialogOpen, setMapSizeDialogOpen] = useState(false);
    const [evolutionStagesDialogOpen, setEvolutionStagesDialogOpen] = useState(false);

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
        contextMenuActions,
    });

    // Memoized styling to prevent recreation on every render
    const containerStyle = useMemo(() => getContainerStyle(props.mapStyleDefs), [props.mapStyleDefs]);

    // Calculate effective toolbar snapped state for map sizing
    // Toolbar affects map size only if it's both snapped AND visible
    const effectiveToolbarSnapped = (props.toolbarSnapped ?? false) && (props.showWysiwygToolbar ?? true);
    const mapStyle = useMemo(() => getMapStyle(effectiveToolbarSnapped), [effectiveToolbarSnapped]);

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
                showUserFeedback(t('map.feedback.linking.hoverClickComponents', 'Hover & click components to link'), 'info');
                // Reset drawing state when switching to linking
                drawingState.stopDrawing();
            } else if (item?.toolType === 'drawing') {
                // Reset linking state when switching to drawing
                linkingState.resetLinkingState();
                // Clear component selection when switching to drawing mode
                clearSelection();
                if (toolbarState.setMethodHighlightedComponent) {
                    toolbarState.setMethodHighlightedComponent(null);
                }
                if (item.selectedSubItem) {
                    showUserFeedback(
                        originalT('map.feedback.drawing.clickAndDragPst', {label: item.selectedSubItem.label}) ||
                            `Click and drag to draw ${item.selectedSubItem.label} box`,
                        'info',
                    );
                } else {
                    showUserFeedback(t('map.feedback.drawing.selectPstTypeFirst', 'Select a PST type from the dropdown first'), 'warning');
                }
            } else if (item?.toolType === 'method-application') {
                // Reset linking and drawing state when switching to method application
                linkingState.resetLinkingState();
                drawingState.stopDrawing();
                const methodName = item.methodName || 'method';
                showUserFeedback(
                    originalT('map.feedback.method.hoverApply', {methodName}) || `Hover over components to apply ${methodName} method`,
                    'info',
                );
            } else {
                // Reset all tool states when switching to other tools or deselecting
                linkingState.resetLinkingState();
                drawingState.stopDrawing();
                if (toolbarState.setMethodHighlightedComponent) {
                    toolbarState.setMethodHighlightedComponent(null);
                }

                // Force cleanup of any stuck document event listeners by resetting body styles
                // This is a workaround for PST drag handlers that might be stuck
                try {
                    document.body.style.userSelect = '';
                    document.body.style.webkitUserSelect = '';
                    document.body.style.touchAction = '';
                } catch (error) {
                    console.warn('Error cleaning up body styles:', error);
                }
            }

            console.log('Toolbar item processed:', finalItem?.id || 'none', 'with toolType:', finalItem?.toolType || 'none');
        },
        [toolbarState, linkingState, drawingState, showUserFeedback, clearSelection, t, originalT],
    );

    return (
        <ContextMenuProvider
            mapText={props.mapText}
            onDeleteComponent={componentOps.handleDeleteComponent}
            onDeleteLink={componentOps.handleDeleteLink}
            onEditComponent={componentOps.handleEditComponent}
            onToggleInertia={componentOps.handleToggleInertia}
            onEvolveComponent={componentOps.handleEvolveComponent}
            onChangeMapStyle={handleChangeMapStyle}
            onSetMapSize={handleOpenMapSizeDialog}
            onEditEvolutionStages={handleOpenEvolutionStagesDialog}
            wardleyMap={props.wardleyMap}
            selectionManager={selectionManager}
            onContextMenuReady={setContextMenuActions}>
            <div ref={legacyRef} className={props.mapStyleDefs.className} style={containerStyle} onClick={handlers.handleContainerClick}>
                {(props.showWysiwygToolbar ?? true) && (
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
                        onSnapChange={props.onToolbarSnapChange}
                        mapOnlyView={props.mapOnlyView}
                        toolbarVisible={props.showWysiwygToolbar}
                    />
                )}

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
                        onLinkClick={handlers.handleLinkClick}
                        onLinkContextMenu={handlers.handleLinkContextMenu}
                        onCanvasContextMenu={handlers.handleCanvasContextMenu}
                        isLinkSelected={linkId => selectionManager.isSelected(linkId, 'link')}
                        highlightedPipelineId={handlers.highlightedPipelineId}
                        onPipelineMouseEnter={handlers.handlePipelineMouseEnter}
                        onPipelineMouseLeave={handlers.handlePipelineMouseLeave}
                    />
                </div>
            </div>

            {/* Map Property Dialogs */}
            <MapSizeDialog
                isOpen={mapSizeDialogOpen}
                currentSize={MapPropertiesManager.getCurrentSize(props.mapText)}
                onConfirm={handleConfirmMapSize}
                onCancel={handleCancelMapSize}
            />

            <EvolutionStagesDialog
                isOpen={evolutionStagesDialogOpen}
                currentStages={MapPropertiesManager.getCurrentEvolutionStages(props.mapText)}
                onConfirm={handleConfirmEvolutionStages}
                onCancel={handleCancelEvolutionStages}
            />
        </ContextMenuProvider>
    );
};

// Memoized component to prevent unnecessary re-renders
export const MapView = React.memo(MapViewComponent);

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

const getMapStyle = (toolbarSnapped = false): React.CSSProperties => {
    const toolbarWidth = 48; // Width to reserve for snapped toolbar (48px toolbar + 0px margin, reduced from 80px)

    return {
        width: toolbarSnapped ? `calc(100% - ${toolbarWidth}px)` : '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        marginLeft: toolbarSnapped ? `${toolbarWidth}px` : '0',
        transition: 'width 0.3s ease, margin-left 0.3s ease',
    };
};
