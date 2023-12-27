import Converter from '../conversion/Converter';

describe('Given Accelerator components', function () {
	test('When accelerator is specificed then convert output is correct', function () {
		let actual = 'accelerator randomkey [0.9, 0.1]' + '\n';
		let result = new Converter().parse(actual);
		expect(result.accelerators.length).toEqual(1);
		expect(result.accelerators[0].name).toEqual('randomkey');
	});

	test('When deaccelerator is specificed then convert output is correct', function () {
		let actual = 'deaccelerator randomkey [0.9, 0.1]' + '\n';
		let result = new Converter().parse(actual);
		expect(result.accelerators.length).toEqual(1);
		expect(result.accelerators[0].name).toEqual('randomkey');
		expect(result.accelerators[0].deaccelerator).toEqual(true);
	});
});
