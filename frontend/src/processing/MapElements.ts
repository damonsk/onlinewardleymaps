import {EvolvedElementData, PipelineData, UnifiedComponent, UnifiedWardleyMap, createUnifiedComponent} from '../types/unified';
import {PSTElement} from '../types/map/pst';
import {extractPSTElementsFromAttitudes} from '../utils/pstElementUtils';

export class MapElements {
    private allComponents: UnifiedComponent[];
    private evolvedElements: EvolvedElementData[];
    private pipelines: PipelineData[];
    private pstElements: PSTElement[];

    constructor(map: UnifiedWardleyMap) {
        this.allComponents = [...map.components, ...map.anchors, ...map.submaps, ...map.markets, ...map.ecosystems];
        this.evolvedElements = map.evolved;
        this.pipelines = map.pipelines;
        this.pstElements = extractPSTElementsFromAttitudes(map.attitudes);

        this.markEvolvingComponents();
        this.markPipelineComponents();
        this.integratePSTElements();
    }

    private markEvolvingComponents(): void {
        const methodComponents = new Set<string>();
        this.allComponents.forEach(component => {
            const hasMethodDecorator =
                component.decorators && (component.decorators.buy || component.decorators.build || component.decorators.outsource);

            if (hasMethodDecorator && component.name) {
                methodComponents.add(component.name);
            }
        });

        this.allComponents = this.allComponents.map(component => {
            if (this.evolvedElements.length > 0) {
                const hasEvolvedElement = this.evolvedElements.some(evolved => evolved.name === component.name);
                const evolved = this.evolvedElements.find(x => x.name === component.name);

                if (hasEvolvedElement) {
                    const increaseLabelSpacing = Math.max(component.increaseLabelSpacing || 0, evolved?.increaseLabelSpacing || 0, 2);
                    let label = component.label || {x: 0, y: 0};
                    if (!label.y || Math.abs(label.y) <= 10) {
                        label = {
                            ...label,
                            y: increaseLabelSpacing * 10,
                        };
                    }

                    if (!label.x || Math.abs(label.x) <= 10) {
                        const xOffset = evolved?.override ? 16 : 5;

                        label = {
                            ...label,
                            x: xOffset,
                        };
                    }

                    return {
                        ...component,
                        evolving: true,
                        evolveMaturity: evolved?.maturity,
                        override: evolved?.override,
                        increaseLabelSpacing: increaseLabelSpacing,
                        label: label,
                    };
                }
            }

            if (methodComponents.has(component.name)) {
                const increaseLabelSpacing = Math.max(component.increaseLabelSpacing || 0, 2);

                let label = component.label || {x: 0, y: 0};

                if (!label.y || Math.abs(label.y) <= 10) {
                    label = {
                        ...label,
                        y: increaseLabelSpacing * 10,
                    };
                }

                if (!label.x || Math.abs(label.x) <= 10) {
                    label = {
                        ...label,
                        x: 5,
                    };
                }

                return {
                    ...component,
                    increaseLabelSpacing: increaseLabelSpacing,
                    label: label,
                };
            }

            return component;
        });
    }

    private markPipelineComponents(): void {
        this.allComponents = this.allComponents.map(component => {
            const isPipelineComponent = this.pipelines.some(pipeline => pipeline.name === component.name);
            if (isPipelineComponent) {
                return {
                    ...component,
                    pipeline: true,
                };
            }
            return component;
        });
    }

    /**
     * Integrate PST elements into the unified component system
     * Converts PST elements to UnifiedComponent format for consistent processing
     */
    private integratePSTElements(): void {
        const pstComponents: UnifiedComponent[] = this.pstElements.map(pstElement => {
            return createUnifiedComponent({
                id: pstElement.id,
                name: pstElement.name || `${pstElement.type}_${pstElement.line}`,
                type: 'pst',
                maturity: pstElement.coordinates.maturity1, // Use left edge as primary maturity
                visibility: pstElement.coordinates.visibility1, // Use top edge as primary visibility
                line: pstElement.line,
                // PST-specific properties
                pstType: pstElement.type,
                pstCoordinates: pstElement.coordinates,
                // Standard component properties
                evolving: false,
                evolved: false,
                inertia: false,
                pseudoComponent: false,
                offsetY: 0,
                label: {x: 0, y: 0},
                increaseLabelSpacing: 0,
                decorators: {
                    ecosystem: false,
                    market: false,
                    buy: false,
                    build: false,
                    outsource: false,
                },
            });
        });

        // Add PST components to the main components array
        this.allComponents = [...this.allComponents, ...pstComponents];
    }

    getAllComponents(): UnifiedComponent[] {
        return this.allComponents;
    }

    getComponentsByType(type: string): UnifiedComponent[] {
        return this.allComponents.filter(c => c.type === type);
    }

    getEvolvingComponents(): UnifiedComponent[] {
        return this.allComponents.filter(c => c.evolving);
    }

    getEvolvedComponents(): UnifiedComponent[] {
        return this.getEvolvingComponents().map(component => {
            const evolvedData = this.evolvedElements.find(e => e.name === component.name);
            if (!evolvedData) {
                throw new Error(`Evolved element not found for ${component.name}`);
            }

            // Calculate appropriate label spacing
            const increaseLabelSpacing = Math.max(evolvedData.increaseLabelSpacing || 0, component.increaseLabelSpacing || 0, 2);

            let label = evolvedData.label || component.label || {x: 0, y: 0};
            if ((!label.x || Math.abs(label.x) <= 10) && evolvedData.override) {
                label = {
                    ...label,
                    x: 16,
                };
            }

            return createUnifiedComponent({
                ...component,
                id: component.id + '_evolved',
                maturity: evolvedData.maturity,
                evolving: false,
                evolved: true,
                label: label,
                override: evolvedData.override || component.override,
                line: evolvedData.line || component.line,
                // Always preserve component decorators unless evolvedData has explicit decorators
                decorators: component.decorators,
                increaseLabelSpacing: increaseLabelSpacing,
            });
        });
    }

    getStaticComponents(): UnifiedComponent[] {
        return this.allComponents.filter(c => !c.evolved);
    }

    getInertiaComponents(): UnifiedComponent[] {
        return this.allComponents.filter(c => c.inertia === true);
    }

    getNeitherEvolvedNorEvolvingComponents(): UnifiedComponent[] {
        return this.allComponents.filter(c => !c.evolving && !c.evolved);
    }

    getNonEvolvingComponents(): UnifiedComponent[] {
        return this.allComponents.filter(c => !c.evolving);
    }

    getNonEvolvedComponents(): UnifiedComponent[] {
        return this.allComponents.filter(c => !c.evolved);
    }

    getEitherEvolvedOrEvolvingComponents(): UnifiedComponent[] {
        return this.allComponents.filter(c => c.evolving || c.evolved);
    }

    getMergedComponents(): UnifiedComponent[] {
        const staticComponents = this.getStaticComponents();
        const evolvedComponents = this.getEvolvedComponents();
        return [...staticComponents, ...evolvedComponents];
    }

    getPipelineComponents(): PipelineData[] {
        return this.pipelines;
    }

    /**
     * Get all PST elements
     */
    getPSTElements(): PSTElement[] {
        return this.pstElements;
    }

    /**
     * Get PST elements by type
     */
    getPSTElementsByType(type: string): PSTElement[] {
        return this.pstElements.filter(element => element.type === type);
    }

    /**
     * Get PST components (UnifiedComponent format)
     */
    getPSTComponents(): UnifiedComponent[] {
        return this.allComponents.filter(component => component.type === 'pst');
    }

    /**
     * Get all components including PST elements
     */
    getAllComponentsIncludingPST(): UnifiedComponent[] {
        return this.allComponents;
    }

    getLegacyAdapter(): any {
        return {
            getAllComponents: () => this.getAllComponents(),
            getComponentsByType: (type: string) => this.getComponentsByType(type),
            getEvolvingComponents: () => this.getEvolvingComponents(),
            getEvolvedComponents: () => this.getEvolvedComponents(),
            getMergedComponents: () => this.getMergedComponents(),
            getPipelineComponents: () => this.getPipelineComponents(),
            getInertiaComponents: () => this.getInertiaComponents(),

            // PST-specific methods
            getPSTElements: () => this.getPSTElements(),
            getPSTElementsByType: (type: string) => this.getPSTElementsByType(type),
            getPSTComponents: () => this.getPSTComponents(),
            getAllComponentsIncludingPST: () => this.getAllComponentsIncludingPST(),

            getEvolveElements: () => this.getEvolvingComponents(),
            getEvolvedElements: () => this.getEvolvedComponents(),
            getMergedElements: () => this.getMergedComponents(),
            getMapPipelines: () => this.getPipelineComponents(),
            getNoneEvolvedOrEvolvingElements: () => this.getNeitherEvolvedNorEvolvingComponents(),
            getNoneEvolvingElements: () => this.getNonEvolvingComponents(),
            getNeitherEvolvedNorEvolvingComponents: () => this.getNeitherEvolvedNorEvolvingComponents(),

            convertToMapElement: (component: UnifiedComponent) => component,
            convertToMapElements: (components: UnifiedComponent[]) => components,
            getEvolvedUnifiedComponents: () => this.getEvolvedComponents(),
        };
    }
}
