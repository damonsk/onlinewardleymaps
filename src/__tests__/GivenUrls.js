import Converter from '../conversion/Converter';
import { EditorPrefixes } from '../constants/editorPrefixes';

describe('Given Urls', function() {
	test.each(['Foo', 'Bar', 'Bleh'])(
		'When mapText contains urls then text is correctly parsed',
		name => {
			let actual = `url ${name} [https://]`;
			let result = new Converter().parse(actual);
			expect(result.urls.length).toEqual(1);
			expect(result.urls[0].name).toEqual(name);
			expect(result.urls[0].url).toEqual(`https://`);
		}
	);

	test('Editor prefixes are defined for urls', function() {
		expect(EditorPrefixes.includes('url')).toEqual(true);
		expect(EditorPrefixes.includes('url <name>')).toEqual(true);
		expect(EditorPrefixes.includes('url <name> [<address>]')).toEqual(true);
	});
});
