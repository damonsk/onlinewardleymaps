import { rename } from '../constants/rename';

describe('Given I Want To Rename', function () {
    test('When rename of component, component is renamed', function () {
        const mapText =
            'component foobar [0.9, 0.1]' + '\n' + 'component foo [0.9, 0.1]';
        rename(2, 'foo', 'some thing', mapText, (result) => {
            const lines = result.split('\n');
            expect(lines[0]).toEqual('component foobar [0.9, 0.1]');
            expect(lines[1]).toEqual('component some thing [0.9, 0.1]');
        });
    });

    test('When rename of component, links are renamed', function () {
        const mapText =
            'component foobar [0.9, 0.1]' +
            '\n' +
            'component foo [0.9, 0.1]' +
            '\n' +
            'foo->foobar' +
            '\n' +
            'foobar->foo';
        rename(2, 'foo', 'some thing', mapText, (result) => {
            const lines = result.split('\n');
            expect(lines[2]).toEqual('some thing->foobar');
            expect(lines[3]).toEqual('foobar->some thing');
        });
    });

    test('When rename of component, links are renamed even when additional whitespace is present', function () {
        const mapText =
            'component foobar [0.9, 0.1]' +
            '\n' +
            'component foo [0.9, 0.1]' +
            '\n' +
            'foo ->  foobar' +
            '\n' +
            'foobar ->  foo';
        rename(2, 'foo', 'some thing', mapText, (result) => {
            const lines = result.split('\n');
            expect(lines[2]).toEqual('some thing->foobar');
            expect(lines[3]).toEqual('foobar->some thing');
        });
    });

    test('When rename of component, links are renamed even when conditional note is present', function () {
        const mapText =
            'component foobar [0.9, 0.1]' +
            '\n' +
            'component foo [0.9, 0.1]' +
            '\n' +
            'foo ->  foobar;limited by' +
            '\n' +
            'foobar ->  foo;limited by';
        rename(2, 'foo', 'some thing', mapText, (result) => {
            const lines = result.split('\n');
            expect(lines[2]).toEqual('some thing->foobar;limited by');
            expect(lines[3]).toEqual('foobar->some thing;limited by');
        });
    });

    test('When rename of component and it is also a pipeline, pipeline is also updated', function () {
        const mapText =
            'component foobar [0.9, 0.1]' +
            '\n' +
            'component foo [0.9, 0.1]' +
            '\n' +
            'pipeline foo ' +
            '\n' +
            'pipeline foobar';
        rename(2, 'foo', 'some thing', mapText, (result) => {
            const lines = result.split('\n');
            expect(lines[1]).toEqual('component some thing [0.9, 0.1]');
            expect(lines[2]).toEqual('pipeline some thing');
            expect(lines[3]).toEqual('pipeline foobar');
        });
    });

    test('When rename of component and it is also evolved, evolved is also updated', function () {
        const mapText =
            'component foobar [0.9, 0.1]' +
            '\n' +
            'component foo [0.9, 0.1]' +
            '\n' +
            'evolve foo 0.9' +
            '\n' +
            'evolve foobar 0.9';
        rename(2, 'foo', 'some thing', mapText, (result) => {
            const lines = result.split('\n');
            expect(lines[0]).toEqual('component foobar [0.9, 0.1]');
            expect(lines[1]).toEqual('component some thing [0.9, 0.1]');
            expect(lines[2]).toEqual('evolve some thing 0.9');
            expect(lines[3]).toEqual('evolve foobar 0.9');
        });
    });

    test('When rename of component and it is also evolved and has a new name, evolved is also updated', function () {
        const mapText =
            'component foobar [0.9, 0.1]' +
            '\n' +
            'component foo [0.9, 0.1]' +
            '\n' +
            'evolve foo->baz 0.9' +
            '\n' +
            'evolve foobar 0.9';
        rename(2, 'foo', 'some thing', mapText, (result) => {
            const lines = result.split('\n');
            expect(lines[0]).toEqual('component foobar [0.9, 0.1]');
            expect(lines[1]).toEqual('component some thing [0.9, 0.1]');
            expect(lines[2]).toEqual('evolve some thing->baz 0.9');
            expect(lines[3]).toEqual('evolve foobar 0.9');
        });
    });

    test('When rename of component and it is also market or ecosystem, market or ecosystem is also updated', function () {
        ['market', 'ecosystem'].map((t) => {
            const mapText =
                'component foobar [0.9, 0.1]' +
                '\n' +
                `${t} foo [0.9, 0.1]` +
                '\n' +
                `${t} foobarbaz [0.9, 0.1]`;
            rename(2, 'foo', 'some thing', mapText, (result) => {
                const lines = result.split('\n');
                expect(lines[0]).toEqual('component foobar [0.9, 0.1]');
                expect(lines[1]).toEqual(`${t} some thing [0.9, 0.1]`);
                expect(lines[2]).toEqual(`${t} foobarbaz [0.9, 0.1]`);
            });
        });
    });

    test('When rename of component and it is also build, buy, outsource, build is also updated', function () {
        ['build', 'buy', 'outsource'].map((t) => {
            const mapText =
                'component foobar [0.9, 0.1]' +
                '\n' +
                'component foo [0.9, 0.1]' +
                '\n' +
                `${t} foo`;
            rename(2, 'foo', 'some thing', mapText, (result) => {
                const lines = result.split('\n');
                expect(lines[0]).toEqual('component foobar [0.9, 0.1]');
                expect(lines[1]).toEqual('component some thing [0.9, 0.1]');
                expect(lines[2]).toEqual(`${t} some thing`);
            });
        });
    });
});
