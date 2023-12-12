import { API } from 'aws-amplify';
import { SaveStrategy } from './SaveStrategy';

export class GraphQlSaveStrategy extends SaveStrategy {
	constructor(config, callback) {
		super();
		this.config = config;
		this.callback = callback;
	}

	async save(map, hash) {
		const input = Object.assign(map, {
			id: hash,
			mapIterations: JSON.stringify(map.mapIterations),
		});

		const response = await API.graphql({
			query: this.config.query,
			variables: { input },
			authMode: this.config.authMode,
			operationName: this.config.operationName,
		});

		const data = response.data[this.config.operationName];
		this.callback(data.id, data);
	}
}
