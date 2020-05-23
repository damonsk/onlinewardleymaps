import LineNumberPositionUpdater from '../components/map/positionUpdaters/LineNumberPositionUpdater';
import { ExistingCoordsMatcher } from '../components/map/positionUpdaters/ExistingCoordsMatcher';
import { NotDefinedCoordsMatcher } from '../components/map/positionUpdaters/NotDefinedCoordsMatcher';

describe('Given elements with line numbers', function() {
	test('When pipeline is specificed then convert output is correct', function() {
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
	});

	test('When pipeline is specificed then convert output is correct when note has exiting coords', function() {
		let changed;
		const updaters = [ExistingCoordsMatcher, NotDefinedCoordsMatcher];
		const moved = { param1: 0.1, param2: 0.9 };
		let mapText = 'note sometext [0.3, 0.4]\nnote sometext [0.1, 0.1]';
		const lineNumberUpdater = new LineNumberPositionUpdater(
			'note',
			mapText,
			text => (changed = text),
			updaters
		);
		lineNumberUpdater.update(moved, 'sometext', 1);

		expect(changed.split('\n')[0]).toEqual('note sometext [0.1, 0.9]');
	});
});
