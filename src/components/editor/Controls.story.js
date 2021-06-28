/* eslint-env node */
import React from 'react';
import { storiesOf } from '@storybook/react';

import Controls from './Controls.js';

storiesOf('Controls ', module).add('default', () => (
	<Controls
		currentUrl={'(Unsaved)'}
		saveOutstanding={false}
		setMetaText={''}
		mutateMapText={() => {}}
		newMapClick={() => {}}
		saveMapClick={() => {}}
		downloadMapImage={() => {}}
		setShowLinkedEvolved={() => {}}
		showLinkedEvolved={() => {}}
	/>
));
