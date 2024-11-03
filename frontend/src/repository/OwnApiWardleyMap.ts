export interface OwnApiWardleyMap {
    readOnly: boolean;
    owner: string;
    mapText: string;
    imageData: string;
    mapIterations: Array<MapIteration>;
}

export interface MapIteration {
    mapText: string;
    name: string;
}
