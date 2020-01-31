import MapElements from '@/MapElements';
import Convert from '@/Convert';
import Migrations from '@/Migrations';

describe('Given Components Evolve', function() {
	test('When getEvolveElements invoked then elements set to evolve are returned', function() {
		let actual = 'component Foo [0.9, 0.1] evolve 0.9';
		let migrations = new Migrations(actual).apply();
		let result = new Convert().parse(migrations.result);

		let me = new MapElements(result.elements, result.evolved);
		let evolved = me.getEvolveElements();

		expect(evolved.length).toEqual(1);
	});

	test('When evolve text is supplied then convert output is correct', function() {
		let actual = 'component Foo [0.9, 0.1]' + '\n' + 'evolve Foo 0.9';
		let result = new Convert().parse(actual);
		let me = new MapElements(result.elements, result.evolved);
		let evolved = me.getEvolveElements();

		expect(result.evolved.length).toEqual(1);
		expect(evolved.length).toEqual(1);
		expect(evolved[0].evolving).toEqual(true);
		expect(evolved[0].evolveMaturity).toEqual(0.9);
	});

	test('When evolve text is merged with component then migrations handles the conversion', function() {
		let actual = 'component Foo [0.9, 0.1] evolve 0.9';
		let migrations = new Migrations(actual).apply();
		expect(migrations.changed).toEqual(true);
		expect(migrations.result).toEqual(
			'component Foo [0.9, 0.1]' + '\n' + 'evolve Foo 0.9'
		);
	});

	test('When mirgations are run then output has changesets.', function() {
		let actual = 'component Foo [0.9, 0.1] evolve 0.9';
		let expected = 'component Foo [0.9, 0.1]' + '\n' + 'evolve Foo 0.9';

		let migrations = new Migrations(actual).apply();
		expect(migrations.changed).toEqual(true);
		expect(migrations.changeSets.length).toEqual(1);
		expect(migrations.changeSets[0].before).toEqual(actual);
		expect(migrations.changeSets[0].after).toEqual(expected);
	});

	test('When mirgations are run on component with inertia then output has changesets.', function() {
		let actual = 'component Foo [0.9, 0.1] evolve 0.9 inertia';
		let expected = 'component Foo [0.9, 0.1] inertia' + '\n' + 'evolve Foo 0.9';

		let migrations = new Migrations(actual).apply();
		expect(migrations.changed).toEqual(true);
		expect(migrations.changeSets.length).toEqual(1);
		expect(migrations.changeSets[0].before).toEqual(actual);
		expect(migrations.changeSets[0].after).toEqual(expected);
	});
});
