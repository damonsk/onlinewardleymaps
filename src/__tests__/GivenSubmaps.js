import Converter from '../conversion/Converter';
import { EditorPrefixes } from '../constants/editorPrefixes';

describe('Given Submaps', function() {
	test('When mapText contains submaps then text is correctly parsed', function() {
		let actual = 'submap Foo';
		let result = new Converter().parse(actual);
		expect(result.submaps.length).toEqual(1);
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
