import LineNumberPositionUpdater from '../components/map/positionUpdaters/LineNumberPositionUpdater';
import { ExistingCoordsMatcher } from '../components/map/positionUpdaters/ExistingCoordsMatcher';
import { NotDefinedCoordsMatcher } from '../components/map/positionUpdaters/NotDefinedCoordsMatcher';

describe('Given update mapText using line numbers', function() {
	test('When element has updated coords then correct line is changed', function() {
		let changed;
		const updaters = [ExistingCoordsMatcher, NotDefinedCoordsMatcher];
		const moved = { param1: 0.1, param2: 0.9 };
		let mapText = 'note sometext\nnote sometext [0.1, 0.1]';
		const lineNumberUpdater = new LineNumberPositionUpdater(
			'note',
			mapText,
			text => (changed = text),
			updaters
		);
		lineNumberUpdater.update(moved, 'sometext', 1);

		expect(changed.split('\n')[0]).toEqual('note sometext [0.1, 0.9]');
		expect(changed.split('\n')[1]).toEqual('note sometext [0.1, 0.1]');
	});

	test('When element has updated coords and has existing coords then correct line is changed', function() {
		let changed;
		const updaters = [ExistingCoordsMatcher, NotDefinedCoordsMatcher];
		const moved = { param1: 0.1, param2: 0.9 };
		let mapText = 'note sometext [0.3, 0.4]\nnote sometext [0.55, 0.44]';
		const lineNumberUpdater = new LineNumberPositionUpdater(
			'note',
			mapText,
			text => (changed = text),
			updaters
		);
		lineNumberUpdater.update(moved, 'sometext', 2);

		expect(changed.split('\n')[0]).toEqual('note sometext [0.3, 0.4]');
		expect(changed.split('\n')[1]).toEqual('note sometext [0.1, 0.9]');
	});
});
