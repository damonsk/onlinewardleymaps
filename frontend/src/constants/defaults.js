export const PageTitle =
	'OnlineWardleyMaps - Draw Wardley Maps in seconds using this free online tool';

export const ApiEndpoint = 'https://api.onlinewardleymaps.com/v1/maps/';

export const defaultLabelOffset = { x: 5, y: -10 };
export const increasedLabelOffset = { x: 5, y: -20 };

export const MapPersistenceStrategy = {
	Legacy: 'Legacy',
	Private: 'Private',
	Public: 'Public',
	PublicUnauthenticated: 'PublicUnauthenticated',
};

export const EvoOffsets = {
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

export const EvolutionStages = {
	genesis: { l1: 'Genesis', l2: '' },
	custom: { l1: 'Custom Built', l2: '' },
	product: { l1: 'Product', l2: '(+rental)' },
	commodity: { l1: 'Commodity', l2: '(+utility)' },
};

export const MapDimensions = {
	width: 500,
	height: 600,
};

export const ExampleMap = `title Tea Shop
anchor Business [0.95, 0.63]
anchor Public [0.95, 0.78]
component Cup of Tea [0.79, 0.61] label [-76, 3]
component Cup [0.73, 0.78]
component Tea [0.63, 0.81]
component Hot Water [0.52, 0.80]
component Water [0.38, 0.82]
component Kettle [0.43, 0.35] label [-57, 4] (inertia)
evolve Kettle 0.62 label [16, 7]

component Power [0.17, 0.79] label [-7, -15]
pipeline Power
{
  component Nuclear [0.89] label [-17.00, 35.00]
  component Solar [0.73] label [-20.00, 35.00]
  component Coal [0.81] label [-13.00, 35.00]
}

Business->Cup of Tea
Public->Cup of Tea
Cup of Tea->Cup
Cup of Tea->Tea
Cup of Tea->Hot Water
Hot Water->Water
Hot Water->Kettle; limited by 
Kettle->Power

annotation 1 [[0.43,0.49],[0.21,0.73] ] Standardising power allows Kettles to evolve faster
annotation 2 [0.48, 0.85] Hot water is obvious and well known
annotations [0.60, 0.02]

note +a generic note appeared [0.23, 0.33]

style wardley`;
