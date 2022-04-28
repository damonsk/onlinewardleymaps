import React, { useState, useEffect } from 'react';
import * as Defaults from '../src/constants/defaults';
import { useRouter } from 'next/router';
import MapEnvironment from '../src/components/MapEnvironment';

function Map(props) {

	const {
		user
	} = props;

	const router = useRouter();
  	const { slug } = router.query;
	const [currentId, setCurrentId] = useState();
	const [mapOwner, setMapOwner] = useState();
	const [isMapReadOnly, setMapReadOnly] = useState(false);
	const [canSaveMap, setCanSaveMap] = useState(false);
	const [mapPersistenceStrategy, setMapPersistenceStrategy] = useState(
		Defaults.MapPersistenceStrategy.PublicUnauthenticated
	);
	const [shouldLoad, setShouldLoad] = useState(false);

	useEffect(() => {
		console.log("slug", slug);
		if(slug === undefined) {
			if (window.location.hash.length > 0) {
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
		if(slug[0] !== undefined && slug[0] === 'public'){
			setMapPersistenceStrategy(Defaults.MapPersistenceStrategy.PublicUnauthenticated);
		}
		if(slug[0] !== undefined && slug[0] === 'user'){
			setMapPersistenceStrategy(Defaults.MapPersistenceStrategy.Public);
		}
		if(slug[0] !== undefined && slug[0] === 'private'){
			setMapPersistenceStrategy(Defaults.MapPersistenceStrategy.Private);
		}
		if(slug[1] !== undefined && slug[1] !== null){
			setCurrentId(slug[1]);
			setShouldLoad(true);
		}
	}, [slug]);
	
	const saveToUserDataStore = async function(hash) {
		setActionInProgress(true);
		const mapToPersist = {
			mapText: mapText,
			name: mapTitle,
			imageData: '',
			mapIterations: JSON.stringify(mapIterations),
		};

		const followOnActions = async function(id, resultFromAction) {
			switch (mapPersistenceStrategy) {
				case Defaults.MapPersistenceStrategy.Private:
					window.location.hash = '#private:' + id;
					break;
				case Defaults.MapPersistenceStrategy.Legacy:
					window.location.hash = '#' + id;
					break;
				case Defaults.MapPersistenceStrategy.Public:
					window.location.hash = '#public:' + id;
					break;
				default:
				case Defaults.MapPersistenceStrategy.PublicUnauthenticated:
					window.location.hash = '#anon:' + id;
					break;
			}

			if (mapPersistenceStrategy === Defaults.MapPersistenceStrategy.Private) {
				const imageData = await makeSnapShot();
				await createImage(imageData, 'private', id + '.png');
			}
			if (mapPersistenceStrategy === Defaults.MapPersistenceStrategy.Public) {
				const imageData = await makeSnapShot();
				await createImage(imageData, 'public', id + '.png');
			}

			setActionInProgress(false);
			setCurrentUrl(window.location.href);
			setSaveOutstanding(false);

			console.log('saveToPrivateDataStore', resultFromAction);

			async function createImage(imageData, level, filename) {
				return await Storage.put(
					filename,
					convertToImage(imageData, 'image/png'),
					{
						level: level,
						contentType: 'image/png',
					}
				);
			}
		};

		await SaveMap(mapPersistenceStrategy, mapToPersist, hash, followOnActions);
	};

	function newMap(mapPersistenceStrategy) {
		window.location.hash = '';
		setMapText('');
		setMetaText('');
		setCurrentUrl('(unsaved)');
		setSaveOutstanding(false);
		setMapPersistenceStrategy(mapPersistenceStrategy);
	}

	async function makeSnapShot() {
		return await html2canvas(mapRef.current).then(canvas => {
			const base64image = canvas.toDataURL('image/png');
			return base64image;
		});
	}

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

			<MapEnvironment {...props} 
				currentId={currentId} 
				setCurrentId={setCurrentId} 
				mapPersistenceStrategy={mapPersistenceStrategy}
				setMapPersistenceStrategy={setMapPersistenceStrategy}
				shouldLoad={shouldLoad} 
				setShoudLoad={setShouldLoad}  />

		</React.Fragment>
	);
}

export default Map;
