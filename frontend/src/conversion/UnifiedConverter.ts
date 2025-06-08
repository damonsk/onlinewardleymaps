import {IProvideFeatureSwitches, WardleyMap} from '../types/base';
import {
    EvolvedElementData,
    FlowLink,
    PipelineData,
    UnifiedComponent,
    UnifiedWardleyMap,
    createEmptyMap,
    createUnifiedComponent,
} from '../types/unified';
import Converter from './Converter';

interface LabelOffset {
    x: number;
    y: number;
}

export class UnifiedConverter {
    private legacyConverter: Converter;

    constructor(featureSwitches: IProvideFeatureSwitches) {
        this.legacyConverter = new Converter(featureSwitches);
    }

    parse(mapText: string): UnifiedWardleyMap {
        const legacyMap = this.legacyConverter.parse(mapText);
        return this.transformToUnifiedMap(legacyMap);
    }

    private transformToUnifiedMap(legacyMap: WardleyMap): UnifiedWardleyMap {
        const unifiedMap = createEmptyMap();
        this.copyBasicProperties(legacyMap, unifiedMap);
        this.transformAllComponentTypes(legacyMap, unifiedMap);
        unifiedMap.evolved = this.transformEvolvedElements(legacyMap.evolved || []);
        unifiedMap.pipelines = this.transformPipelines(legacyMap.pipelines || [], this.getAllComponents(unifiedMap));
        unifiedMap.links = this.transformLinks(legacyMap.links || []);
        this.copyAdditionalProperties(legacyMap, unifiedMap);
        return unifiedMap;
    }

    private copyBasicProperties(source: WardleyMap, target: UnifiedWardleyMap): void {
        target.title = source.title || '';
        target.presentation = source.presentation;
        target.errors = source.errors || [];
        target.evolution = source.evolution || [];
    }

    private copyAdditionalProperties(source: WardleyMap, target: UnifiedWardleyMap): void {
        target.annotations = source.annotations || [];
        target.notes = source.notes || [];
        target.urls = source.urls || [];
        target.attitudes = source.attitudes || [];
        target.accelerators = source.accelerators || [];
    }

    private transformAllComponentTypes(legacyMap: WardleyMap, unifiedMap: UnifiedWardleyMap): void {
        unifiedMap.components = this.transformComponents(legacyMap.elements || [], 'component');
        unifiedMap.anchors = this.transformComponents(legacyMap.anchors || [], 'anchor');
        unifiedMap.submaps = this.transformComponents(legacyMap.submaps || [], 'submap');
    }

    private transformComponents(legacyComponents: any[], type: string): UnifiedComponent[] {
        return legacyComponents.map(component => {
            return createUnifiedComponent({
                id: component.id || this.generateId(component.name, type),
                name: component.name || '',
                type: type,
                maturity: component.maturity || 0,
                visibility: component.visibility || 0,
                line: component.line,
                label: component.label,
                evolving: component.evolving || false,
                evolved: component.evolved || false,
                evolveMaturity: component.evolveMaturity,
                inertia: component.inertia || false,
                pseudoComponent: component.pseudoComponent || false,
                offsetY: component.offsetY || 0,
                decorators: component.decorators,
                override: component.override,
                url: component.url,
                pipeline: component.pipeline || false,
                increaseLabelSpacing: component.increaseLabelSpacing,
            });
        });
    }

    private transformEvolvedElements(legacyEvolved: any[]): EvolvedElementData[] {
        return legacyEvolved.map(evolved => {
            return {
                name: evolved.name || '',
                maturity: evolved.maturity || 0,
                label: evolved.label,
                override: evolved.override,
                line: evolved.line,
                decorators: evolved.decorators,
                increaseLabelSpacing: evolved.increaseLabelSpacing,
            };
        });
    }

    private transformPipelines(legacyPipelines: any[], allComponents?: UnifiedComponent[]): PipelineData[] {
        return legacyPipelines.map(pipeline => {
            const transformedPipeline: PipelineData = {
                id: pipeline.id || this.generateId(pipeline.name, 'pipeline'),
                name: pipeline.name || '',
                visibility: pipeline.visibility || 0,
                line: pipeline.line,
                components: this.transformPipelineComponents(pipeline.components || []),
                inertia: pipeline.inertia || false,
                hidden: pipeline.hidden || false,
                maturity1: pipeline.maturity1,
                maturity2: pipeline.maturity2,
            };

            this.processPipelineVisibility(transformedPipeline, allComponents);

            return transformedPipeline;
        });
    }

    private transformPipelineComponents(components: any[]): {
        id: string;
        name: string;
        maturity: number;
        visibility: number;
        line: number;
        label: LabelOffset;
    }[] {
        return components.map(comp => ({
            id: comp.id || this.generateId(comp.name, 'pipelinecomponent'),
            name: comp.name || '',
            maturity: comp.maturity || 0,
            visibility: comp.visibility || 0,
            line: comp.line,
            label: comp.label || {x: 0, y: 0},
        }));
    }

    private processPipelineVisibility(pipeline: PipelineData, allComponents?: UnifiedComponent[]): void {
        if (!allComponents) return;

        const matchingComponent = allComponents.find(component => component.name === pipeline.name);

        if (matchingComponent) {
            pipeline.visibility = matchingComponent.visibility;
        } else {
            pipeline.hidden = true;
        }
    }

    private transformLinks(legacyLinks: any[]): FlowLink[] {
        return legacyLinks.map(link => ({
            start: link.start || '',
            end: link.end || '',
            line: link.line,
            flow: link.flow !== false, // Default to true if not explicitly false
            flowValue: link.flowValue,
            future: link.future || false,
            past: link.past || false,
            context: link.context,
        }));
    }

    private generateId(name: string, type: string): string {
        return `${type}_${name.replace(/\s+/g, '_').toLowerCase()}`;
    }

    getAllComponents(map: UnifiedWardleyMap): UnifiedComponent[] {
        return [...map.components, ...map.anchors, ...map.submaps, ...map.markets, ...map.ecosystems];
    }

    stripComments(data: string): string {
        return this.legacyConverter.stripComments(data);
    }
}
