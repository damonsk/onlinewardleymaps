import {
    ComponentDecorator as BaseComponentDecorator, // Alias to avoid conflict if local one exists
    ComponentLabel as BaseComponentLabel,
    MapElement as BaseMapElement,
    IProvideBaseElement,
} from '../base';

export interface MapComponent {
    maturity: number;
    visibility: number;
}

export interface IPipelineComponent extends IProvideBaseElement {
    components: MapComponent[];
}

// This local MapElement definition can remain for other uses if necessary,
// but IProvideMapElements will now use BaseMapElement.
export interface MapElement {
    name: string;
    label: BaseComponentLabel; // Use aliased ComponentLabel from base
    line: number;
    id: string;
    evolved?: boolean;
    evolving?: boolean;
    inertia?: boolean;
    pipeline?: boolean; // This property is specific to this local MapElement
    type?: string;
    maturity?: number;
    visibility?: number;
    override?: string;
    decorators?: BaseComponentDecorator; // Use aliased ComponentDecorator from base
}

export interface Link {
    start: string;
    end: string;
    flowValue?: string;
    flow?: boolean;
    future?: boolean;
    past?: boolean;
    line: number;
    context?: string;
}

export interface LinkResult {
    links: Link[];
}

export interface LinkStrategy {
    start?: string;
    end?: string;
    flow?: boolean;
    future?: boolean;
    past?: boolean;
}

export interface IProvideMapElements {
    getNonEvolvedElements(): BaseMapElement[];
    getEvolvedElements(): BaseMapElement[];
    getEvolveElements(): BaseMapElement[];
    getMergedElements(): BaseMapElement[];
    getEvolvedOrEvolvingElements(): BaseMapElement[];
    getNoneEvolvedOrEvolvingElements(): BaseMapElement[]; // Changed to use BaseMapElement
    getNoneEvolvingElements(): BaseMapElement[];
    getMapPipelines(): any[]; // Return type for pipelines can be refined later if needed
}
