import { useFeatureSwitches } from './components/FeatureSwitchesContext';
import { Component, EvolvedElement, Pipeline } from './types/base';
import { IProvideMapElements } from './types/map/elements';

export default class MapElements implements IProvideMapElements {
    private mapComponents: Component[];
    private evolved: EvolvedElement[];
    private pipelines: Pipeline[];

    constructor(
        components: { type: string; collection: Component[] }[],
        evolved: EvolvedElement[],
        pipelines: Pipeline[],
    ) {
        const { enableNewPipelines } = useFeatureSwitches();
        this.mapComponents = components.flatMap((i) => {
            return i.collection.map((c) => ({ ...c, type: i.type }));
        });
        this.evolved = evolved;
        this.pipelines = this.processPipelines(pipelines, this.mapComponents);

        if (enableNewPipelines) {
            const getPipelineChildComponents = this.pipelines.flatMap((p) =>
                p.components.map((c) => ({
                    ...c,
                    type: 'component',
                    pseudoComponent: true,
                    visibility: p.visibility,
                    offsetY: 14,
                })),
            );
            this.mapComponents = this.mapComponents.concat(
                getPipelineChildComponents.map((p) => p as Component),
            );
        }
    }

    private processPipelines(
        pipelines: Pipeline[] | undefined,
        components: Component[],
    ): Pipeline[] {
        if (pipelines === undefined) return [];
        return pipelines.map((e: Pipeline) => {
            const component = components.find((el) => el.name === e.name);
            if (component) {
                e.visibility = component.visibility;
            } else {
                e.hidden = true;
            }
            return e;
        });
    }

    getMapPipelines(): Pipeline[] {
        return this.pipelines;
    }

    getEvolvedElements(): Component[] {
        return this.getEvolveElements().map((el) => {
            const v = this.evolved.find((evd) => evd.name === el.name);
            if (!v) throw new Error(`Evolved element not found for ${el.name}`);
            const r = {
                name: el.name,
                id: el.id + 'ev',
                maturity: el.evolveMaturity,
                visibility: el.visibility,
                evolving: false,
                evolved: true,
                label: v.label,
                override: v.override,
                line: v.line,
                type: el.type,
                offsetY: el.offsetY,
                decorators: v.decorators,
                increaseLabelSpacing: v.increaseLabelSpacing,
                inertia: el.inertia,
                url: el.url,
                pipeline: el.pipeline,
                pseudoComponent: el.pseudoComponent || false,
            } as Component;
            return r;
        });
    }

    getEvolveElements(): Component[] {
        if (this.evolved === undefined) return [];
        return this.evolved.flatMap((e) =>
            this.mapComponents
                .filter((el) => el.name === e.name)
                .map((i) => ({
                    ...i,
                    evolveMaturity: e.maturity,
                    evolving: true,
                })),
        );
    }

    getNoneEvolvingElements(): Component[] {
        return this.mapComponents.filter((el) => el.evolving === false);
    }

    getNoneEvolvedOrEvolvingElements(): Component[] {
        return this.mapComponents.filter(
            (el) =>
                (el.evolving === undefined || el.evolving === false) &&
                (el.evolved === undefined || el.evolved === false),
        );
    }

    geEvolvedOrEvolvingElements(): Component[] {
        return this.mapComponents.filter(
            (el) => el.evolving === true || el.evolved === true,
        );
    }

    getNonEvolvedElements(): Component[] {
        return this.getNoneEvolvingElements().concat(this.getEvolveElements());
    }

    getMergedElements(): Component[] {
        const evolveElements = this.getEvolveElements();
        const noneEvolving = this.getNoneEvolvingElements();
        const evolvedElements = this.getEvolvedElements();
        const collection = noneEvolving
            .concat(evolvedElements)
            .concat(evolveElements)
            .filter((c) => !c.pseudoComponent);

        if (this.pipelines === undefined) return collection;

        return collection.map((e) => ({
            ...e,
            pipeline: this.pipelines.some((el) => el.name === e.name),
        }));
    }
}
