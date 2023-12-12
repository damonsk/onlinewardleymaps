import React, { useState, useEffect } from 'react';
import MapEnvironment from '../src/components/MapEnvironment';
import * as Defaults from '../src/constants/defaults';
import { useRouter } from 'next/router';
import { featureSwitches } from '../src/constants/featureswitches';

function Map(props) {
	const router = useRouter();
	const { user } = props;
	const { slug } = router.query;
	const [currentId, setCurrentId] = useState('');
	const [mapOwner, setMapOwner] = useState();
	const [isMapReadOnly, setMapReadOnly] = useState(false);
	const [canSaveMap, setCanSaveMap] = useState(false);
	const [mapPersistenceStrategy, setMapPersistenceStrategy] = useState(
		featureSwitches.enableDashboard === true
			? Defaults.MapPersistenceStrategy.PublicUnauthenticated
			: Defaults.MapPersistenceStrategy.Legacy
	);
	const [shouldLoad, setShouldLoad] = useState(false);

	// forcing build. I'll fix it later.
	useEffect(() => {
		setMapOwner(false);
		setMapReadOnly(false);
	}, [canSaveMap]);

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

	useEffect(() => {
		if (
			mapPersistenceStrategy ===
			Defaults.MapPersistenceStrategy.PublicUnauthenticated
		)
			setCanSaveMap(true);
		if (mapOwner) {
			console.log('--- MapOwner: ' + mapOwner);
			if (user !== null && mapOwner === user.username) {
				setCanSaveMap(true);
				console.log('--- Can Save Map (MapOwner)');
				return;
			}
			if (
				user !== null &&
				mapOwner !== user.username &&
				mapPersistenceStrategy !== Defaults.MapPersistenceStrategy.Private &&
				!isMapReadOnly
			) {
				setCanSaveMap(true);
				console.log('--- Can Save Map (Public, Logged In, Not Read Only)');
				return;
			}
			console.log('--- Cannot Save Map');
			setCanSaveMap(false);
		}
	}, [mapOwner, user, isMapReadOnly, mapPersistenceStrategy]);

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
