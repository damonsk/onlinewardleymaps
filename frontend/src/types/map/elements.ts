import { ComponentLabel, IProvideBaseElement } from '../base';

export interface MapComponent {
    maturity: number;
    visibility: number;
}

export interface IPipelineComponent extends IProvideBaseElement {
    components: MapComponent[];
}

export interface MapElement {
    name: string;
    label: ComponentLabel;
    line: number;
    id: string;
    evolved?: boolean;
    evolving?: boolean;
    inertia?: boolean;
    type?: string;
    maturity?: number;
    visibility?: number;
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
    getNonEvolvedElements(): MapElement[];
    getEvolvedElements(): MapElement[];
    getEvolveElements(): MapElement[];
    getMergedElements(): MapElement[];
    geEvolvedOrEvolvingElements(): MapElement[];
    getNoneEvolvedOrEvolvingElements(): MapElement[];
    getNoneEvolvingElements(): MapElement[];
    getMapPipelines(): any[];
}
