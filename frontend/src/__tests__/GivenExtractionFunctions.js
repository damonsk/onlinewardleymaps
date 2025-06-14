import * as ExtractionFunctions from '../constants/extractionFunctions';

describe('I want to decorate', function () {
    test.each(['buy', 'build', 'outsource'])('When component has decorators, extract', e => {
        let o = {};
        o = ExtractionFunctions.decorators(o, `evolve foo 0.9 (${e})`);
        expect(o.decorators[e]).toEqual(true);
        // Ensure all flags are present and explicit
        expect(o.decorators.buy).toBeDefined();
        expect(o.decorators.build).toBeDefined();
        expect(o.decorators.outsource).toBeDefined();
        expect(o.decorators.market).toBeDefined();
        expect(o.decorators.ecosystem).toBeDefined();
    });

    test('When component has decorators with label spacing increase to be set, then is applied (market)', function () {
        let o = {};
        const funcs = [ExtractionFunctions.decorators, ExtractionFunctions.setLabel];
        funcs.forEach(f => Object.assign(o, f(o, `evolve foo 0.9 (market, buy)`)));
        expect(o.decorators.buy).toEqual(true);
        expect(o.decorators.market).toEqual(true);
        expect(o.increaseLabelSpacing).toEqual(2);
        expect(o.label.x).toEqual(10);
        expect(o.label.y).toEqual(-20);
    });

    test('When component does have decorators with label spacing increase to be set, then is applied (method)', function () {
        let o = {};
        const funcs = [ExtractionFunctions.decorators, ExtractionFunctions.setLabel];
        funcs.forEach(f => Object.assign(o, f(o, `evolve foo 0.9 (buy)`)));
        expect(o.decorators.buy).toEqual(true);
        expect(o.increaseLabelSpacing).toEqual(2);
        expect(o.label.x).toEqual(10);
        expect(o.label.y).toEqual(-20);
    });

    test('When component does not have decorators with label spacing increase to be set, then ignore', function () {
        let o = {};
        const funcs = [ExtractionFunctions.decorators, ExtractionFunctions.setLabel];
        funcs.forEach(f => Object.assign(o, f(o, `evolve foo 0.9 (something)`)));
        expect(o.increaseLabelSpacing).toEqual(undefined);
        expect(o.label.x).toEqual(5);
        expect(o.label.y).toEqual(-10);
    });
});
