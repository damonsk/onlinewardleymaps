import Converter from '../conversion/Converter';

describe('Convert test suite', function() {
	const genericMapComponents = [
		{ keyword: 'component', container: 'elements' },
		{ keyword: 'market', container: 'markets' },
	];

	test('should create mapJson Object with title property', function() {
		let expected = 'This is an example map';
		let actual = `title ${expected}`;
		let result = new Converter().parse(actual);

		expect(result.title).toEqual(expected);
	});

	test.each(genericMapComponents)(
		'should create map component from string',
		e => {
			let actual = `${e.keyword} Customer [1, 0.4]\n${e.keyword} Customer2 [0,0.1]`;
			let obj = new Converter();
			let result = obj.parse(actual);
			expect(result[e.container][0].id).toEqual(1);
			expect(result[e.container][0].name).toEqual('Customer');
			expect(result[e.container][0].visibility).toEqual(1);
			expect(result[e.container][0].maturity).toEqual(0.4);

			expect(result[e.container][1].id).toEqual(2);
			expect(result[e.container][1].name).toEqual('Customer2');
			expect(result[e.container][1].visibility).toEqual(0);
			expect(result[e.container][1].maturity).toEqual(0.1);
		}
	);

	test.each(genericMapComponents)(
		'should create map component with inertia tag set to true',
		e => {
			let actual = `${e.keyword} Customer [1, 0.4] inertia\n`;

			let obj = new Converter();
			let result = obj.parse(actual);

			expect(result[e.container][0].id).toEqual(1);
			expect(result[e.container][0].name).toEqual('Customer');
			expect(result[e.container][0].visibility).toEqual(1);
			expect(result[e.container][0].maturity).toEqual(0.4);
			expect(result[e.container][0].inertia).toEqual(true);
		}
	);

	test('should create links from string', function() {
		let actual =
			'component Customer [1, 0.4]\ncomponent Customer2 [0,0.1]\nCustomer->Customer2';

		let obj = new Converter();
		let result = obj.parse(actual);

		expect(result.links[0].start).toEqual('Customer');
		expect(result.links[0].end).toEqual('Customer2');
		expect(result.links[0].flow).toBeFalsy();
	});

	test('should create links even if components name contains keyword', function() {
		let actual =
			'component Sales marketing [1, 0.4]\ncomponent Sales ecosystem [0,0.1]\nSales marketing->Sales ecosystem';

		let obj = new Converter();
		let result = obj.parse(actual);

		expect(result.links[0].start).toEqual('Sales marketing');
		expect(result.links[0].end).toEqual('Sales ecosystem');
		expect(result.links[0].flow).toBeFalsy();
	});

	test('links should have flow attribute set', function() {
		let actual =
			'component Customer [1, 0.4]\ncomponent Customer2 [0,0.1]\nCustomer+>Customer2';

		let obj = new Converter();
		let result = obj.parse(actual);

		expect(result.links[0].start).toEqual('Customer');
		expect(result.links[0].end).toEqual('Customer2');
		expect(result.links[0].flow).toBeTruthy();
	});

	test('links should have flow value attribute set', function() {
		let actual = 'component Customer [1, 0.4]\ncomponent Customer2 [0,0.1]';
		actual = actual + '\n';
		actual = actual + "Customer+'5.88'>Customer2";

		let obj = new Converter();
		let result = obj.parse(actual);

		expect(result.links[0].start).toEqual('Customer');
		expect(result.links[0].end).toEqual('Customer2');
		expect(result.links[0].flow).toBeTruthy();
		expect(result.links[0].flowValue).toEqual('5.88');
	});

	test('should ignore whitespace', function() {
		let actual = 'component Customer [1, 0.4]\ncomponent Customer2 [0,0.1]';
		actual = actual + '\r\n ';
		actual = actual + 'Customer->Customer2';
		actual = actual + '\r\n ';
		actual = actual + '\r\n ';
		actual = actual + '\r\n ';

		let obj = new Converter();
		let result = obj.parse(actual);

		expect(result.links[0].start).toEqual('Customer');
		expect(result.links[0].end).toEqual('Customer2');
	});

	test('should set evolution', function() {
		let actual = 'evolution Novel->Emerging->Good->Best';

		let obj = new Converter();
		let result = obj.parse(actual);

		expect(result.evolution[0].line1).toEqual('Novel');
		expect(result.evolution[1].line1).toEqual('Emerging');
		expect(result.evolution[2].line1).toEqual('Good');
		expect(result.evolution[3].line1).toEqual('Best');
	});

	test('should create map object with annotations property with an annotation with a single occurance', function() {
		let actual =
			'annotation 1 [.38,.4] Standardising power allows Kettles to evolve faster';
		let result = new Converter().parse(actual);

		expect(result.annotations.length).toEqual(1);
		expect(result.annotations[0].number).toEqual(1);
		expect(result.annotations[0].occurances[0].visibility).toEqual(0.38);
		expect(result.annotations[0].occurances[0].maturity).toEqual(0.4);
		expect(result.annotations[0].text).toEqual(
			'Standardising power allows Kettles to evolve faster'
		);
	});

	test('should create map object with annotations property with an annotation with many occurances with no text', function() {
		let actual = 'annotation 1 [[.38, .4],[0.44, 0.33]]';
		let result = new Converter().parse(actual);

		expect(result.annotations.length).toEqual(1);
		expect(result.annotations[0].number).toEqual(1);
		expect(result.annotations[0].occurances[0].visibility).toEqual(0.38);
		expect(result.annotations[0].occurances[0].maturity).toEqual(0.4);
		expect(result.annotations[0].text).toEqual('');
	});

	test('should create map object with annotations property with an annotation with many occurances', function() {
		let actual =
			'annotation 1 [[.38, .4],[0.44, 0.33],[0.11, 0.22] ]    Standardising power allows Kettles to evolve faster';
		let result = new Converter().parse(actual);

		expect(result.annotations.length).toEqual(1);
		expect(result.annotations[0].number).toEqual(1);
		expect(result.annotations[0].occurances[0].visibility).toEqual(0.38);
		expect(result.annotations[0].occurances[0].maturity).toEqual(0.4);
		expect(result.annotations[0].occurances[1].visibility).toEqual(0.44);
		expect(result.annotations[0].occurances[1].maturity).toEqual(0.33);
		expect(result.annotations[0].occurances.length).toEqual(3);
		expect(result.annotations[0].text).toEqual(
			'Standardising power allows Kettles to evolve faster'
		);
	});

	test('should create map object with map style data', function() {
		let actual = 'style wardley';
		let result = new Converter().parse(actual);

		expect(result.presentation.style).toEqual('wardley');
	});

	test('should create map object with annotations positional data', function() {
		let actual = 'annotations [.38, .4]';
		let result = new Converter().parse(actual);

		expect(result.presentation.annotations.visibility).toEqual(0.38);
		expect(result.presentation.annotations.maturity).toEqual(0.4);
	});

	test('should not create map object with annotations when incomplete', function() {
		let actual = 'annotation ';
		let result = new Converter().parse(actual);

		expect(result.annotations.length).toEqual(0);
	});

	test('should not create map object with annotations when incomplete', function() {
		let actual = 'annotation 1';
		let result = new Converter().parse(actual);

		expect(result.annotations.length).toEqual(0);
	});

	test('comments are ignored', function() {
		let actual = '// hello world.';
		let result = new Converter().parse(actual);

		expect(result.elements.length).toEqual(0);
	});

	test('comments are ignored', function() {
		let actual = '/* hello world.\r\n* something\r\n*/';
		let result = new Converter().parse(actual);

		expect(result.elements.length).toEqual(0);
	});

	test.each(genericMapComponents)(
		'map component with little info is still made available to the map',
		e => {
			let actual = `${e.keyword} Foo []`;
			let result = new Converter().parse(actual);

			expect(result[e.container].length).toEqual(1);
			expect(result[e.container][0].visibility).toEqual(0.9);
			expect(result[e.container][0].maturity).toEqual(0.1);
		}
	);

	test('anchor with little info is still made available to the map', function() {
		let actual = 'anchor Foo []';
		let result = new Converter().parse(actual);

		expect(result.anchors.length).toEqual(1);
		expect(result.anchors[0].visibility).toEqual(0.9);
		expect(result.anchors[0].maturity).toEqual(0.1);
	});

	test.each(genericMapComponents)(
		'map component with little info is still made available to the map',
		e => {
			let actual = `${e.keyword} Foo`;
			let result = new Converter().parse(actual);

			expect(result[e.container].length).toEqual(1);
			expect(result[e.container][0].visibility).toEqual(0.9);
			expect(result[e.container][0].maturity).toEqual(0.1);
		}
	);

	test('y-axis varible present and extracted', function() {
		let actual = 'y-axis Some label->Min label->Max label';
		let result = new Converter().parse(actual);

		expect(result.presentation.yAxis.label).toEqual('Some label');
		expect(result.presentation.yAxis.max).toEqual('Max label');
		expect(result.presentation.yAxis.min).toEqual('Min label');
	});

	test('notes are extracted and made available to the map', function() {
		let actual = 'note some text [0.9, 0.1]';
		let result = new Converter().parse(actual);

		expect(result.notes.length).toEqual(1);
		expect(result.notes[0].text).toEqual('some text');
		expect(result.notes[0].visibility).toEqual(0.9);
		expect(result.notes[0].maturity).toEqual(0.1);
	});

	test('notes with note in the text still works', function() {
		let actual = 'note a generic note appeard [0.9, 0.1]';
		let result = new Converter().parse(actual);

		expect(result.notes.length).toEqual(1);
		expect(result.notes[0].text).toEqual('a generic note appeard');
		expect(result.notes[0].visibility).toEqual(0.9);
		expect(result.notes[0].maturity).toEqual(0.1);
	});

	test('notes with little info is still made available to the map', function() {
		let actual = 'note Foo []';
		let result = new Converter().parse(actual);

		expect(result.notes.length).toEqual(1);
		expect(result.notes[0].visibility).toEqual(0.9);
		expect(result.notes[0].maturity).toEqual(0.1);
	});

	test.each(genericMapComponents)(
		'map component with label position then position is available to map',
		e => {
			let actual = `${e.keyword} Foo [0.9, 0.1] label [66,99] inertia evolve 0.9`;
			let result = new Converter().parse(actual);

			expect(result[e.container].length).toEqual(1);
			expect(result[e.container][0].visibility).toEqual(0.9);
			expect(result[e.container][0].maturity).toEqual(0.1);
			expect(result[e.container][0].label.x).toEqual(66);
			expect(result[e.container][0].label.y).toEqual(99);
		}
	);

	test('pipelines made available to the map', function() {
		let actual = 'pipeline Foo [0.05, 0.95]';
		let result = new Converter().parse(actual);

		expect(result.pipelines.length).toEqual(1);
		expect(result.pipelines[0].name).toEqual('Foo');
		expect(result.pipelines[0].maturity1).toEqual(0.05);
		expect(result.pipelines[0].maturity2).toEqual(0.95);
		expect(result.pipelines[0].hidden).toEqual(false);
	});

	test('pipelines made available to the map but set to hidden', function() {
		let actual = 'pipeline Foo';
		let result = new Converter().parse(actual);

		expect(result.pipelines.length).toEqual(1);
		expect(result.pipelines[0].name).toEqual('Foo');
		expect(result.pipelines[0].maturity1).toEqual(0.2);
		expect(result.pipelines[0].maturity2).toEqual(0.8);
		expect(result.pipelines[0].hidden).toEqual(true);
	});

	test.each(['pioneers', 'settlers', 'townplanners'])(
		'pioneers are extracted with width and height',
		function(x) {
			let actual = `${x} [0.98, 0.5] 100 200`;
			let result = new Converter().parse(actual);

			expect(result.attitudes.length).toEqual(1);
			expect(result.attitudes[0].maturity).toEqual(0.5);
			expect(result.attitudes[0].visibility).toEqual(0.98);
			expect(result.attitudes[0].width).toEqual('100');
			expect(result.attitudes[0].height).toEqual('200');
		}
	);

	test.each(['pioneers', 'settlers', 'townplanners'])(
		'pioneers are extracted with matruity and visibility for width height',
		function(x) {
			let actual = `${x} [0.98, 0.5, 0.6, 0.7]`;
			let result = new Converter().parse(actual);

			expect(result.attitudes.length).toEqual(1);
			expect(result.attitudes[0].maturity).toEqual(0.5);
			expect(result.attitudes[0].visibility).toEqual(0.98);
			expect(result.attitudes[0].maturity2).toEqual(0.7);
			expect(result.attitudes[0].visibility2).toEqual(0.6);
		}
	);

	test.each(['build', 'buy', 'outsource'])('methods are extracted', k => {
		let actual = `${k} Foo Bar`;
		let result = new Converter().parse(actual);

		expect(result.methods.length).toEqual(1);
		expect(result.methods[0].name).toEqual('Foo Bar');
		expect(result.methods[0].method).toEqual(k);
	});
});
