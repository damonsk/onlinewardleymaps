import {ComponentEvolvedIcon, ComponentIcon, InertiaIcon} from '../components/symbols/icons';

type IconComponentType = typeof ComponentIcon | typeof ComponentEvolvedIcon | typeof InertiaIcon;

interface Usage {
    title: string;
    summary: string;
    examples: string[];
    toolbarButtonText?: string;
    Icon?: IconComponentType;
}
const usages: Usage[] = [
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
        examples: ['component Customer [0.9, 0.5]', 'component Cup of Tea [0.9, 0.5]'],
    },
    {
        toolbarButtonText: 'Inertia',
        Icon: InertiaIcon,
        title: 'Inertia - component likely to face resistance to change.',
        summary: 'component Name [Visibility (Y Axis), Maturity (X Axis)] inertia',
        examples: ['component Customer [0.95, 0.5] inertia', 'component Cup of Tea [0.9, 0.5] inertia'],
    },
    {
        Icon: ComponentEvolvedIcon,
        title: 'To evolve a component',
        summary: 'evole Name (X Axis)',
        examples: ['evolve Physical 0.8', 'evolve Cup of Tea evolve 0.8'],
    },
    {
        Icon: ComponentEvolvedIcon,
        title: 'To evolve a component with new name',
        summary: 'evole Name->NewName (X Axis)',
        examples: ['evolve Physical->Virtual 0.8'],
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
        toolbarButtonText: 'Create Market',
        Icon: ComponentIcon,
        title: 'To create a market',
        summary: 'component Name [Visibility (Y Axis), Maturity (X Axis)] (market)',
        examples: ['component Customer [0.9, 0.5] (market)', 'component Cup of Tea [0.9, 0.5] (market)', 'evolve Customer 0.9 (market)'],
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
        examples: ["Start Component+'insert text'>End Component", "Hot Water+'$0.10'>Kettle"],
    },
    {
        title: 'Pioneers, Settlers, Townplanners area',
        summary: 'Add areas indicating which type of working approach supports component development',
        examples: [
            'pioneers [<visibility>, <maturity>, <visibility2>, <maturity2>]',
            'settlers [0.59, 0.43, 0.49, 0.63]',
            'townplanners [0.31, 0.74, 0.15, 0.95]',
        ],
    },
    {
        title: 'Build, buy, outsource components',
        summary: 'Highlight a component with a build, buy, or outsource method of execution',
        examples: [
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
        summary: 'Add a reference link to a submap. A component becomes a link to another Wardley Map',
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
        examples: ['evolution First->Second->Third->Fourth', 'evolution Novel->Emerging->Good->Best'],
    },
    {
        title: 'Add notes',
        summary: 'Add text to any part of the map',
        examples: ['note Note Text [0.9, 0.5]', 'note +future development [0.9, 0.5]'],
    },
    {
        title: 'Available styles',
        summary: 'Change the look and feel of a map',
        examples: ['style wardley', 'style handwritten', 'style colour', 'style dark'],
    },
    {
        title: 'Accelerator/Deaccelerator',
        summary: 'An attempt to alter the map',
        examples: ['accelerator foobar [0.1, 0.8]', 'deaccelerator barbaz [0.2, 0.7]'],
    },
];

export default usages;
