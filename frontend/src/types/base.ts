import { ComponentLabel, MapUrls } from '../conversion/Converter';

// Core Component Types
export interface Component {
    url: MapUrls;
    decorators: ComponentDecorator;
    pipeline: any;
    name: string;
    id: string;
    visibility: number;
    type: string;
    maturity: number;
    evolveMaturity?: number;
    evolving: boolean;
    evolved?: boolean;
    pseudoComponent?: boolean;
    offsetY?: number;
    inertia: boolean;
    label: ComponentLabel;
    line: number;
}

export interface ComponentDecorator {
    ecosystem?: boolean;
    market?: boolean;
    method?: string;
}

export interface EvolvedElement {
    maturity: number;
    name: string;
    label: ComponentLabel;
    override?: Record<string, unknown>;
    line?: number;
    decorators: ComponentDecorator;
    increaseLabelSpacing: number;
}

export interface Pipeline {
    name: string;
    components: Component[];
    inertia: boolean;
    visibility: number;
    hidden?: boolean;
}

// Position Updater Types
export type MatcherFunction = (
    line: string,
    identifier: string,
    type: string,
) => boolean;

export type ActionFunction = (line: string, moved: any) => string;

export interface Replacer {
    matcher: MatcherFunction;
    action: ActionFunction;
}

export interface PositionUpdater {
    setSuccessor(positionUpdater: PositionUpdater): unknown;
    update(moved: any, identifier: string): void;
}

// Moved Types
export interface Moved {
    param1: number;
    param2: number;
}

export interface ManyCoordsMoved extends Moved {
    param3: number;
    param4: number;
}

export interface SingleCoordMoved {
    param2: string;
}

// Map Parse Types
export interface MapParseComponent {
    errors: MapParseError[];
}

export interface MapParseError {
    line: number;
    name: string;
}

export interface MapTitleComponent extends MapParseComponent {
    title: string;
}
