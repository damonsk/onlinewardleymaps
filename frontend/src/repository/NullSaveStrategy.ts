import { OwnApiWardleyMap } from './OwnApiWardleyMap';
import { SaveStrategy } from './SaveStrategy';

export class NullSaveStrategy implements SaveStrategy {
    constructor(callback: (id: string, data: string) => void) {
        this.callback = callback;
    }
    callback: (id: string, data: string) => void;
    async save(map: OwnApiWardleyMap, hash: string) {
        console.log('NullSaveStrategy executed', { map, hash });
    }
}
