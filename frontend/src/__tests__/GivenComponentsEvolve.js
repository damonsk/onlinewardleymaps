import MapElements from '../MapElements';
import Converter from '../conversion/Converter';
import { useContext } from 'react';

jest.mock('react', () => ({
	...jest.requireActual('react'),
	useContext: jest.fn(),
}));

useContext.mockReturnValue({ enableNewPipelines: false });

describe('Given Components Evolve', function () {
	const mockContextValue = useContext();
	test('When evolve text is supplied then convert output is correct', function () {
		let actual = 'component Foo [0.9, 0.1]' + '\n' + 'evolve Foo 0.9';
		let result = new Converter(mockContextValue).parse(actual);
		const mergeables = [{ collection: result.elements, type: 'component' }];
		let me = new MapElements(mergeables, result.evolved);
		let evolved = me.getEvolveElements();

		expect(result.evolved.length).toEqual(1);
		expect(evolved.length).toEqual(1);
		expect(evolved[0].evolving).toEqual(true);
		expect(evolved[0].evolveMaturity).toEqual(0.9);
	});

	test('When evolve text is supplied with overriding label, ensure label is mutated', function () {
		let actual = 'component Foo [0.9, 0.1]' + '\n' + 'evolve Foo->Bar 0.9';
		let result = new Converter(mockContextValue).parse(actual);
		const mergeables = [{ collection: result.elements, type: 'component' }];
		let me = new MapElements(mergeables, result.evolved);
		let evolved = me.getEvolveElements();

		expect(result.evolved.length).toEqual(1);
		expect(evolved.length).toEqual(1);
		expect(evolved[0].evolving).toEqual(true);
		expect(evolved[0].evolving).toEqual(true);
		expect(evolved[0].evolveMaturity).toEqual(0.9);
	});

	test('When evolve text with label is supplied then convert output is correct', function () {
		let actual =
			'component Foo [0.1, 0.1] label [66,99]' +
			'\n' +
			'evolve Foo 0.9 label [-33, -55]';
		let result = new Converter(mockContextValue).parse(actual);
		const mergeables = [{ collection: result.elements, type: 'component' }];
		let me = new MapElements(mergeables, result.evolved);
		let evolving = me.getEvolveElements();
		let evolved = me.getEvolvedElements();

		expect(result.evolved.length).toEqual(1);
		expect(evolving.length).toEqual(1);
		expect(evolving[0].evolving).toEqual(true);
		expect(evolving[0].evolveMaturity).toEqual(0.9);
		expect(evolved[0].label.x).toEqual(-33);
		expect(evolved[0].label.y).toEqual(-55);
		expect(evolving[0].label.x).toEqual(66);
		expect(evolving[0].label.y).toEqual(99);
	});
});
