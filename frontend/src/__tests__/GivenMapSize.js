import Converter from '../conversion/Converter';

describe('Given map size can change', function () {
	test('When dimensions specified, ensure values are parsed', function () {
		let actual = 'size [1024, 768]' + '\n';
		let result = new Converter().parse(actual);
		expect(result.presentation.size.width).toEqual(1024);
		expect(result.presentation.size.height).toEqual(768);
	});
});
