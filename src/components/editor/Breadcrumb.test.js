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
});
