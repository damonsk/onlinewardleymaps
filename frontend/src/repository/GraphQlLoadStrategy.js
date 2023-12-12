import { API } from 'aws-amplify';
import { LoadStrategy } from './LoadStrategy';

export class GraphQlLoadStrategy extends LoadStrategy {
	constructor(config) {
		super();
		this.config = config;
	}

	async load(id) {
		const response = await API.graphql({
			query: this.config.query,
			variables: { id },
			authMode: this.config.authMode,
			operationName: this.config.authMode,
		});
		this.callback(this.config.mapPersistenceStrategy, response.data.getMap);
	}
}
