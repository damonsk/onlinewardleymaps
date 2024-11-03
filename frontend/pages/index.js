import React, { useState, useEffect } from 'react';
import MapEnvironment from '../src/components/MapEnvironment';
import * as Defaults from '../src/constants/defaults';
import { useRouter } from 'next/router';

function Map(props) {
	const router = useRouter();
	const { slug } = router.query;
	const [currentId, setCurrentId] = useState('');
	const [mapPersistenceStrategy, setMapPersistenceStrategy] = useState(
		Defaults.MapPersistenceStrategy.Legacy
	);
	const [shouldLoad, setShouldLoad] = useState(false);

	useEffect(() => {
		console.log('slug', slug);
		if (slug === undefined) {
			if (typeof window !== 'undefined' && window.location.hash.length > 0) {
				setMapPersistenceStrategy(Defaults.MapPersistenceStrategy.Legacy);
				let mapId = window.location.hash.replace('#', '');
				if (mapId.indexOf(':') > -1) {
					mapId = mapId.split(':')[1];
				}
				setCurrentId(mapId);
				setShouldLoad(true);
			}
			return;
		}
		if (slug[0] !== undefined) {
			switch (slug[0]) {
				case 'public':
					setMapPersistenceStrategy(
						Defaults.MapPersistenceStrategy.PublicUnauthenticated
					);
					break;
				case 'user':
					setMapPersistenceStrategy(Defaults.MapPersistenceStrategy.Public);
					break;
				case 'private':
					setMapPersistenceStrategy(Defaults.MapPersistenceStrategy.Private);
					break;
			}
		}

		if (slug[1] !== undefined && slug[1] !== null) {
			setCurrentId(slug[1]);
			setShouldLoad(true);
		}
	}, [slug]);

	useEffect(() => {
		console.log('[slug::useEffect::currentId]', currentId);
	}, [currentId]);

	return (
		<React.Fragment>
			<MapEnvironment
				{...props}
				currentId={currentId}
				setCurrentId={setCurrentId}
				mapPersistenceStrategy={mapPersistenceStrategy}
				setMapPersistenceStrategy={setMapPersistenceStrategy}
				shouldLoad={shouldLoad}
				setShoudLoad={setShouldLoad}
			/>
		</React.Fragment>
	);
}

export default Map;
