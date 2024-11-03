import * as Defaults from '../constants/defaults';
import { OwnApiWardleyMap } from './OwnApiWardleyMap';
import { SaveStrategy } from './SaveStrategy';

export default class LegacySaveStrategy implements SaveStrategy {
    callback: (id: string, data: string) => void;

    constructor(callback: (id: string, data: string) => void) {
        this.callback = callback;
    }

    async save(map: OwnApiWardleyMap, hash: string) {
        const response = await fetch(Defaults.ApiEndpoint + 'save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({
                id: hash
                    ? hash.includes('clone:')
                        ? hash.split('clone:')[1]
                        : hash
                    : '',
                text: map.mapText,
                mapIterations: JSON.stringify(map.mapIterations),
            }),
        });

        const data = await response.json();
        this.callback(data.id, data);
    }
}
