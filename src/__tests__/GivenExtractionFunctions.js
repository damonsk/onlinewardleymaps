import * as ExtractionFunctions from '../constants/extractionFunctions';

describe('I want to decorate', function() {
	test.each(['buy', 'build', 'outsource'])(
		'When component has decorators, extract',
		e => {
			let o = {};
			o = ExtractionFunctions.decorators(o, `evolve foo 0.9 (${e})`);
			expect(o.decorators.method).toEqual(e);
		}
	);
});
