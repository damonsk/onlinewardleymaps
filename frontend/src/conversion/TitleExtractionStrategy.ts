import {IParseStrategy} from '../types/base';

export default class TitleExtractionStrategy implements IParseStrategy {
    data: string;
    constructor(data: string) {
        this.data = data;
    }

    apply() {
        if (this.data.trim().length < 1) return {title: 'Untitled Map', errors: []};
        const trimmed = this.data;
        for (let index = 0; index < trimmed.split('\n').length; index++) {
            const element = trimmed.split('\n')[index];
            if (element.indexOf('title') === 0) {
                return {title: element.split('title ')[1].trim(), errors: []};
            }
        }

        return {title: 'Untitled Map', errors: []};
    }
}
