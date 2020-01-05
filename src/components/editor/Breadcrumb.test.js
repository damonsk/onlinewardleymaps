import React from 'react';
import Breadcrumb from './Breadcrumb';
import { create } from 'react-test-renderer';
import { render } from '@testing-library/react';
describe('Breadcrumb', () => {
	describe('init', () => {
		it('should render as a nav element', () => {
			const component = create(<Breadcrumb currentUrl="(Unsaved)" />).toJSON();
			expect(component.type).toBe('nav');
		});
		it('should an aria-label attribute with value ""breadcrumb" - a11y', () => {
			const component = create(<Breadcrumb currentUrl="(Unsaved)" />).toJSON();
			expect(component.props['aria-label']).toBe('breadcrumb');
		});
		it('should render list with classname "breadcrumb" - a11y - styling hook', () => {
			const component = render(<Breadcrumb currentUrl="(Unsaved)" />);

			expect(component.getByTestId('breadcrumb-list')).toHaveClass(
				'breadcrumb'
			);
		});
		it('should render all list items with the className "breadcrumb-item"', () => {
			const component = render(<Breadcrumb currentUrl="(Unsaved)" />);
			component.getAllByTestId('breadcrumb-list-item').map(element => {
				expect(element).toHaveClass('breadcrumb-item');
			});
		});
	});
	describe('Unique Items', () => {
		describe('Your Map', () => {
			it('should have the text prefix "Your Map:"', () => {
				const component = render(<Breadcrumb currentUrl="(Unsaved)" />);
				expect(component.getByText('Your Map:')).toBeDefined();
			});
			it('should render the value of provided currentUrl', () => {
				const component = render(<Breadcrumb currentUrl="Some test String" />);
				expect(component.getByText('Some test String')).toBeDefined();
			});
			it.skip('if provided currentUrl is "(unsaved)" anchor should link to an empty fragment', () => {});
			it.skip('if valid link is provided the item should link to it.', () => {});
			it.skip('should display "(unsaved)" in place of currentUrl value if junk data is provided', () => {});
		});
	});
});
