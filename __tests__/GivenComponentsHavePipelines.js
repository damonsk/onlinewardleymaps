import MapPipelines from '@/MapPipelines';
import Convert from '@/Convert';

describe('Given Components Have Pipelines', function() {
	test('When pipeline is specificed then convert output is correct', function() {
		let actual =
			'component Foo [0.9, 0.1]' + '\n' + 'pipeline Foo [0.15, 0.65]';
		let result = new Convert().parse(actual);
		let me = new MapPipelines(result.elements, result.pipelines);
		let pipelines = me.getMapPipelines();

		expect(result.pipelines.length).toEqual(1);
		expect(pipelines.length).toEqual(1);
		expect(pipelines[0].maturity1).toEqual(0.15);
		expect(pipelines[0].maturity2).toEqual(0.65);
		expect(pipelines[0].visibility).toEqual(0.9);
	});
});
