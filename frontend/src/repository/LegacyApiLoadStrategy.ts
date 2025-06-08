import * as Defaults from '../constants/defaults';
import {LoadStrategy} from './LoadStrategy';

interface FetchedData {
    id: string;
    text: string;
    mapIterations?: string;
}

interface ProcessedData {
    id: string;
    mapText: string;
    mapIterations: any[];
}

export class LegacyLoadStrategy extends LoadStrategy {
    async load(id: string): Promise<void> {
        const fetchUrl: string = `${Defaults.ApiEndpoint}fetch?id=${id}`;
        const response: Response = await fetch(fetchUrl);
        const data: FetchedData = await response.json();
        const newObj: ProcessedData = {
            id: data.id,
            mapText: data.text,
            mapIterations: data.mapIterations ? JSON.parse(data.mapIterations) : [],
        };

        this.callback(Defaults.MapPersistenceStrategy.Legacy, newObj);
    }
}
