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

class SaveStrategy {
	constructor(callback) {
		this.callback = callback;
	}

	// eslint-disable-next-line no-unused-vars
	async save(map, hash) {
		throw new Error('Save method must be implemented by subclasses');
	}
}

class LegacySaveStrategy extends SaveStrategy {
	async save(map, hash) {
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

class PrivateSaveStrategy extends SaveStrategy {
	async save(map, hash) {
		const input = Object.assign(map, { id: hash });

		const response = await API.graphql({
			query: hash ? updateMap : createMap,
			variables: { input },
			authMode: 'AMAZON_COGNITO_USER_POOLS',
			operationName: hash ? 'updateMap' : 'createMap',
		});

		const data = response.data[hash ? 'updateMap' : 'createMap'];
		this.callback(data.id, response);
	}
}

class PublicSaveStrategy extends SaveStrategy {
	async save(map, hash) {
		const input = Object.assign(map, { id: hash.split(':')[1] });

		const response = await API.graphql({
			query: hash ? updatePublicMap : createPublicMap,
			variables: { input },
			authMode: 'AMAZON_COGNITO_USER_POOLS',
			operationName: hash ? 'updatePublicMap' : 'createPublicMap',
		});

		const data = response.data[hash ? 'updatePublicMap' : 'createPublicMap'];
		this.callback(data.id, response);
	}
}

class PublicUnauthedSaveStrategy extends SaveStrategy {
	async save(map, hash) {
		const input = Object.assign(map, { id: hash.split(':')[1] });

		const response = await API.graphql({
			query: hash ? updateUnauthenticatedMap : createUnauthenticatedMap,
			variables: { input },
			authMode: 'API_KEY',
			operationName: hash
				? 'updateUnauthenticatedMap'
				: 'createUnauthenticatedMap',
		});

		const data =
			response.data[
				hash ? 'updateUnauthenticatedMap' : 'createUnauthenticatedMap'
			];
		this.callback(data.id, response);
	}
}

export const SaveMap = async (
	mapPersistenceStrategy,
	mapToPersist,
	hash,
	callback
) => {
	let loadedSaveStrategy = new SaveStrategy(callback); // Default

	switch (mapPersistenceStrategy) {
		case Defaults.MapPersistenceStrategy.Private:
			loadedSaveStrategy = new PrivateSaveStrategy(callback);
			break;
		case Defaults.MapPersistenceStrategy.Public:
			loadedSaveStrategy = new PublicSaveStrategy(callback);
			break;
		case Defaults.MapPersistenceStrategy.Legacy:
			loadedSaveStrategy = new LegacySaveStrategy(callback);
			break;
		default:
		case Defaults.MapPersistenceStrategy.PublicUnauthenticated:
			loadedSaveStrategy = new PublicUnauthedSaveStrategy(callback);
			break;
	}

	await loadedSaveStrategy.save(mapToPersist, hash);
};
