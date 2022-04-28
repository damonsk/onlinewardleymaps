import * as Defaults from '../constants/defaults';
import { API } from 'aws-amplify';
import {
	createMap,
	createPublicMap,
	createUnauthenticatedMap,
	updateMap,
	updatePublicMap,
	updateUnauthenticatedMap,
} from '../graphql/mutations';

export const SaveMap = async (
	mapPersistenceStrategy,
	mapToPersist,
	hash,
	callback
) => {
	let loadedSaveStrategy = () => console.log('No save strategy loaded');

	switch (mapPersistenceStrategy) {
		case Defaults.MapPersistenceStrategy.Private:
			loadedSaveStrategy = privateSave;
			break;
		case Defaults.MapPersistenceStrategy.Public:
			loadedSaveStrategy = publicSave;
			break;
		case Defaults.MapPersistenceStrategy.Legacy:
			loadedSaveStrategy = legacySave;
			break;
		default:
		case Defaults.MapPersistenceStrategy.PublicUnauthenticated:
			loadedSaveStrategy = publicUnauthedSave;
			break;
	}

	await loadedSaveStrategy(mapToPersist, hash, callback);
};

const legacySave = async (map, hash, callback) => {
	fetch(Defaults.ApiEndpoint + 'save', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
		body: JSON.stringify(Object.assign(map, { id: hash.split(':')[1] })),
		// body: JSON.stringify({ id: hash, text: mapText, meta: metaText, mapIterations: JSON.stringify(mapIterations) }),
	})
		.then(resp => resp.json())
		.then(data => {
			//window.location.hash = '#' + data.id;
			callback(data.id, data);
		})
		.catch(function(error) {
			console.log('Request failed', error);
			// setCurrentUrl('(could not save map, please try again)');
		});
};

const privateSave = async (map, hash, callback) => {
	if (hash.length > 0) {
		const r = await API.graphql({
			query: updateMap,
			variables: { input: Object.assign(map, { id: hash.split(':')[1] }) },
			authMode: 'AMAZON_COGNITO_USER_POOLS',
			operationName: 'updateMap',
		});
		callback(r.data.updateMap.id, r);
	} else {
		const r = await API.graphql({
			query: createMap,
			operationName: 'createMap',
			variables: { input: map },
			authMode: 'AMAZON_COGNITO_USER_POOLS',
		});
		callback(r.data.createMap.id, r);
	}
};

const publicSave = async (map, hash, callback) => {
	if (hash.length > 0) {
		const r = await API.graphql({
			query: updatePublicMap,
			operationName: 'updatePublicMap',
			variables: {
				input: Object.assign(map, { id: hash.split(':')[1] }),
			},
			authMode: 'AMAZON_COGNITO_USER_POOLS',
		});
		callback(r.data.updatePublicMap.id, r);
	} else {
		const r = await API.graphql({
			query: createPublicMap,
			variables: { input: map },
			authMode: 'AMAZON_COGNITO_USER_POOLS',
		});
		callback(r.data.createPublicMap.id, r);
	}
};

const publicUnauthedSave = async (map, hash, callback) => {
	if (hash.length > 0) {
		const r = await API.graphql({
			query: updateUnauthenticatedMap,
			operationName: 'updateUnauthenticatedMap',
			variables: {
				input: Object.assign(map, { id: hash.split(':')[1] }),
			},
			authMode: 'API_KEY',
		});
		callback(r.data.updateUnauthenticatedMap.id, r);
	} else {
		const r = await API.graphql({
			query: createUnauthenticatedMap,
			operationName: 'createUnauthenticatedMap',
			variables: { input: map },
			authMode: 'API_KEY',
		});
		callback(r.data.createUnauthenticatedMap.id, r);
	}
};
