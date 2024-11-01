import * as Defaults from '../constants/defaults';
import { SaveStrategy } from './SaveStrategy';
import { LegacySaveStrategy } from './LegacySaveStrategy';

export const SaveMap = async (
	mapPersistenceStrategy,
	mapToPersist,
	hash,
	callback
) => {
	let loadedSaveStrategy = new SaveStrategy(callback); // Default

	switch (mapPersistenceStrategy) {
		case Defaults.MapPersistenceStrategy.Legacy:
			loadedSaveStrategy = new LegacySaveStrategy(callback);
			break;
	}

	await loadedSaveStrategy.save(mapToPersist, hash);
};
