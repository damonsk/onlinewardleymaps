// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const { PublicMap, UnauthenticatedMap, Map } = initSchema(schema);

export { PublicMap, UnauthenticatedMap, Map };
