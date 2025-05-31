import { useContext } from 'react';
import { UnifiedConverter } from '../conversion/UnifiedConverter';
import { UnifiedMapElements } from '../processing/UnifiedMapElements';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useContext: jest.fn(),
}));

const mockContextValue = {
    enableDashboard: false,
    enableNewPipelines: true,
    enableLinkContext: true,
    enableAccelerators: true,
    enableDoubleClickRename: true,
};

useContext.mockReturnValue(mockContextValue);

describe('DSL Component Decorators in UnifiedMapElements', function () {
    test('When components have DSL decorators, they should preserve decorator properties correctly', function () {
        const mapText = `
title Test Map with Decorators
component RegularComponent [0.5, 0.5]
component MarketDecorated [0.6, 0.6] (market)
component EcosystemDecorated [0.7, 0.7] (ecosystem)
component BuyMethodDecorated [0.8, 0.8] (buy)
component BuildMethodDecorated [0.3, 0.3] (build)
component OutsourceMethodDecorated [0.4, 0.4] (outsource)
component MultipleDecorators [0.9, 0.9] (market, buy)
        `;

        // Parse the map text
        const result = new UnifiedConverter(mockContextValue).parse(mapText);
        const me = new UnifiedMapElements(result);
        const mergedElements = me.getMergedElements();

        // Find components by name
        const findComponent = (name) =>
            mergedElements.find((c) => c.name === name);

        const regularComponent = findComponent('RegularComponent');
        const marketDecorated = findComponent('MarketDecorated');
        const ecosystemDecorated = findComponent('EcosystemDecorated');
        const buyMethodDecorated = findComponent('BuyMethodDecorated');
        const buildMethodDecorated = findComponent('BuildMethodDecorated');
        const outsourceMethodDecorated = findComponent(
            'OutsourceMethodDecorated',
        );
        const multipleDecorators = findComponent('MultipleDecorators');

        // Regular component should not have any decorators
        expect(regularComponent.decorators.market).toBe(false);
        expect(regularComponent.decorators.ecosystem).toBe(false);
        expect(regularComponent.decorators.method).toBeUndefined();

        // Market decorated component should have market decorator
        expect(marketDecorated.decorators.market).toBe(true);
        expect(marketDecorated.decorators.ecosystem).toBe(false);
        expect(marketDecorated.decorators.method).toBeUndefined();

        // Ecosystem decorated component should have ecosystem decorator
        expect(ecosystemDecorated.decorators.ecosystem).toBe(true);
        expect(ecosystemDecorated.decorators.market).toBe(false);
        expect(ecosystemDecorated.decorators.method).toBeUndefined();

        // Method decorated components should have method decorator
        expect(buyMethodDecorated.decorators.method).toBe('buy');
        expect(buyMethodDecorated.decorators.market).toBe(false);
        expect(buyMethodDecorated.decorators.ecosystem).toBe(false);

        expect(buildMethodDecorated.decorators.method).toBe('build');
        expect(buildMethodDecorated.decorators.market).toBe(false);
        expect(buildMethodDecorated.decorators.ecosystem).toBe(false);

        expect(outsourceMethodDecorated.decorators.method).toBe('outsource');
        expect(outsourceMethodDecorated.decorators.market).toBe(false);
        expect(outsourceMethodDecorated.decorators.ecosystem).toBe(false);

        // Multiple decorators should preserve both
        expect(multipleDecorators.decorators.market).toBe(true);
        expect(multipleDecorators.decorators.method).toBe('buy');
        expect(multipleDecorators.decorators.ecosystem).toBe(false);
    });

    test('When components have type-based classification, they should still get correct decorators', function () {
        const mapText = `
title Test Map with Type-based Components
market TypeBasedMarket [0.5, 0.5]
ecosystem TypeBasedEcosystem [0.6, 0.6]
component RegularComponent [0.7, 0.7]
        `;

        // Parse the map text
        const result = new UnifiedConverter(mockContextValue).parse(mapText);
        const me = new UnifiedMapElements(result);
        const mergedElements = me.getMergedElements();

        // Find components by name
        const findComponent = (name) =>
            mergedElements.find((c) => c.name === name);

        const typeBasedMarket = findComponent('TypeBasedMarket');
        const typeBasedEcosystem = findComponent('TypeBasedEcosystem');
        const regularComponent = findComponent('RegularComponent');

        // Type-based market should have market decorator via fallback logic
        expect(typeBasedMarket.decorators.market).toBe(true);
        expect(typeBasedMarket.decorators.ecosystem).toBe(false);
        expect(typeBasedMarket.decorators.method).toBeUndefined();

        // Type-based ecosystem should have ecosystem decorator via fallback logic
        expect(typeBasedEcosystem.decorators.ecosystem).toBe(true);
        expect(typeBasedEcosystem.decorators.market).toBe(false);
        expect(typeBasedEcosystem.decorators.method).toBeUndefined();

        // Regular component should not have any decorators
        expect(regularComponent.decorators.market).toBe(false);
        expect(regularComponent.decorators.ecosystem).toBe(false);
        expect(regularComponent.decorators.method).toBeUndefined();
    });

    test('When DSL decorators take precedence over component type', function () {
        // This is a regression test for the specific bug we fixed
        const mapText = `
title Test Map with DSL Override
component Foobar [0.9, 0.1] (market)
component Barbaz [0.9, 0.1] (ecosystem)
market TypeMarketWithEcoDecorator [0.5, 0.5] (ecosystem)
ecosystem TypeEcoWithMarketDecorator [0.6, 0.6] (market)
        `;

        // Parse the map text
        const result = new UnifiedConverter(mockContextValue).parse(mapText);
        const me = new UnifiedMapElements(result);
        const mergedElements = me.getMergedElements();

        // Find components by name
        const findComponent = (name) =>
            mergedElements.find((c) => c.name === name);

        const foobar = findComponent('Foobar');
        const barbaz = findComponent('Barbaz');
        const typeMarketWithEcoDecorator = findComponent(
            'TypeMarketWithEcoDecorator',
        );
        const typeEcoWithMarketDecorator = findComponent(
            'TypeEcoWithMarketDecorator',
        );

        // DSL decorators should work correctly
        expect(foobar.decorators.market).toBe(true);
        expect(foobar.decorators.ecosystem).toBe(false);

        expect(barbaz.decorators.ecosystem).toBe(true);
        expect(barbaz.decorators.market).toBe(false);

        // DSL decorators should override component type
        expect(typeMarketWithEcoDecorator.decorators.ecosystem).toBe(true);
        expect(typeMarketWithEcoDecorator.decorators.market).toBe(true); // Should still be true due to type fallback

        expect(typeEcoWithMarketDecorator.decorators.market).toBe(true);
        expect(typeEcoWithMarketDecorator.decorators.ecosystem).toBe(true); // Should still be true due to type fallback
    });

    test('When evolved components preserve decorators from base component', function () {
        const mapText = `
title Test Map with Evolved Decorators
component EvolvedMarket [0.5, 0.5] (market)
component EvolvedEcosystem [0.6, 0.6] (ecosystem)
component EvolvedMethod [0.7, 0.7] (buy)
evolve EvolvedMarket 0.8
evolve EvolvedEcosystem 0.9
evolve EvolvedMethod 0.75
        `;

        // Parse the map text
        const result = new UnifiedConverter(mockContextValue).parse(mapText);
        const me = new UnifiedMapElements(result);
        const evolvedElements = me.getEvolvedElements();

        // Find evolved components by name (they get '_evolved' suffix)
        const findComponent = (name) =>
            evolvedElements.find((c) => c.name === name);

        const evolvedMarket = findComponent('EvolvedMarket');
        const evolvedEcosystem = findComponent('EvolvedEcosystem');
        const evolvedMethod = findComponent('EvolvedMethod');

        // Evolved components should preserve decorators from base component
        expect(evolvedMarket.decorators.market).toBe(true);
        expect(evolvedMarket.decorators.ecosystem).toBe(false);
        expect(evolvedMarket.decorators.method).toBeUndefined();

        expect(evolvedEcosystem.decorators.ecosystem).toBe(true);
        expect(evolvedEcosystem.decorators.market).toBe(false);
        expect(evolvedEcosystem.decorators.method).toBeUndefined();

        expect(evolvedMethod.decorators.method).toBe('buy');
        expect(evolvedMethod.decorators.market).toBe(false);
        expect(evolvedMethod.decorators.ecosystem).toBe(false);
    });

    test('When components have no decorators, they should have false/undefined decorator values', function () {
        const mapText = `
title Test Map with No Decorators
component PlainComponent [0.5, 0.5]
component AnotherComponent [0.6, 0.6]
        `;

        // Parse the map text
        const result = new UnifiedConverter(mockContextValue).parse(mapText);
        const me = new UnifiedMapElements(result);
        const mergedElements = me.getMergedElements();

        // All components should have proper default decorator values
        mergedElements.forEach((component) => {
            expect(component.decorators.market).toBe(false);
            expect(component.decorators.ecosystem).toBe(false);
            expect(component.decorators.method).toBeUndefined();
        });
    });
});
