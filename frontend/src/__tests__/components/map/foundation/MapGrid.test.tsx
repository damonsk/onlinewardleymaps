import React from 'react';
import {render, screen} from '@testing-library/react';
import * as MapStyles from '../../../../constants/mapstyles';
import {MapGrid} from '../../../../components/map/foundation/MapGrid';

describe('MapGrid axis visibility controls', () => {
    const mapDimensions = {width: 500, height: 400};
    const evolutionOffsets = {custom: 3.5, product: 8, commodity: 14};

    const renderGrid = (showValueChainAxis: boolean, showEvolutionSeparators: boolean) => {
        const {container} = render(
            <svg>
                <MapGrid
                    mapDimensions={mapDimensions}
                    mapStyleDefs={MapStyles.Plain}
                    evolutionOffsets={evolutionOffsets}
                    showValueChainAxis={showValueChainAxis}
                    showEvolutionSeparators={showEvolutionSeparators}
                />
            </svg>,
        );
        return container;
    };

    it('shows only Y-axis when valuechain is visible and evolution separators are hidden', () => {
        const container = renderGrid(true, false);
        expect(screen.getByText('Value Chain')).toBeTruthy();
        expect(container.querySelectorAll('line').length).toBe(1);
    });

    it('shows only phase separators when valuechain is hidden and evolution is visible', () => {
        const container = renderGrid(false, true);
        expect(screen.queryByText('Value Chain')).toBeNull();
        expect(container.querySelectorAll('line').length).toBe(3);
    });
});
