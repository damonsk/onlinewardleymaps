import assert from 'node:assert/strict';
import {once} from 'node:events';
import fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {createApp} from '../src/index';

interface StoredMap {
    id: string;
    text: string;
    mapIterations: string;
}

test('saves a map to disk and reopens it without changing its iterations', async () => {
    const dataDir = await fs.mkdtemp(path.join(tmpdir(), 'onlinewardleymaps-api-'));
    const app = createApp({dataDir});
    const server = app.listen(0, '127.0.0.1');

    try {
        await once(server, 'listening');
        const address = server.address();
        if (!address || typeof address === 'string') {
            throw new Error('Expected the API test server to listen on a TCP port');
        }

        const baseUrl = `http://127.0.0.1:${address.port}`;
        const id = 'baseline-roundtrip';
        const text = 'title Baseline round trip\ncomponent Customer [0.90, 0.50]';
        const iterations = [
            {
                name: 'Initial',
                mapText: 'title Initial\ncomponent Customer [0.90, 0.50]',
            },
            {name: 'Current', mapText: text},
        ];
        const mapIterations = JSON.stringify(iterations);
        const expected: StoredMap = {id, text, mapIterations};

        const saveResponse = await fetch(`${baseUrl}/v1/maps/save`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(expected),
        });

        assert.equal(saveResponse.status, 200);
        assert.deepEqual((await saveResponse.json()) as StoredMap, expected);

        const storedFiles = await fs.readdir(dataDir);
        assert.deepEqual(storedFiles, [`${id}.owm`]);
        const storedMap = JSON.parse(await fs.readFile(path.join(dataDir, `${id}.owm`), 'utf8')) as StoredMap;
        assert.deepEqual(storedMap, expected);

        const reopenResponse = await fetch(`${baseUrl}/v1/maps/fetch?id=${id}`);
        assert.equal(reopenResponse.status, 200);

        const reopened = (await reopenResponse.json()) as StoredMap;
        assert.deepEqual(reopened, expected);
        assert.deepEqual(JSON.parse(reopened.mapIterations), iterations);
    } finally {
        if (server.listening) {
            await new Promise<void>((resolve, reject) => {
                server.close(error => (error ? reject(error) : resolve()));
            });
        }
        await fs.rm(dataDir, {recursive: true, force: true});
    }
});
