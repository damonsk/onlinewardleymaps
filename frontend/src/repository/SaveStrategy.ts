import { OwnApiWardleyMap } from './OwnApiWardleyMap';

export interface SaveStrategy {
  callback: (id: string, data: string) => void;
  save: (map: OwnApiWardleyMap, hash: string) => void;
}
