import React, {MouseEvent} from 'react';
import {MapDimensions} from '../../../constants/defaults';
import {MapElements} from '../../../processing/MapElements';
import {PSTBounds, PSTCoordinates, PSTElement, ResizeHandle} from '../../../types/map/pst';
import {MapTheme} from '../../../types/map/styles';
import {UnifiedComponent} from '../../../types/unified';
import {AnnotationRenderer} from '../renderers/AnnotationRenderer';
import {ComponentRenderer} from '../renderers/ComponentRenderer';
import {LinkRenderer} from '../renderers/LinkRenderer';
import {PSTRenderer} from '../renderers/PSTRenderer';

interface ElementGroupingProps {
    mapAttitudes: any[];
    mapDimensions: MapDimensions;
    mapStyleDefs: MapTheme;
    mapText: string;
    mutateMapText: (text: string) => void;
    scaleFactor: number;
    mapElementsClicked: Array<{
        el: UnifiedComponent;
        e: MouseEvent<Element>;
    }>;
    links: any[];
    mapElements: MapElements;
    evolutionOffsets: {
        commodity: number;
        product: number;
        custom: number;
    };
    enableNewPipelines: boolean;
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    clicked: (data: {el: any; e: MouseEvent<Element> | null}) => void;
    enableAccelerators: boolean;
    mapAccelerators: UnifiedComponent[];
    mapNotes: any[];
    mapAnnotations: any[];
    mapAnnotationsPresentation: any;
    launchUrl?: (url: string) => void;
    mapMethods: any[];
    
    // New props for linking functionality
    linkingState?: 'idle' | 'selecting-source' | 'selecting-target';
    sourceComponent?: UnifiedComponent | null;
    mousePosition?: {x: number; y: number};
    highlightedComponent?: UnifiedComponent | null;
    isDuplicateLink?: boolean;
    isInvalidTarget?: boolean;
    showCancellationHint?: boolean;
    isSourceDeleted?: boolean;
    isTargetDeleted?: boolean;
    
    // New props for PST drawing functionality
    isDrawing?: boolean;
    drawingStartPosition?: {x: number; y: number} | null;
    drawingCurrentPosition?: {x: number; y: number};
    selectedToolbarItem?: any;
    
    // New props for method application functionality
    methodHighlightedComponent?: UnifiedComponent | null;
    
    // New props for PST resize functionality
    hoveredPSTElement?: PSTElement | null;
    resizingPSTElement?: PSTElement | null;
    resizeHandle?: ResizeHandle | null;
    resizePreviewBounds?: PSTBounds | null;
    keyboardModifiers?: {maintainAspectRatio: boolean; resizeFromCenter: boolean};
    onPSTHover?: (element: PSTElement | null) => void;
    onPSTResizeStart?: (element: PSTElement, handle: ResizeHandle, startPosition: {x: number; y: number}) => void;
    onPSTResizeMove?: (handle: ResizeHandle, currentPosition: {x: number; y: number}) => void;
    onPSTResizeEnd?: (element: PSTElement, newCoordinates: PSTCoordinates) => void;
    
    // New props for PST drag functionality
    draggingPSTElement?: PSTElement | null;
    dragPreviewBounds?: PSTBounds | null;
    onPSTDragStart?: (element: PSTElement, startPosition: {x: number; y: number}) => void;
    onPSTDragMove?: (element: PSTElement, currentPosition: {x: number; y: number}) => void;
    onPSTDragEnd?: (element: PSTElement) => void;
    
    // New props for link selection functionality
    onLinkClick?: (linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number}) => void;
    onLinkContextMenu?: (
        linkInfo: {start: string; end: string; flow?: boolean; flowValue?: string; line: number},
        event: React.MouseEvent,
    ) => void;
    isLinkSelected?: (linkId: string) => boolean;
}

export const ElementGrouping: React.FC<ElementGroupingProps> = (props) => {
    return (
        <g id="mapContent">
            {/* PST Elements - Rendered first as they appear behind other elements */}
            <PSTRenderer
                pstElements={props.mapElements.getPSTElements()}
                mapDimensions={props.mapDimensions}
                mapStyleDefs={props.mapStyleDefs}
                scaleFactor={props.scaleFactor}
                mapText={props.mapText}
                mutateMapText={props.mutateMapText}
                hoveredPSTElement={props.hoveredPSTElement}
                resizingPSTElement={props.resizingPSTElement}
                draggingPSTElement={props.draggingPSTElement}
                resizeHandle={props.resizeHandle}
                resizePreviewBounds={props.resizePreviewBounds}
                dragPreviewBounds={props.dragPreviewBounds}
                keyboardModifiers={props.keyboardModifiers}
                onPSTHover={props.onPSTHover}
                onPSTResizeStart={props.onPSTResizeStart}
                onPSTResizeMove={props.onPSTResizeMove}
                onPSTResizeEnd={props.onPSTResizeEnd}
                onPSTDragStart={props.onPSTDragStart}
                onPSTDragMove={props.onPSTDragMove}
                onPSTDragEnd={props.onPSTDragEnd}
            />

            {/* Links - Rendered after PST but before components */}
            <LinkRenderer
                mapDimensions={props.mapDimensions}
                mapStyleDefs={props.mapStyleDefs}
                scaleFactor={props.scaleFactor}
                mapElements={props.mapElements}
                links={props.links}
                mapElementsClicked={props.mapElementsClicked}
                evolutionOffsets={props.evolutionOffsets}
                onLinkClick={props.onLinkClick}
                onLinkContextMenu={props.onLinkContextMenu}
                isLinkSelected={props.isLinkSelected}
                linkingState={props.linkingState}
                sourceComponent={props.sourceComponent}
                mousePosition={props.mousePosition}
                highlightedComponent={props.highlightedComponent}
                isDuplicateLink={props.isDuplicateLink}
                isInvalidTarget={props.isInvalidTarget}
                showCancellationHint={props.showCancellationHint}
                isSourceDeleted={props.isSourceDeleted}
                isTargetDeleted={props.isTargetDeleted}
            />

            {/* Components - Main map components rendered after links */}
            <ComponentRenderer
                mapElements={props.mapElements}
                mapDimensions={props.mapDimensions}
                mapStyleDefs={props.mapStyleDefs}
                mapText={props.mapText}
                mutateMapText={props.mutateMapText}
                scaleFactor={props.scaleFactor}
                setHighlightLine={props.setHighlightLine}
                clicked={props.clicked}
                launchUrl={props.launchUrl}
                enableAccelerators={props.enableAccelerators}
                mapAccelerators={props.mapAccelerators}
                methodHighlightedComponent={props.methodHighlightedComponent}
                selectedToolbarItem={props.selectedToolbarItem}
            />

            {/* Annotations, Notes, and Drawing Previews - Rendered on top */}
            <AnnotationRenderer
                mapDimensions={props.mapDimensions}
                mapStyleDefs={props.mapStyleDefs}
                mapText={props.mapText}
                mutateMapText={props.mutateMapText}
                scaleFactor={props.scaleFactor}
                mapNotes={props.mapNotes}
                mapAnnotations={props.mapAnnotations}
                mapAnnotationsPresentation={props.mapAnnotationsPresentation}
                mapElements={props.mapElements}
                setHighlightLine={props.setHighlightLine}
                clicked={props.clicked}
                enableNewPipelines={props.enableNewPipelines}
                isDrawing={props.isDrawing}
                drawingStartPosition={props.drawingStartPosition}
                drawingCurrentPosition={props.drawingCurrentPosition}
                selectedToolbarItem={props.selectedToolbarItem}
            />
        </g>
    );
};