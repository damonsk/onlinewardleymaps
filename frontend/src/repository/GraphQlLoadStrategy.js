import { generateClient } from 'aws-amplify/api';
import { LoadStrategy } from './LoadStrategy';

export class GraphQlLoadStrategy extends LoadStrategy {
  constructor(config, callback) {
    super();
    this.config = config;
    this.callback = callback;
  }

  async load(id) {
    const client = generateClient();
    const response = await client.graphql({
      query: this.config.query,
      variables: { id },
      authMode: this.config.authMode,
      operationName: this.config.operationName,
    });
    const mapIterations =
      response.data[this.config.operationName].mapIterations || [];
    const map = Object.assign(response.data[this.config.operationName], {
      mapIterations: JSON.parse(mapIterations),
    });
    this.callback(this.config.mapPersistenceStrategy, map);
  }
}
