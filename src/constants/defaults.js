export const PageTitle =
	'OnlineWardleyMaps - Draw Wardley Maps in seconds using this free online tool';

export const ApiEndpoint = 'https://api.onlinewardleymaps.com/v1/maps/';

export const defaultLabelOffset = { x: 5, y: -10 };
export const increasedLabelOffset = { x: 5, y: -20 };

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
component Cup of Tea [0.79, 0.61] label [19, -4]
component Cup [0.73, 0.78]
component Tea [0.63, 0.81]
component Hot Water [0.52, 0.80]
component Water [0.38, 0.82]
component Kettle [0.43, 0.35] label [-57, 4]
evolve Kettle 0.62 label [16, 7]
component Power [0.1, 0.7] label [-27, 20]
evolve Power 0.89 label [-12, 21]
Business->Cup of Tea
Public->Cup of Tea
Cup of Tea->Cup
Cup of Tea->Tea
Cup of Tea->Hot Water
Hot Water->Water
Hot Water->Kettle 
Kettle->Power

annotation 1 [[0.43,0.49],[0.08,0.79]] Standardising power allows Kettles to evolve faster
annotation 2 [0.48, 0.85] Hot water is obvious and well known
annotations [0.60, 0.02]

note +a generic note appeared [0.23, 0.33]

style wardley`;
