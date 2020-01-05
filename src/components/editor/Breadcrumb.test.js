import React from 'react';
import Breadcrumb from './Breadcrumb';
import { create } from 'react-test-renderer';
describe('Breadcrumb', () => {
	describe('init', () => {
		it('should render as a nav element', () => {
			const component = create(<Breadcrumb currentUrl="(Unsaved)" />).toJSON();
			expect(component.type).toBe('nav');
		});
	});
});
