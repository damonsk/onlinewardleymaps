import React, {MouseEvent} from 'react';
import {MapDimensions} from '../../constants/defaults';
import {MapElements} from '../../processing/MapElements';
import {PSTBounds, PSTCoordinates, PSTElement, ResizeHandle} from '../../types/map/pst';
import {MapTheme} from '../../types/map/styles';
import {UnifiedComponent} from '../../types/unified';
import {ElementGrouping} from './components/ElementGrouping';

interface ModernUnifiedMapContentProps {
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
    
    // Pipeline highlighting
    highlightedPipelineId?: string | null;
    onPipelineMouseEnter?: (pipelineId: string) => void;
    onPipelineMouseLeave?: () => void;
}

const UnifiedMapContent: React.FC<ModernUnifiedMapContentProps> = props => {
    return <ElementGrouping {...props} />;
};

export default UnifiedMapContent;
