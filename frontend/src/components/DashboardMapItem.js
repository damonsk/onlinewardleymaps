import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LinearProgress from '@mui/material/LinearProgress';
import Router from 'next/router';
import { generateClient } from 'aws-amplify/api';
import { copy, remove, getUrl } from 'aws-amplify/storage';
import {
	createPublicMap,
	createMap,
	deleteMap,
	deletePublicMap,
} from '../graphql/mutations';
import { CardHeader, Divider, IconButton, Stack } from '@mui/material';

const DashboardMapItem = props => {
	const client = generateClient();
	const { item, index } = props;
	const [isUpdating, setIsUpdating] = useState(false);
	const [imageUrl, setImageUrl] = useState('');
	const [mapItem, setMapItem] = useState(item.map);
	const [isPrivate, setIsPrivate] = useState(item.isPrivate);
	const [evicted, setEvicted] = useState(false);
	const [anchorEl, setAnchorEl] = React.useState(null);
	const open = Boolean(anchorEl);
	const handleClick = event => {
		console.log('handleClick', event.currentTarget);
		setAnchorEl(event.currentTarget);
	};
	const complete = primaryAction => {
		if (typeof primaryAction === 'function') primaryAction();
		setAnchorEl(null);
	};

	const openLink = () =>
		Router.push({
			pathname: '/' + (isPrivate ? 'private' : 'user') + '/' + mapItem.id,
		});
	const deleteAction = () => {
		isPrivate
			? deleteMapFromPrivateDataStore()
			: deleteMapFromPublicDataStore();
		setEvicted(true);
	};
	const migrateAction = () =>
		isPrivate ? migrateToPublicStore() : migrateToPrivateStore();

	const migrateToPublicStore = async function() {
		setIsUpdating(true);
		const map = mapItem;
		let mutatedMap = Object.assign({}, map);
		delete mutatedMap['id'];
		delete mutatedMap['private'];
		delete mutatedMap['createdAt'];
		delete mutatedMap['updatedAt'];
		delete mutatedMap['owner'];

		await deleteMapFromPrivateDataStore();
		const r = await createMapInPublicDataStore(mutatedMap);
		await copy(
			{ key: mapItem.id + '.png', level: 'private' },
			{ key: r.data.createPublicMap.id + '.png', level: 'public' }
		);
		await remove({ key: mapItem.id + '.png', level: 'private' });
		setMapItem(r.data.createPublicMap);
		setIsUpdating(false);
		setIsPrivate(false);
	};

	const migrateToPrivateStore = async function() {
		setIsUpdating(true);
		const map = mapItem;
		let mutatedMap = Object.assign({}, map);
		delete mutatedMap['id'];
		delete mutatedMap['readOnly'];
		delete mutatedMap['createdAt'];
		delete mutatedMap['updatedAt'];
		delete mutatedMap['owner'];

		await deleteMapFromPublicDataStore();
		const r = await createMapInPrivateDataStore(mutatedMap);
		await copy(
			{ key: mapItem.id + '.png', level: 'public' },
			{ key: r.data.createMap.id + '.png', level: 'private' }
		);
		await remove({ key: mapItem.id + '.png', level: 'public' });
		setIsUpdating(false);
		setMapItem(r.data.createMap);
		setIsPrivate(true);
	};

	const createMapInPrivateDataStore = async function(map) {
		return await client.graphql({query: createMap, variables: map, operationName: 'createMap' });
	};

	const createMapInPublicDataStore = async function(map) {
		return await client.graphql({query: createPublicMap, variables: map, operationName: 'createPublicMap' });
	};

	const deleteMapFromPrivateDataStore = async function() {
		await client.graphql({query: deleteMap, variables: {input: { id: mapItem.id }}, operationName: 'deleteMap' });
	};

	const deleteMapFromPublicDataStore = async function() {
		await client.graphql({query: deletePublicMap, variables: {input: { id: mapItem.id }}, operationName: 'deletePublicMap' });
	};

	const getImageUrl = async function(id, privateState) {
		
		const e = await getUrl({
			key: (id + '.png'), 
			options: {
				accessLevel: privateState ? 'private' : 'public',
			}
		});
		console.log("image", {img: e.url.toString(), id, privateState});
		return e.url.toString();
	};

	useEffect(() => {
		const s = getImageUrl(mapItem.id, isPrivate);
		s.then(r => setImageUrl(r));
	}, [mapItem, isPrivate]);

	const saveMapText = (data, fileName) => {
		var a = document.createElement('a');
		document.body.appendChild(a);
		a.style = 'display: none';
		var blob = new Blob([data], { type: 'data:attachment/text' }),
			url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = fileName;
		a.click();
		window.URL.revokeObjectURL(url);
	};

	return (
		evicted === false && (
			<Grid item xs={2} sm={4} md={4}>
				<Card>
					<CardHeader
						action={
							<>
								<IconButton
									id={`more-menu-button-${index}`}
									aria-label="settings"
									aria-controls={
										open ? `more-menu-map-item-${index}` : undefined
									}
									aria-haspopup="true"
									aria-expanded={open ? 'true' : undefined}
									onClick={handleClick}
								>
									<MoreVertIcon />
								</IconButton>
								<Menu
									id={`more-menu-map-item-${index}`}
									anchorEl={anchorEl}
									open={open}
									onClose={complete}
									aria-labelledby={`more-menu-button-${index}`}
								>
									<MenuItem onClick={() => complete(() => migrateAction())}>
										Make {isPrivate ? 'Public' : 'Private'}
									</MenuItem>
									<MenuItem
										onClick={() =>
											complete(() =>
												saveMapText(mapItem.mapText, mapItem.name + '.owm')
											)
										}
									>
										Export Map
									</MenuItem>
									<Divider />
									<MenuItem onClick={() => complete(() => deleteAction())}>
										!! Delete !!
									</MenuItem>
								</Menu>
							</>
						}
						title={mapItem.name}
						subheader={
							isUpdating === false ? (
								isPrivate ? (
									'Private'
								) : (
									'Public'
								)
							) : (
								<LinearProgress />
							)
						}
					/>

					{imageUrl.length > 0 && (
						<CardMedia component="img" height="160" image={imageUrl} />
					)}
					<CardContent>
						<Stack
							direction="column"
							justifyContent="center"
							alignItems="center"
							spacing={0.5}
						>
							<Typography variant="caption">
								Created: {new Date(mapItem.createdAt).toLocaleString()}
								<br />
								Modified: {new Date(mapItem.updatedAt).toLocaleString()}
							</Typography>
						</Stack>
					</CardContent>
					<CardActions>
						<Button onClick={openLink} size="small">
							Open
						</Button>
					</CardActions>
				</Card>
			</Grid>
		)
	);
};

DashboardMapItem.propTypes = {
	item: PropTypes.object.isRequired,
	reload: PropTypes.func.isRequired,
	index: PropTypes.number.isRequired,
};

export default DashboardMapItem;
