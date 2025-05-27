import Converter from '../conversion/Converter';
import { EditorPrefixes } from '../constants/editorPrefixes';
import { useContext } from 'react';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useContext: jest.fn(),
}));

useContext.mockReturnValue({ enableNewPipelines: false });

describe('Given Submaps', function () {
    const mockContextValue = useContext();
    test.each(['Foo', 'Bar', 'Bleh'])(
        'When mapText contains submaps then text is correctly parsed',
        (name) => {
            let actual = `submap ${name}`;
            let result = new Converter(mockContextValue).parse(actual);
            expect(result.submaps.length).toEqual(1);
            expect(result.submaps[0].name).toEqual(name);
        },
    );

    test('When mapText contains submaps with coords then text is correctly parsed', () => {
        const visibility = 0.11;
        const maturity = 0.31;
        const name = 'Order';
        let actual = `submap ${name} [${visibility}, ${maturity}]`;
        let result = new Converter(mockContextValue).parse(actual);
        expect(result.submaps.length).toEqual(1);
        expect(result.submaps[0].name).toEqual(name);
        expect(result.submaps[0].maturity).toEqual(maturity);
        expect(result.submaps[0].visibility).toEqual(visibility);
    });

    test('When mapText contains submaps with coords and ref is set then text is correctly parsed', () => {
        const visibility = 0.11;
        const maturity = 0.31;
        const name = 'Order';
        let actual = `submap ${name} [${visibility}, ${maturity}] url(urlId)`;
        let result = new Converter(mockContextValue).parse(actual);
        expect(result.submaps.length).toEqual(1);
        expect(result.submaps[0].name).toEqual(name);
        expect(result.submaps[0].maturity).toEqual(maturity);
        expect(result.submaps[0].visibility).toEqual(visibility);
        expect(result.submaps[0].url).toEqual('urlId');
    });

    test('When mapText contains submaps with coords and label then text is correctly parsed', () => {
        const visibility = 0.11;
        const maturity = 0.31;

        const offsetX = -15;
        const offsetY = 30;

        const name = 'Order';
        let actual = `submap ${name} [${visibility}, ${maturity}] label [${offsetX}, ${offsetY}]`;
        let result = new Converter(mockContextValue).parse(actual);
        expect(result.submaps.length).toEqual(1);
        expect(result.submaps[0].name).toEqual(name);
        expect(result.submaps[0].maturity).toEqual(maturity);
        expect(result.submaps[0].visibility).toEqual(visibility);
        expect(result.submaps[0].label.x).toEqual(offsetX);
        expect(result.submaps[0].label.y).toEqual(offsetY);
    });

    test('Editor prefixes are defined', function () {
        expect(EditorPrefixes.includes('submap')).toEqual(true);
        expect(EditorPrefixes.includes('submap <name>')).toEqual(true);
        expect(
            EditorPrefixes.includes('submap <name> [<visibility>, <maturity>]'),
        ).toEqual(true);
        expect(
            EditorPrefixes.includes(
                'submap <name> [<visibility>, <maturity>] url(<url>)',
            ),
        ).toEqual(true);
    });
});
