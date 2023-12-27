import { Grid, Link, Typography } from '@mui/material';
import React from 'react';
import { MapPersistenceStrategy } from '../../constants/defaults';

const Breadcrumb = ({ currentUrl, mapPersistenceStrategy, mapReadOnly }) => {
	let typeIndicator = 'Private';
	switch (mapPersistenceStrategy) {
		case MapPersistenceStrategy.Private:
			typeIndicator =
				'Private Map - Only you can view, edit and delete this map';
			break;
		case MapPersistenceStrategy.Public:
			typeIndicator =
				'Public ' +
				(mapReadOnly ? ' Read Only ' : '') +
				'Map - Anyone can view ' +
				(mapReadOnly
					? ' this map and only you can edit or delete this map'
					: 'and edit this map') +
				'.  There is attribution to your account';
			break;
		case MapPersistenceStrategy.Legacy:
			typeIndicator = 'v1 Map';
			break;

		default:
		case MapPersistenceStrategy.PublicUnauthenticated:
			typeIndicator =
				'Public Map - Anyone can view and edit this map.  There is no attribution to your account.';
			break;
	}
	return (
		<Grid container spacing={2} padding={1}>
			<Grid item xs={6}>
				<Typography>
					Your Map:{' '}
					<Link
						href={currentUrl.indexOf('#') === -1 ? '#' : currentUrl}
						id="url"
						data-testid="breadcrumb-list-item-your-map"
					>
						{currentUrl.indexOf('#') === -1 ? '(unsaved)' : currentUrl}
					</Link>
				</Typography>
			</Grid>
			<Grid item xs={6}>
				<Typography sx={{ textAlign: 'right' }}>{typeIndicator}</Typography>
			</Grid>
		</Grid>
	);
};

export default Breadcrumb;
