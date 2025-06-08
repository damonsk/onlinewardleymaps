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
        for (let i = 0; i < lines.length; i++) {
            const element = lines[i];
            try {
                if (element.trim().indexOf('evolution') === 0) {
                    const name = element.split('evolution ')[1].trim().split('->');
                    return {
                        evolution: [
                            {line1: name[0], line2: ''},
                            {line1: name[1], line2: ''},
                            {line1: name[2], line2: ''},
                            {line1: name[3], line2: ''},
                        ],
                    };
                }
            } catch (err) {
                errors.push(new ParseError(i));
            }
        }
        return {
            evolution: [
                {line1: 'Genesis', line2: ''} as EvolutionLabel,
                {line1: 'Custom-Built', line2: ''} as EvolutionLabel,
                {line1: 'Product', line2: '(+rental)'} as EvolutionLabel,
                {line1: 'Commodity', line2: '(+utility)'} as EvolutionLabel,
            ],
            errors,
        };
    }
}
