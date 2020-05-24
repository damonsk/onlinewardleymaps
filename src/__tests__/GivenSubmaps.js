import Converter from '../conversion/Converter';

describe('Given Submaps', function() {
	test('When mapText contains submaps then text is correctly parsed', function() {
		let actual = 'submap Foo';
		let result = new Converter().parse(actual);

		expect(result.submaps.length).toEqual(1);
	});
});
