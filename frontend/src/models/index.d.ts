import {
	ModelInit,
	MutableModel,
	PersistentModelConstructor,
} from '@aws-amplify/datastore';

type PublicMapMetaData = {
	readOnlyFields: 'createdAt' | 'updatedAt';
};

type UnauthenticatedMapMetaData = {
	readOnlyFields: 'createdAt' | 'updatedAt';
};

type MapMetaData = {
	readOnlyFields: 'createdAt' | 'updatedAt';
};

export declare class PublicMap {
	readonly id: string;
	readonly mapText?: string;
	readonly readOnly?: string;
	readonly name?: string;
	readonly imageData?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<PublicMap, PublicMapMetaData>);
	static copyOf(
		source: PublicMap,
		mutator: (
			draft: MutableModel<PublicMap, PublicMapMetaData>
		) => MutableModel<PublicMap, PublicMapMetaData> | void
	): PublicMap;
}

export declare class UnauthenticatedMap {
	readonly id: string;
	readonly mapText?: string;
	readonly name?: string;
	readonly imageData?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<UnauthenticatedMap, UnauthenticatedMapMetaData>);
	static copyOf(
		source: UnauthenticatedMap,
		mutator: (
			draft: MutableModel<UnauthenticatedMap, UnauthenticatedMapMetaData>
		) => MutableModel<UnauthenticatedMap, UnauthenticatedMapMetaData> | void
	): UnauthenticatedMap;
}

export declare class Map {
	readonly id: string;
	readonly mapText?: string;
	readonly private?: boolean;
	readonly name?: string;
	readonly imageData?: string;
	readonly createdAt?: string;
	readonly updatedAt?: string;
	constructor(init: ModelInit<Map, MapMetaData>);
	static copyOf(
		source: Map,
		mutator: (
			draft: MutableModel<Map, MapMetaData>
		) => MutableModel<Map, MapMetaData> | void
	): Map;
}
