import Converter from '../conversion/Converter';

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
});
