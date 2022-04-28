import {
	ComponentIcon,
	InertiaIcon,
	ComponentEvolvedIcon,
} from '../components/symbols/icons';

const usages = [
	{
		title: 'To set the title',
		summary: '',
		examples: ['title My Wardley Map'],
	},
	{
		toolbarButtonText: 'Create Component',
		Icon: ComponentIcon,
		title: 'To create a component',
		summary: 'component Name [Visibility (Y Axis), Maturity (X Axis)]',
		examples: [
			'component Customer [0.9, 0.5]',
			'component Cup of Tea [0.9, 0.5]',
		],
	},
	{
		toolbarButtonText: 'Create Market',
		Icon: ComponentIcon,
		title: 'To create a market',
		summary: 'market Name [Visibility (Y Axis), Maturity (X Axis)]',
		examples: [
			'market Customer [0.9, 0.5]',
			'market Cup of Tea [0.9, 0.5]',
			'evolve Customer 0.9 (market)',
		],
	},
	{
		toolbarButtonText: 'Inertia',
		Icon: InertiaIcon,
		title: 'Inertia - component likely to face resistance to change.',
		summary: 'component Name [Visibility (Y Axis), Maturity (X Axis)] inertia',
		examples: [
			'component Customer [0.95, 0.5] inertia',
			'component Cup of Tea [0.9, 0.5] inertia',
			'market Cup of Tea [0.9, 0.5] inertia',
		],
	},
	{
		Icon: ComponentEvolvedIcon,
		title: 'To evolve a component',
		summary: 'evole Name (X Axis)',
		examples: ['evolve Customer 0.8', 'evolve Cup of Tea evolve 0.8'],
	},
	{
		title: 'To link components',
		summary: '',
		examples: ['Start Component->End Component', 'Customer->Cup of Tea'],
	},
	{
		title: 'To indicate flow',
		summary: '',
		examples: ['Start Component+<>End Component', 'Customer+<>Cup of Tea'],
	},
	{
		title: 'To set component as pipeline:',
		summary: 'pipeline Component Name [X Axis (start), X Axis (end)]',
		examples: ['pipeline Customer [0.15, 0.9]', 'pipeline Customer'],
	},
	{
		title: 'To indicate flow - past components only',
		summary: '',
		examples: ['Start Component+<End Component', 'Hot Water+<Kettle'],
	},
	{
		title: 'To indicate flow - future components only',
		summary: '',
		examples: ['Start Component+>End Component', 'Hot Water+>Kettle'],
	},
	{
		title: 'To indicate flow - with label',
		summary: '',
		examples: [
			"Start Component+'insert text'>End Component",
			"Hot Water+'$0.10'>Kettle",
		],
	},
	{
		title: 'Pioneers, Settlers, Townplanners area',
		summary:
			'Add areas indicating which type of working approach supports component development',
		examples: [
			'pioneers [<visibility>, <maturity>, <visibility2>, <maturity2>]',
			'settlers [0.59, 0.43, 0.49, 0.63]',
			'townplanners [0.31, 0.74, 0.15, 0.95]',
		],
	},
	{
		title: 'Build, buy, outsource components',
		summary:
			'Highlight a component with a build, buy, or outsource method of execution',
		examples: [
			'build <component>',
			'buy <component>',
			'outsource <component>',
			'component Customer [0.9, 0.2] (buy)',
			'component Customer [0.9, 0.2] (build)',
			'component Customer [0.9, 0.2] (outsource)',
			'evolve Customer 0.9 (outsource)',
			'evolve Customer 0.9 (buy)',
			'evolve Customer 0.9 (build)',
		],
	},
	{
		title: 'Link submap to a component',
		summary:
			'Add a reference link to a submap. A component becomes a link to an other Wardley Map',
		examples: [
			'submap Component [<visibility>, <maturity>] url(urlName)',
			'url urlName [URL]',
			'submap Website [0.83, 0.50] url(submapUrl)',
			'url submapUrl [https://onlinewardleymaps.com/#clone:qu4VDDQryoZEnuw0ZZ]',
		],
	},
	{
		title: 'Stages of Evolution',
		summary: 'Change the stages of evolution labels on the map',
		examples: [
			'evolution First->Second->Third->Fourth',
			'evolution Novel->Emerging->Good->Best',
		],
	},
	{
		title: 'Y-Axis Labels',
		summary: 'Change the text of the y-axis labels',
		examples: [
			'y-axis Label->Min->Max',
			'y-axis Value Chain->Invisible->Visible',
		],
	},
	{
		title: 'Add notes',
		summary: 'Add text to any part of the map',
		examples: [
			'note Note Text [0.9, 0.5]',
			'note +future development [0.9, 0.5]',
		],
	},
	{
		title: 'Available styles',
		summary: 'Change the look and feel of a map',
		examples: ['style wardley', 'style handwritten', 'style colour'],
	},
];

export default usages;
