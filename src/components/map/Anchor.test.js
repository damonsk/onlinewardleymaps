import React from 'react';
import Anchor from './Anchor';
import { ModKeyPressedProvider } from '../KeyPressContext';
import { create } from 'react-test-renderer';
import { render } from '@testing-library/react';
import * as MapStyles from '../../constants/mapstyles';

const CreateAnchor = () => (
	<ModKeyPressedProvider>
		<Anchor
			anchor={{ name: 'AnchorName', maturity: 0.12, visibility: 0.67, id: 1 }}
			mapStyleDefs={MapStyles.Plain}
			mapDimensions={{ width: 600, height: 400 }}
			mapText={''}
			mutateMapText={() => {}}
			onClick={() => {}}
		/>
	</ModKeyPressedProvider>
);

describe('Anchor', () => {
	describe('init', () => {
		it('should render as a svg element', () => {
			const component = create(CreateAnchor()).toJSON();
			expect(component.type).toBe('g');
		});
		it('should contain text element with name set', () => {
			const component = render(CreateAnchor());
			component.getAllByTestId('anchor_text_1').map(element => {
				expect(element).toHaveClass('label');
				expect(element).toContainHTML('AnchorName');
				expect(element.getAttribute('fill')).toBe(
					MapStyles.Plain.component.textColor
				);
			});
		});
	});
});
