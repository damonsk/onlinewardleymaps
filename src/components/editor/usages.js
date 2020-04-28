const usages = [
	{
		toolbarButtonText: 'Create Component',
		title: 'To create a component',
		summary: 'component Name [Visibility (Y Axis), Maturity (X Axis)]',
		example: 'component Customer [0.9, 0.5]',
		example2: 'component Cup of Tea [0.9, 0.5]',
	},
	{
		toolbarButtonText: 'Inertia',
		title: 'Inertia - component likely to face resistance to change.',
		summary: 'component Name [Visibility (Y Axis), Maturity (X Axis)] inertia',
		example: 'component Customer [0.95, 0.5] inertia',
		example2: 'component Cup of Tea [0.9, 0.5] inertia',
	},
	{
		title: 'To evolve a component',
		summary: 'evole Name (X Axis)',
		example: 'evolve Customer 0.8',
		example2: 'evolve Cup of Tea evolve 0.8',
	},
	{
		title: 'To link components',
		summary: '',
		example: 'Start Component->End Component',
		example2: 'Customer->Cup of Tea',
	},
	{
		title: 'To indicate flow',
		summary: '',
		example: 'Start Component+<>End Component',
		example2: 'Customer+<>Cup of Tea',
	},
	{
		title: 'To set component as pipeline:',
		summary: 'pipeline Component Name [X Axis (start), X Axis (end)]',
		example: 'pipeline Customer [0.15, 0.9]',
		example2: 'pipeline Customer',
	},
	{
		title: 'To indicate flow - past components only',
		summary: '',
		example: 'Start Component+<End Component',
		example2: 'Hot Water+<Kettle',
	},
	{
		title: 'To indicate flow - future components only',
		summary: '',
		example: 'Start Component+>End Component',
		example2: 'Hot Water+>Kettle',
	},
	{
		title: 'To indicate flow - with label',
		summary: '',
		example: "Start Component+'insert text'>End Component",
		example2: "Hot Water+'$0.10'>Kettle",
	},
	{
		title: 'Stages of Evolution',
		summary: 'Change the stages of evolution labels on the map',
		example: 'evolution First->Second->Third->Fourth',
		example2: 'evolution Novel->Emerging->Good->Best',
	},
	{
		title: 'Y-Axis Labels',
		summary: 'Change the text of the y-axis labels',
		example: 'y-axis Label->Min->Max',
		example2: 'y-axis Value Chain->Invisible->Visible',
	},
	{
		title: 'Add notes',
		summary: 'Add text to any part of the map',
		example: 'note Note Text [0.9, 0.5]',
		example2: 'note +future development [0.9, 0.5]',
	},
	{
		title: 'Available styles',
		summary: 'Change the look and feel of a map',
		example: 'style wardley',
		example2: 'style handwritten',
		example3: 'style colour',
	},
];

export default usages;
