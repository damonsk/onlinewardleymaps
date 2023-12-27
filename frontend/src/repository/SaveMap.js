import * as Defaults from '../constants/defaults';
import { SaveStrategy } from './SaveStrategy';
import { LegacySaveStrategy } from './LegacySaveStrategy';
import { GraphQlSaveStrategy } from './GraphQlSaveStrategy';

import {
	createMap,
	updateMap,
	createPublicMap,
	updatePublicMap,
	createUnauthenticatedMap,
	updateUnauthenticatedMap,
} from '../graphql/mutations';

export const SaveMap = async (
	mapPersistenceStrategy,
	mapToPersist,
	hash,
	callback
) => {
	let loadedSaveStrategy = new SaveStrategy(callback); // Default

	switch (mapPersistenceStrategy) {
		case Defaults.MapPersistenceStrategy.Private:
			loadedSaveStrategy = new GraphQlSaveStrategy(
				{
					query: hash ? updateMap : createMap,
					opeerationName: hash ? 'updateMap' : 'createMap',
					authMode: 'AMAZON_COGNITO_USER_POOLS',
				},
				callback
			);
			break;
		case Defaults.MapPersistenceStrategy.Public:
			loadedSaveStrategy = new GraphQlSaveStrategy(
				{
					query: hash ? updatePublicMap : createPublicMap,
					authMode: 'AMAZON_COGNITO_USER_POOLS',
					operationName: hash ? 'updatePublicMap' : 'createPublicMap',
				},
				callback
			);
			break;
		case Defaults.MapPersistenceStrategy.Legacy:
			loadedSaveStrategy = new LegacySaveStrategy(callback);
			break;
		default:
		case Defaults.MapPersistenceStrategy.PublicUnauthenticated:
			loadedSaveStrategy = new GraphQlSaveStrategy(
				{
					query: hash ? updateUnauthenticatedMap : createUnauthenticatedMap,
					authMode: 'API_KEY',
					operationName: hash
						? 'updateUnauthenticatedMap'
						: 'createUnauthenticatedMap',
				},
				callback
			);
			break;
	}

	await loadedSaveStrategy.save(mapToPersist, hash);
};
