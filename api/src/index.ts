import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import cors from 'cors';
import express, {Request, Response} from 'express';

interface SaveRequestBody {
    id?: string;
    text?: string;
    mapIterations?: string;
}

interface StoredMap {
    id: string;
    text: string;
    mapIterations: string;
}

const app = express();
const port = Number(process.env.PORT || 3001);
const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
const validId = /^[a-zA-Z0-9_-]+$/;

app.use(cors());
app.use(express.json({limit: '10mb'}));

const ensureDataDir = async (): Promise<void> => {
    await fs.mkdir(dataDir, {recursive: true});
};

const getSafeId = (candidateId?: string): string => {
    const id = candidateId && candidateId.trim() ? candidateId.trim() : crypto.randomUUID();
    if (!validId.test(id)) {
        throw new Error('Invalid id format');
    }
    return id;
};

const mapFilePath = (id: string): string => path.join(dataDir, `${id}.owm`);
const parseProvidedId = (candidateId: unknown): string => {
    if (typeof candidateId !== 'string' || !candidateId.trim()) {
        throw new Error('Missing id');
    }

    const id = candidateId.trim();
    if (!validId.test(id)) {
        throw new Error('Invalid id format');
    }

    return id;
};

app.get('/health', (_request: Request, response: Response) => {
    response.status(200).json({status: 'ok'});
});

app.post('/v1/maps/save', async (request: Request, response: Response) => {
    try {
        const {id: requestedId, text, mapIterations} = (request.body || {}) as SaveRequestBody;

        if (typeof text !== 'string') {
            response.status(400).json({message: 'Field "text" must be a string'});
            return;
        }

        if (mapIterations !== undefined && typeof mapIterations !== 'string') {
            response.status(400).json({message: 'Field "mapIterations" must be a string'});
            return;
        }

        const id = getSafeId(requestedId);
        const storedMap: StoredMap = {
            id,
            text,
            mapIterations: typeof mapIterations === 'string' ? mapIterations : '[]',
        };

        await ensureDataDir();
        await fs.writeFile(mapFilePath(id), JSON.stringify(storedMap, null, 2), 'utf8');

        response.status(200).json(storedMap);
    } catch (error) {
        if (error instanceof Error && error.message === 'Invalid id format') {
            response.status(400).json({message: error.message});
            return;
        }

        console.error('Save failed', error);
        response.status(500).json({message: 'Failed to save map'});
    }
});

app.get('/v1/maps/fetch', async (request: Request, response: Response) => {
    try {
        const id = parseProvidedId(request.query.id);
        const payload = await fs.readFile(mapFilePath(id), 'utf8');
        const storedMap = JSON.parse(payload) as StoredMap;
        response.status(200).json(storedMap);
    } catch (error) {
        if (error instanceof Error && error.message === 'Missing id') {
            response.status(400).json({message: 'Query parameter "id" is required'});
            return;
        }

        if (error instanceof Error && error.message === 'Invalid id format') {
            response.status(400).json({message: error.message});
            return;
        }

        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            response.status(404).json({message: 'Map not found'});
            return;
        }

        console.error('Fetch failed', error);
        response.status(500).json({message: 'Failed to fetch map'});
    }
});

ensureDataDir()
    .then(() => {
        app.listen(port, () => {
            console.log(`onlinewardleymaps-api listening on port ${port}`);
            console.log(`Using DATA_DIR=${dataDir}`);
        });
    })
    .catch(error => {
        console.error('Unable to initialize data directory', error);
        process.exit(1);
    });
