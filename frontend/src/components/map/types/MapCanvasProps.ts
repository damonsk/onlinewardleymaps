import {EvolutionStages, MapCanvasDimensions, MapDimensions, Offsets} from '../../../constants/defaults';
import {MapTheme} from '../../../types/map/styles';
import {ToolbarItem} from '../../../types/toolbar';
import {UnifiedWardleyMap} from '../../../types/unified/map';
import {UnifiedComponent} from '../../../types/unified/components';

export interface MapCanvasProps {
    wardleyMap: UnifiedWardleyMap;
    mapDimensions: MapDimensions;
    mapCanvasDimensions: MapCanvasDimensions;
    mapStyleDefs: MapTheme;
    mapEvolutionStates: EvolutionStages;
    evolutionOffsets: Offsets;
    mapText: string;
    mutateMapText: (newText: string) => void;
    setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
    setNewComponentContext: React.Dispatch<React.SetStateAction<{x: string; y: string} | null>>;
    launchUrl: (urlId: string) => void;
    showLinkedEvolved: boolean;
    shouldHideNav?: () => void;
    hideNav?: boolean;
    mapAnnotationsPresentation: any;
    handleMapCanvasClick?: (pos: {x: number; y: number}) => void;
}

export interface ToolbarInteractionProps {
    selectedToolbarItem?: ToolbarItem | null;
    onToolbarItemDrop?: (item: ToolbarItem, position: {x: number; y: number}) => void;
    onMouseMove?: (position: {x: number; y: number; nearestComponent?: UnifiedComponent | null}) => void;
}

export interface LinkingInteractionProps {
    onComponentClick?: (component: UnifiedComponent | null) => void;
    linkingState?: 'idle' | 'selecting-source' | 'selecting-target';
    sourceComponent?: UnifiedComponent | null;
    highlightedComponent?: UnifiedComponent | null;
    isDuplicateLink?: boolean;
    isInvalidTarget?: boolean;
    showCancellationHint?: boolean;
    isSourceDeleted?: boolean;
    isTargetDeleted?: boolean;
}

export interface DrawingInteractionProps {
    onMouseDown?: (position: {x: number; y: number}) => void;
    onMouseUp?: (position: {x: number; y: number}) => void;
    isDrawing?: boolean;
    drawingStartPosition?: {x: number; y: number} | null;
    drawingCurrentPosition?: {x: number; y: number};
}

export interface MethodInteractionProps {
    onMethodApplication?: (component: UnifiedComponent, method: string) => void;
    methodHighlightedComponent?: UnifiedComponent | null;
}

export interface UnifiedMapCanvasProps
    extends MapCanvasProps,
        ToolbarInteractionProps,
        LinkingInteractionProps,
        DrawingInteractionProps,
        MethodInteractionProps {}
