/* eslint-env node */
import React from 'react';
import { storiesOf } from '@storybook/react';

import Usage from './Usage.js';

storiesOf('Usage ', module).add('default', () => (
	<Usage mapText={''} mutateMapText={() => {}} />
));
