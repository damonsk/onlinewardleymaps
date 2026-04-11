import {EvolutionLabel, IParseStrategy} from '../types/base';
import ParseError from './ParseError';

export default class XAxisLabelsExtractionStrategy implements IParseStrategy {
    data: string;
    constructor(data: string) {
        this.data = data;
    }

    apply() {
        const lines = this.data.split('\n');
        const errors = [];
        const defaultEvolution: EvolutionLabel[] = [
            {line1: 'Genesis', line2: ''},
            {line1: 'Custom-Built', line2: ''},
            {line1: 'Product', line2: '(+rental)'},
            {line1: 'Commodity', line2: '(+utility)'},
        ];
        let evolution: EvolutionLabel[] = defaultEvolution;
        let showEvolutionAxis = true;
        let showValueChainAxis = true;
        const parseEvolutionLabels = (labelsRaw: string) => {
            const names = labelsRaw.split('->').map(name => name.trim());
            if (names.length !== 4) {
                throw new Error('Evolution labels must have exactly 4 stages');
            }

            evolution = [
                {line1: names[0], line2: ''},
                {line1: names[1], line2: ''},
                {line1: names[2], line2: ''},
                {line1: names[3], line2: ''},
            ];
        };

        for (let i = 0; i < lines.length; i++) {
            const element = lines[i];
            const trimmed = element.trim();

            try {
                if (trimmed.indexOf('evolution') === 0) {
                    const evolutionHideMatch = trimmed.match(/^evolution\s+--hide(?:\s+(.*))?$/);
                    if (evolutionHideMatch) {
                        showEvolutionAxis = false;
                        const labelsRaw = evolutionHideMatch[1]?.trim();
                        if (labelsRaw) {
                            parseEvolutionLabels(labelsRaw);
                        }
                    } else if (trimmed.match(/^evolution\s+--show(?:\s+.*)?$/)) {
                        throw new Error('Evolution show flag is not supported');
                    } else {
                        const labelsRaw = trimmed.replace(/^evolution\s+/, '').trim();
                        parseEvolutionLabels(labelsRaw);
                    }
                }

                if (trimmed.indexOf('valuechain') === 0) {
                    if (trimmed.match(/^valuechain\s+--hide(?:\s+.*)?$/)) {
                        showValueChainAxis = false;
                    } else if (trimmed.match(/^valuechain\s+--show(?:\s+.*)?$/)) {
                        throw new Error('Valuechain show flag is not supported');
                    } else {
                        throw new Error('Invalid valuechain config. Use valuechain --hide');
                    }
                }
            } catch {
                errors.push(new ParseError(i));
            }
        }

        return {
            evolution,
            showEvolutionAxis,
            showValueChainAxis,
            errors,
        };
    }
}
