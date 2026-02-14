import {render, screen} from '@testing-library/react';
import React from 'react';
import ModernAnnotationElementSymbol from '../../../components/symbols/ModernAnnotationElementSymbol';

describe('ModernAnnotationElementSymbol', () => {
    it('centers annotation numbers in the circle for large values', () => {
        const styles = {
            fill: '#fff',
            stroke: '#000',
            strokeWidth: 1,
            text: '#000',
            boxTextColour: '#000',
        };

        const {container} = render(
            <svg>
                <ModernAnnotationElementSymbol annotation={{number: 123, text: 'foo', occurance: []}} styles={styles} />
            </svg>,
        );

        const numberText = screen.getByText('123');
        expect(numberText).toHaveAttribute('x', '0');
        expect(numberText).toHaveAttribute('y', '0');
        expect(numberText).toHaveAttribute('text-anchor', 'middle');
        expect(numberText).toHaveAttribute('dominant-baseline', 'middle');

        const circle = container.querySelector('circle');
        expect(circle).toHaveAttribute('r', '15');
    });
});
