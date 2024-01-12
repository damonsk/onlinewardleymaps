import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';
import { generateClient } from 'aws-amplify/api';
import { OwnApiWardleyMap } from './OwnApiWardleyMap';
import { SaveStrategy } from './SaveStrategy';

interface GraphQlSaveStrategyOptions {
  query: string;
  operationName: string;
  authMode: GraphQLAuthMode | undefined;
}

interface OwmGraphQLResult {
  data: OwmGraphQLWardleyMap;
}

interface OwmGraphQLWardleyMap {
  id: string;
}

export class GraphQlSaveStrategy implements SaveStrategy {
  callback: (id: string, data: string) => void;
  config: GraphQlSaveStrategyOptions;

  constructor(
    config: GraphQlSaveStrategyOptions,
    callback: (id: string, data: string) => void,
  ) {
    this.config = config;
    this.callback = callback;
  }

  async save(map: OwnApiWardleyMap, hash: string) {
    const input = Object.assign(map, {
      id: hash,
      mapIterations: JSON.stringify(map.mapIterations),
    });
    const client = generateClient();
    const response = (await client.graphql({
      query: this.config.query,
      variables: { input },
      authMode: this.config.authMode,
      // operationName: this.config.operationName,
    })) as OwmGraphQLResult;

    const data = response.data;
    this.callback(data.id, JSON.stringify(data));
  }
}
