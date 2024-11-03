import * as Defaults from '../constants/defaults';
import LegacySaveStrategy from './LegacySaveStrategy';
import { NullSaveStrategy } from './NullSaveStrategy';
import { OwnApiWardleyMap } from './OwnApiWardleyMap';

export const SaveMap = async (
    mapPersistenceStrategy: string,
    mapToPersist: OwnApiWardleyMap,
    hash: string,
    callback: (id: string, data: string) => Promise<void>, // (id: string, data: string) => void,
) => {
    let loadedSaveStrategy = new NullSaveStrategy(callback); // Default
    switch (mapPersistenceStrategy) {
        case Defaults.MapPersistenceStrategy.Legacy:
            loadedSaveStrategy = new LegacySaveStrategy(callback);
            break;
    }
    await loadedSaveStrategy.save(mapToPersist, hash);
};
