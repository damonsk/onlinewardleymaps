import MapElements from '../MapElements';
import Converter from '../conversion/Converter';

describe('Given Components Have Pipelines', function() {
	test('When pipeline is specificed then convert output is correct', function() {
		let actual =
			'component Foo [0.9, 0.1]' + '\n' + 'pipeline Foo [0.15, 0.65]';
		let result = new Converter().parse(actual);
		const mergeables = [{ collection: result.elements, type: 'component' }];
		let me = new MapElements(mergeables, result.evolved, result.pipelines);
		let pipelines = me.getMapPipelines();
		let components = me.getMergedElements();

		expect(result.pipelines.length).toEqual(1);
		expect(pipelines.length).toEqual(1);
		expect(pipelines[0].maturity1).toEqual(0.15);
		expect(pipelines[0].maturity2).toEqual(0.65);
		expect(pipelines[0].visibility).toEqual(0.9);
		expect(components[0].pipeline).toEqual(true);
	});

	test('When pipeline is specificed but boundaries are not defined, pipeline should be hidden and returns', function() {
		let actual = 'component Foo [0.9, 0.1]' + '\n' + 'pipeline Foo';
		let result = new Converter().parse(actual);
		const mergeables = [{ collection: result.elements, type: 'component' }];
		let me = new MapElements(mergeables, result.evolved, result.pipelines);
		let pipelines = me.getMapPipelines();
		let components = me.getMergedElements();

		expect(result.pipelines.length).toEqual(1);
		expect(pipelines.length).toEqual(1);
		expect(pipelines[0].visibility).toEqual(0.9);
		expect(pipelines[0].hidden).toEqual(true);
		expect(components[0].pipeline).toEqual(true);
	});

	test('When pipeline is specificed but boundaries are not defined yet it has child componets, pipeline should be not hidden and returns', function() {
		let actual =
			'component Foo [0.9, 0.1]' +
			'\n' +
			'pipeline Foo' +
			'\n' +
			'pipelinecomponent FooBar [0.11]';
		let result = new Converter().parse(actual);
		const mergeables = [{ collection: result.elements, type: 'component' }];
		let me = new MapElements(mergeables, result.evolved, result.pipelines);
		let pipelines = me.getMapPipelines();
		let components = me.getMergedElements();

		expect(result.pipelines.length).toEqual(1);
		expect(pipelines.length).toEqual(1);
		expect(pipelines[0].visibility).toEqual(0.9);
		expect(pipelines[0].hidden).toEqual(false);
		expect(components[0].pipeline).toEqual(true);
	});

	test('When a pipelinecomponent appears, associate to the preceeding pipeline', function() {
		let actual =
			'component Foo [0.9, 0.1]' +
			'\n' +
			'pipeline Foo [0.15, 0.65]' +
			'\n' +
			'pipelinecomponent Bar [0.65]';
		let result = new Converter().parse(actual);
		const mergeables = [{ collection: result.elements, type: 'component' }];
		let me = new MapElements(mergeables, result.evolved, result.pipelines);
		let pipelines = me.getMapPipelines();
		let components = me.getMergedElements();

		expect(result.pipelines.length).toEqual(1);
		expect(pipelines.length).toEqual(1);
		expect(pipelines[0].maturity1).toEqual(0.65);
		expect(pipelines[0].maturity2).toEqual(0.65);
		expect(pipelines[0].visibility).toEqual(0.9);
		expect(pipelines[0].components.length).toEqual(1);
		expect(components[0].pipeline).toEqual(true);
	});

	test('When a pipelinecomponent appears, extract required attributes and pipeline maturity is overwritten', function() {
		let actual =
			'component Foo [0.9, 0.1]' +
			'\n' +
			'pipeline Foo [0.15, 0.65]' +
			'\n' +
			'pipelinecomponent Bar [0.66]' +
			'\n' +
			'pipelinecomponent FooBar [0.41]';
		let result = new Converter().parse(actual);
		const mergeables = [{ collection: result.elements, type: 'component' }];
		let me = new MapElements(mergeables, result.evolved, result.pipelines);
		let pipelines = me.getMapPipelines();
		let components = me.getMergedElements();

		expect(result.pipelines.length).toEqual(1);
		expect(pipelines.length).toEqual(1);
		expect(pipelines[0].maturity1).toEqual(0.41);
		expect(pipelines[0].maturity2).toEqual(0.66);
		expect(pipelines[0].visibility).toEqual(0.9);
		expect(pipelines[0].components.length).toEqual(2);
		expect(pipelines[0].components[0].maturity).toEqual(0.66);
		expect(pipelines[0].components[0].name).toEqual('Bar');
		expect(components[0].pipeline).toEqual(true);
	});
});
