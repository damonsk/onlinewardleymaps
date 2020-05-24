import DefaultPositionUpdater from '../components/map/positionUpdaters/DefaultPositionUpdater';
import { ExistingCoordsMatcher } from '../components/map/positionUpdaters/ExistingCoordsMatcher';
import { NotDefinedCoordsMatcher } from '../components/map/positionUpdaters/NotDefinedCoordsMatcher';

describe('Given elements are updated matching on text', function() {
	test('When element has updated coords then correct line is changed', function() {
		let changed;
		const updaters = [ExistingCoordsMatcher, NotDefinedCoordsMatcher];
		const moved = { param1: 0.1, param2: 0.9 };
		let mapText = 'component foo\ncomponent bar [0.1, 0.1]';
		const defaultUpdater = new DefaultPositionUpdater(
			'component',
			mapText,
			text => (changed = text),
			updaters
		);
		defaultUpdater.update(moved, 'foo');

		expect(changed.split('\n')[0]).toEqual('component foo [0.1, 0.9]');
		expect(changed.split('\n')[1]).toEqual('component bar [0.1, 0.1]');
	});

	test('When element has updated coords and coords already exist then correct line is changed', function() {
		let changed;
		const updaters = [ExistingCoordsMatcher, NotDefinedCoordsMatcher];
		const moved = { param1: 0.4, param2: 0.9 };
		let mapText = 'component foo [0.1, 0.1]\ncomponent bar [0.1, 0.1]';
		const defaultUpdater = new DefaultPositionUpdater(
			'component',
			mapText,
			text => (changed = text),
			updaters
		);
		defaultUpdater.update(moved, 'foo');

		expect(changed.split('\n')[0]).toEqual('component foo [0.4, 0.9]');
		expect(changed.split('\n')[1]).toEqual('component bar [0.1, 0.1]');
	});
});
