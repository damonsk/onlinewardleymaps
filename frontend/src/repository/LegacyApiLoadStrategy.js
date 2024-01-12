import * as Defaults from '../constants/defaults';
import { LoadStrategy } from './LoadStrategy';

export class LegacyLoadStrategy extends LoadStrategy {
  async load(id) {
    const fetchUrl = Defaults.ApiEndpoint + 'fetch?id=' + id;
    const response = await fetch(fetchUrl);
    const data = await response.json();
    const newObj = {
      id: data.id,
      mapText: data.text,
      mapIterations: data.mapIterations ? JSON.parse(data.mapIterations) : [],
    };
    this.callback(Defaults.MapPersistenceStrategy.Legacy, newObj);
  }
}
