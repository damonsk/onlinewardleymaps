import * as ExtractionFunctions from '../constants/extractionFunctions';

describe('Method Decorator Improvement', function () {
    test('When extracting method decorators, boolean flags should be set explicitly', function () {
        // Test for 'buy' method
        let buyComponent = {};
        buyComponent = ExtractionFunctions.decorators(buyComponent, 'component Test [0.9, 0.1] (buy)');

        // Verify boolean flags are set explicitly
        expect(buyComponent.decorators.buy).toBe(true);
        expect(buyComponent.decorators.build).toBe(false);
        expect(buyComponent.decorators.outsource).toBe(false);
        expect(buyComponent.decorators.market).toBe(false);
        expect(buyComponent.decorators.ecosystem).toBe(false);

        // Test for 'build' method
        let buildComponent = {};
        buildComponent = ExtractionFunctions.decorators(buildComponent, 'component Test [0.9, 0.1] (build)');

        // Verify boolean flags are set explicitly
        expect(buildComponent.decorators.build).toBe(true);
        expect(buildComponent.decorators.buy).toBe(false);
        expect(buildComponent.decorators.outsource).toBe(false);
        expect(buildComponent.decorators.market).toBe(false);
        expect(buildComponent.decorators.ecosystem).toBe(false);

        // Test for 'outsource' method
        let outsourceComponent = {};
        outsourceComponent = ExtractionFunctions.decorators(outsourceComponent, 'component Test [0.9, 0.1] (outsource)');

        // Verify boolean flags are set explicitly
        expect(outsourceComponent.decorators.outsource).toBe(true);
        expect(outsourceComponent.decorators.buy).toBe(false);
        expect(outsourceComponent.decorators.build).toBe(false);
        expect(outsourceComponent.decorators.market).toBe(false);
        expect(outsourceComponent.decorators.ecosystem).toBe(false);
    });

    test('When extracting method decorators with other decorators, all should be preserved', function () {
        // Test component with both market and method decorators
        let component = {};
        component = ExtractionFunctions.decorators(component, 'component Test [0.9, 0.1] (market, buy)');

        // Verify market decorator is preserved
        expect(component.decorators.market).toBe(true);
        expect(component.decorators.ecosystem).toBe(false);

        // Verify buy method decorator is set with boolean flag
        expect(component.decorators.buy).toBe(true);
        expect(component.decorators.build).toBe(false);
        expect(component.decorators.outsource).toBe(false);
    });

    test('When component has no method decorators, all decorator properties should be false', function () {
        let component = {};
        component = ExtractionFunctions.decorators(component, 'component Test [0.9, 0.1]');

        // Verify all decorator properties are explicitly false
        expect(component.decorators.buy).toBe(false);
        expect(component.decorators.build).toBe(false);
        expect(component.decorators.outsource).toBe(false);
        expect(component.decorators.market).toBe(false);
        expect(component.decorators.ecosystem).toBe(false);
    });

    test('When component has only market or ecosystem decorators, method properties should be false', function () {
        // Test with market decorator only
        let marketComponent = {};
        marketComponent = ExtractionFunctions.decorators(marketComponent, 'component Test [0.9, 0.1] (market)');

        expect(marketComponent.decorators.market).toBe(true);
        expect(marketComponent.decorators.ecosystem).toBe(false);
        expect(marketComponent.decorators.buy).toBe(false);
        expect(marketComponent.decorators.build).toBe(false);
        expect(marketComponent.decorators.outsource).toBe(false);

        // Test with ecosystem decorator only
        let ecosystemComponent = {};
        ecosystemComponent = ExtractionFunctions.decorators(ecosystemComponent, 'component Test [0.9, 0.1] (ecosystem)');

        expect(ecosystemComponent.decorators.ecosystem).toBe(true);
        expect(ecosystemComponent.decorators.market).toBe(false);
        expect(ecosystemComponent.decorators.buy).toBe(false);
        expect(ecosystemComponent.decorators.build).toBe(false);
        expect(ecosystemComponent.decorators.outsource).toBe(false);
    });
});
