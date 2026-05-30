import {createEmptyMap} from '../../types/unified/map';
import {createPipeline, createUnifiedComponent} from '../../types/unified/components';
import {exportWardleyMapToMermaid} from '../../utils/mermaidWardleyExport';

describe('exportWardleyMapToMermaid', () => {
    it('exports components, links, notes, evolution, and pipeline blocks to Mermaid Wardley syntax', () => {
        const map = {
            ...createEmptyMap(),
            title: 'Tea Shop',
            presentation: {
                ...createEmptyMap().presentation,
                size: {width: 1200, height: 700},
            },
            anchors: [
                createUnifiedComponent({
                    id: 'anchor-1',
                    name: 'User',
                    type: 'anchor',
                    maturity: 0.95,
                    visibility: 0.95,
                }),
            ],
            components: [
                createUnifiedComponent({
                    id: 'component-1',
                    name: 'Kettle',
                    type: 'component',
                    maturity: 0.57,
                    visibility: 0.45,
                    inertia: true,
                }),
            ],
            pipelines: [
                createPipeline({
                    id: 'pipeline-1',
                    name: 'Kettle',
                    visibility: 0.45,
                    components: [
                        {id: 'child-1', name: 'Pipeline Component 1', maturity: 0.3, visibility: 0, label: {x: 0, y: 0}},
                        {id: 'child-2', name: 'Pipeline Component 2', maturity: 0.6, visibility: 0, label: {x: 0, y: 0}},
                    ],
                }),
            ],
            links: [
                {start: 'User', end: 'Kettle', flow: true, future: false, past: false},
                {start: 'Pipeline Component 1', end: 'Kettle', flow: false, future: false, past: false},
            ],
            evolved: [
                {name: 'Kettle', maturity: 0.82},
            ],
            notes: [
                {id: 'note-1', text: 'Needs review', maturity: 0.4, visibility: 0.55, line: 10},
            ],
        };

        const exported = exportWardleyMapToMermaid(map);

        expect(exported).toContain('wardley-beta');
        expect(exported).toContain('title Tea Shop');
        expect(exported).toContain('size [1200, 700]');
        expect(exported).toContain('anchor User [0.95, 0.95]');
        expect(exported).toContain('component Kettle [0.45, 0.57] (inertia)');
        expect(exported).toContain('pipeline Kettle {');
        expect(exported).toContain('  component Pipeline Component 1 [0.3]');
        expect(exported).toContain('User +> Kettle');
        expect(exported).toContain('Pipeline Component 1 -> Kettle');
        expect(exported).toContain('evolve Kettle 0.82');
        expect(exported).toContain('note "Needs review" [0.55, 0.4]');
    });
});
