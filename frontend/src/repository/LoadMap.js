import {
    getMap,
    getPublicMap,
    getUnauthenticatedMap,
} from '../graphql/queries';
import * as Defaults from '../constants/defaults';
import { LegacyLoadStrategy } from './LegacyApiLoadStrategy';
import { GraphQlLoadStrategy } from './GraphQlLoadStrategy';

export const LoadMap = async (mapPersistenceStrategy, followOnActions, id) => {
    const loadStrategy = {
        [Defaults.MapPersistenceStrategy.Private]: () =>
            new GraphQlLoadStrategy(
                {
                    query: getMap,
                    // authMode: 'AMAZON_COGNITO_USER_POOLS',
                    operationName: 'getMap',
                    mapPersistenceStrategy,
                },
                followOnActions,
            ),
        [Defaults.MapPersistenceStrategy.Public]: () =>
            new GraphQlLoadStrategy(
                {
                    query: getPublicMap,
                    // authMode: 'API_KEY',
                    operationName: 'getPublicMap',
                    mapPersistenceStrategy,
                },
                followOnActions,
            ),
        [Defaults.MapPersistenceStrategy.PublicUnauthenticated]: () =>
            new GraphQlLoadStrategy(
                {
                    query: getUnauthenticatedMap,
                    // authMode: 'API_KEY',
                    operationName: 'getUnauthenticatedMap',
                    mapPersistenceStrategy,
                },
                followOnActions,
            ),
        [Defaults.MapPersistenceStrategy.Legacy]: () =>
            new LegacyLoadStrategy(followOnActions),
    };

    await loadStrategy[mapPersistenceStrategy]().load(id);
};
