// import {
// 	getMap,
// 	getPublicMap,
// 	getUnauthenticatedMap,
// } from '../graphql/queries';
import * as Defaults from '../constants/defaults';
import { LegacyLoadStrategy } from './LegacyApiLoadStrategy';
// import { GraphQlLoadStrategy } from './GraphQlLoadStrategy';

export const LoadMap = async (mapPersistenceStrategy, followOnActions, id) => {
	const loadStrategy = {
		[Defaults.MapPersistenceStrategy.Legacy]: () =>
			new LegacyLoadStrategy(followOnActions),
	};

	await loadStrategy[mapPersistenceStrategy]().load(id);
};
