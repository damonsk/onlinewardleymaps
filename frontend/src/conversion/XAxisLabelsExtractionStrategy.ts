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

        for (let i = 0; i < lines.length; i++) {
            const element = lines[i];
            const trimmed = element.trim();

            try {
                if (trimmed.indexOf('evolution') === 0) {
                    const evolutionMatch = trimmed.match(/^evolution(?:\s+--(show|hide))?(?:\s+(.+))?$/);
                    if (!evolutionMatch) {
                        throw new Error('Invalid evolution config');
                    }

                    const axisFlag = evolutionMatch[1];
                    const labelsRaw = evolutionMatch[2]?.trim();

                    if (axisFlag) {
                        showEvolutionAxis = axisFlag === 'show';
                    }

                    if (labelsRaw) {
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
                    } else if (!axisFlag) {
                        throw new Error('Evolution labels are required when no axis flag is provided');
                    }
                }

                if (trimmed.indexOf('valuechain') === 0) {
                    const valueChainMatch = trimmed.match(/^valuechain\s+--(show|hide)$/);
                    if (!valueChainMatch) {
                        throw new Error('Invalid valuechain config');
                    }
                    showValueChainAxis = valueChainMatch[1] === 'show';
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
