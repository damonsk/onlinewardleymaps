export const PageTitle =
    'OnlineWardleyMaps - Draw Wardley Maps in seconds using this free online tool';

export const ApiEndpoint = 'https://api.onlinewardleymaps.com/v1/maps/';

export const defaultLabelOffset = { x: 5, y: -10 };
export const increasedLabelOffset = { x: 5, y: -20 };

export enum MapPersistenceStrategy {
    Legacy = 'Legacy',
    Private = 'Private',
    Public = 'Public',
    PublicUnauthenticated = 'PublicUnauthenticated',
}

export interface Offsets {
    custom: number;
    product: number;
    commodity: number;
}

export const EvoOffsets: Offsets = {
    custom: 3.5,
    product: 8,
    commodity: 14,
};

export const DefaultMapObject = {
    title: '',
    elements: [],
    links: [],
    evolution: [],
    presentation: { style: 'plain' },
    methods: [],
    annotations: [],
};

export interface EvolutionStages {
    genesis: { l1: string; l2: string };
    custom: { l1: string; l2: string };
    product: { l1: string; l2: string };
    commodity: { l1: string; l2: string };
}

export const EvolutionStages: EvolutionStages = {
    genesis: { l1: 'Genesis', l2: '' },
    custom: { l1: 'Custom Built', l2: '' },
    product: { l1: 'Product', l2: '(+rental)' },
    commodity: { l1: 'Commodity', l2: '(+utility)' },
};

export const MapDimensions: MapDimensions = {
    width: 500,
    height: 600,
};

export interface MapDimensions {
    width: number;
    height: number;
}

export const ExampleMap = `title Campfire Coffee Shop
anchor Business [0.95, 0.63]
anchor Public [0.95, 0.78]
component Cup of Coffee [0.79, 0.61] label [-96, 3]
component Cup [0.73, 0.78]
component Coffee [0.63, 0.81]
component Hot Water [0.52, 0.80]
component Water [0.38, 0.82]
component Kettle [0.45, 0.57] label [-33, -16]
pipeline Kettle
{
  component Campfire Kettle [0.50] label [-29, 28]
  component Electric Kettle [0.63] label [-30, 25]
}

component Power [0.26, 0.80] label [-7, -15]
pipeline Power
{
  component Nuclear [0.81] label [-17, 35]
  component Solar [0.73] label [-20, 35]
  component Coal [0.88] label [-13, 35]
}

component Campfire [0.35, 0.30] label [-52, -10]
component Wood [0.10, 0.80] label [7, -7]
component Flint & Steel [0.19, 0.45] label [-16, 21]
component Trees [0.04, 0.82] label [10, -9]
component Areopress [0.68, 0.51] label [-69, 5]

Business->Cup of Coffee
Public->Cup of Coffee
Cup of Coffee->Cup
Cup of Coffee->Coffee
Cup of Coffee->Hot Water
Hot Water->Water
Hot Water->Kettle; limited by 
Electric Kettle->Power
Wood->Campfire
Flint & Steel->Campfire
Campfire Kettle->Campfire
Wood->Trees
Cup of Coffee->Areopress

annotation 1 [[0.51,0.62],[0.29,0.86] ] Standardising power allows Kettles to evolve faster
annotation 2 [0.48, 0.85] Hot water is obvious and well known
annotations [0.68, 0.02]

note campfires give customers a warm feeling [0.41, 0.15]

style wardley`;
