import {
	getMap,
	getPublicMap,
	getUnauthenticatedMap,
} from '../graphql/queries';
import { API } from 'aws-amplify';
import * as Defaults from '../constants/defaults';

export const LoadMap = async (
	mapPersistenceStrategy,
	followOnActions,
	currentId
) => {
	const fetchData = async (query, variables, onceLoaded, strategy) => {
		const response = await API.graphql({
			query,
			variables,
			authMode: strategy.authMode,
			operationName: strategy.operationName,
		});
		console.log('--- Loaded', response);
		onceLoaded(strategy.mapPersistenceStrategy, response.data[query.name]);
	};

	const legacyPublicDataStore = async (id, onceLoaded, strategy) => {
		const fetchUrl = Defaults.ApiEndpoint + 'fetch?id=' + id;
		const response = await fetch(fetchUrl);
		const data = await response.json();
		console.log(data);
		const newObj = {
			id: data.id,
			mapText: data.text,
			mapIterations: data.mapIterations ? JSON.parse(data.mapIterations) : {},
		};
		onceLoaded(strategy, newObj);
	};

	const loadStrategy = {
		[Defaults.MapPersistenceStrategy.Private]: id =>
			fetchData(getMap, { id }, followOnActions, {
				authMode: 'AMAZON_COGNITO_USER_POOLS',
				operationName: 'getMap',
				mapPersistenceStrategy,
			}),
		[Defaults.MapPersistenceStrategy.Public]: id =>
			fetchData(getPublicMap, { id }, followOnActions, {
				authMode: 'API_KEY',
				operationName: 'getPublicMap',
				mapPersistenceStrategy,
			}),
		[Defaults.MapPersistenceStrategy.PublicUnauthenticated]: id =>
			fetchData(getUnauthenticatedMap, { id }, followOnActions, {
				authMode: 'API_KEY',
				operationName: 'getUnauthenticatedMap',
				mapPersistenceStrategy,
			}),
		[Defaults.MapPersistenceStrategy.Legacy]: id =>
			legacyPublicDataStore(id, followOnActions, mapPersistenceStrategy),
	};

	await loadStrategy[mapPersistenceStrategy](currentId);
};
