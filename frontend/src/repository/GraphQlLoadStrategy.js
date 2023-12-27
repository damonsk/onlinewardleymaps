import { API } from 'aws-amplify';
import { LoadStrategy } from './LoadStrategy';

export class GraphQlLoadStrategy extends LoadStrategy {
	constructor(config, callback) {
		super();
		this.config = config;
		this.callback = callback;
	}

	async load(id) {
		const response = await API.graphql({
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
