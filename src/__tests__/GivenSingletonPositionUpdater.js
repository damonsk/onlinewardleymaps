import SingletonPositionUpdater from '../components/map/positionUpdaters/SingletonPositionUpdater';
import DefaultPositionUpdater from '../components/map/positionUpdaters/DefaultPositionUpdater';
import { ExistingCoordsMatcher } from '../components/map/positionUpdaters/ExistingCoordsMatcher';

describe('Given update mapText for single instance elements', function() {
	test('When element has updated coords and doesnt exist then correct line is added', function() {
		let changed;
		const moved = { param1: 0.1, param2: 0.9 };
		let mapText = 'note sometext [0.1, 0.1]';
		const singletonPositionUpdater = new SingletonPositionUpdater(
			'annotations',
			mapText,
			text => (changed = text)
		);
		singletonPositionUpdater.update(moved, '');

		expect(changed.split('\n')[0]).toEqual('note sometext [0.1, 0.1]');
		expect(changed.split('\n')[1]).toEqual('annotations [0.1, 0.9]');
	});

	test('When element has updated coords and exist then correct line is changed', function() {
		let changed;
		const moved = { param1: 0.1, param2: 0.9 };
		let mapText = 'annotations [0.55, 0.44]\nnote sometext [0.1, 0.1]';
		const singletonPositionUpdater = new SingletonPositionUpdater(
			'annotations',
			mapText,
			text => (changed = text)
		);

		const defaultUpdater = new DefaultPositionUpdater(
			'annotations',
			mapText,
			text => (changed = text),
			[ExistingCoordsMatcher]
		);

		singletonPositionUpdater.setSuccessor(defaultUpdater);
		singletonPositionUpdater.update(moved, '');

		expect(changed.split('\n')[0]).toEqual('annotations [0.1, 0.9]');
		expect(changed.split('\n')[1]).toEqual('note sometext [0.1, 0.1]');
	});
});
