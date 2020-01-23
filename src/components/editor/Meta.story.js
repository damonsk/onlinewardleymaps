/* eslint-env node */
import React from 'react';
import { storiesOf } from '@storybook/react';

import Meta from './Meta.js';

storiesOf('Meta ', module).add('default', () => (
	<Meta metaText={`[{"name":"element_text_9","x":-31,"y":-9}]`} />
));
