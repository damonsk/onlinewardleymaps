import Converter from '../conversion/Converter';

describe('Given Links can support context', function() {
	test('When link is established, additional context can be supplied to be made visible on the map.', function() {
		let actual =
			'component Foo [0.9, 0.1]' +
			'\n' +
			'component Bar [0.15, 0.65]' +
			'\n' +
			'Foo->Bar; Something';
		let result = new Converter().parse(actual);
		expect(result.links.length).toEqual(1);
		expect(result.links[0].start).toEqual('Foo');
		expect(result.links[0].end).toEqual('Bar');
	});
});
