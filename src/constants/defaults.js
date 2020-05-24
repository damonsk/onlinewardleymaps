export const PageTitle =
	'OnlineWardleyMaps - Draw Wardley Maps in seconds using this free online tool';

export const ApiEndpoint = 'https://api.onlinewardleymaps.com/v1/maps/';

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

export const ExampleMap =
	'title Tea Shop' +
	'\r\n' +
	'anchor Business [0.95, 0.63]' +
	'\r\n' +
	'anchor Public [0.95, 0.78]' +
	'\r\n' +
	'component Cup of Tea [0.79, 0.61] label [19, -4]' +
	'\r\n' +
	'component Cup [0.73, 0.78]' +
	'\r\n' +
	'component Tea [0.63, 0.81]' +
	'\r\n' +
	'component Hot Water [0.52, 0.80]' +
	'\r\n' +
	'component Water [0.38, 0.82]' +
	'\r\n' +
	'component Kettle [0.43, 0.35] label [-57, 4]' +
	'\r\n' +
	'evolve Kettle 0.62 label [16, 7]' +
	'\r\n' +
	'component Power [0.1, 0.7] label [-27, 20]' +
	'\r\n' +
	'evolve Power 0.89 label [-12, 21]' +
	'\r\n' +
	'Business->Cup of Tea' +
	'\r\n' +
	'Public->Cup of Tea' +
	'\r\n' +
	'Cup of Tea->Cup' +
	'\r\n' +
	'Cup of Tea->Tea' +
	'\r\n' +
	'Cup of Tea->Hot Water' +
	'\r\n' +
	'Hot Water->Water' +
	'\r\n' +
	'Hot Water->Kettle ' +
	'\r\n' +
	'Kettle->Power' +
	'\r\n' +
	'\r\n' +
	'annotation 1 [[0.43,0.49],[0.08,0.79]] Standardising power allows Kettles to evolve faster' +
	'\r\n' +
	'annotation 2 [0.48, 0.85] Hot water is obvious and well known' +
	'\r\n' +
	'annotations [0.60, 0.02]' +
	'\r\n' +
	'\r\n' +
	'note +a generic note appeared [0.23, 0.33]' +
	'\r\n' +
	'\r\n' +
	'style wardley';
