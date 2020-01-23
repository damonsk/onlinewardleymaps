/* eslint-env node */
import React from 'react';
import { storiesOf } from '@storybook/react';

import Breadcrumb from './Breadcrumb.js';

storiesOf('Breadcrumb ', module).add('default', () => (
	<Breadcrumb currentUrl="(Unsaved)" />
));
