import { MapPersistenceStrategy } from '../constants/defaults';
import {
    GraphQlSaveStrategy,
    GraphQlSaveStrategyOptions,
} from './GraphQlSaveStrategy';
import LegacySaveStrategy from './LegacySaveStrategy';
import { NullSaveStrategy } from './NullSaveStrategy';

import {
    createMap,
    createPublicMap,
    createUnauthenticatedMap,
    updateMap,
    updatePublicMap,
    updateUnauthenticatedMap,
} from '../graphql/mutations';
import { OwnApiWardleyMap } from './OwnApiWardleyMap';

export const SaveMap = async (
    mapPersistenceStrategy: MapPersistenceStrategy,
    mapToPersist: OwnApiWardleyMap,
    hash: string,
    callback: (id: string, data: string) => Promise<void>, // (id: string, data: string) => void,
) => {
    let loadedSaveStrategy = new NullSaveStrategy(callback); // Default

    switch (mapPersistenceStrategy) {
        case MapPersistenceStrategy.Private:
            loadedSaveStrategy = new GraphQlSaveStrategy(
                {
                    query: hash ? updateMap : createMap,
                    authMode: 'userPool',
                } as GraphQlSaveStrategyOptions,
                callback,
            );
            break;
        case MapPersistenceStrategy.Public:
            loadedSaveStrategy = new GraphQlSaveStrategy(
                {
                    query: hash ? updatePublicMap : createPublicMap,
                    authMode: 'userPool',
                } as GraphQlSaveStrategyOptions,
                callback,
            );
            break;
        case MapPersistenceStrategy.Legacy:
            loadedSaveStrategy = new LegacySaveStrategy(callback);
            break;
        default:
        case MapPersistenceStrategy.PublicUnauthenticated:
            loadedSaveStrategy = new GraphQlSaveStrategy(
                {
                    query: hash
                        ? updateUnauthenticatedMap
                        : createUnauthenticatedMap,
                    authMode: 'apiKey',
                } as GraphQlSaveStrategyOptions,
                callback,
            );
            break;
    }

    await loadedSaveStrategy.save(mapToPersist, hash);
};
