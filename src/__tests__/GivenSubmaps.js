import Converter from '../conversion/Converter';
import { EditorPrefixes } from '../constants/editorPrefixes';

describe('Given Submaps', function() {
	test.each(['Foo', 'Bar', 'Bleh'])(
		'When mapText contains submaps then text is correctly parsed',
		name => {
			let actual = `submap ${name}`;
			let result = new Converter().parse(actual);
			expect(result.submaps.length).toEqual(1);
			expect(result.submaps[0].name).toEqual(name);
		}
	);

	test('When mapText contains submaps with coords then text is correctly parsed', () => {
		const visility = 0.11;
		const maturity = 0.31;
		const name = 'Order';
		let actual = `submap ${name} [${visility}, ${maturity}]`;
		let result = new Converter().parse(actual);
		expect(result.submaps.length).toEqual(1);
		expect(result.submaps[0].name).toEqual(name);
		expect(result.submaps[0].maturity).toEqual(maturity);
		expect(result.submaps[0].visibility).toEqual(visility);
	});

	test('Editor prefixes are defined', function() {
		expect(EditorPrefixes.includes('submap')).toEqual(true);
		expect(EditorPrefixes.includes('submap <name>')).toEqual(true);
		expect(
			EditorPrefixes.includes('submap <name> [<visility>, <maturity>]')
		).toEqual(true);
		expect(
			EditorPrefixes.includes(
				'submap <name> [<visility>, <maturity>] <reference>'
			)
		).toEqual(true);
	});
});
