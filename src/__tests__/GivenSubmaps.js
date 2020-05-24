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
