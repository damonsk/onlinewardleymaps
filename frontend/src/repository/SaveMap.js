import * as Defaults from '../constants/defaults';
import { LegacySaveStrategy } from './LegacySaveStrategy';

// export const SaveMap = async (
//   mapPersistenceStrategy,
//   mapToPersist,
//   hash,
//   callback,
// ) => {
//   let loadedSaveStrategy = new NullSaveStrategy(callback); // Default

	switch (mapPersistenceStrategy) {
		case Defaults.MapPersistenceStrategy.Legacy:
			loadedSaveStrategy = new LegacySaveStrategy(callback);
			break;
	}

//   await loadedSaveStrategy.save(mapToPersist, hash);
// };
