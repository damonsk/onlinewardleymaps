
interface MapTitleProps {
	mapTitle: string;
}
function MapTitle(props: MapTitleProps) {
	const { mapTitle } = props;

	return (
		<text
			x={0}
			y={-10}
			// is="custom"
			id={'mapTitle'}
			font-weight={'bold'}
			font-size={'20px'}
			fontWeight={'bold'}
			fontSize={'20px'}
			fontFamily='"Helvetica Neue",Helvetica,Arial,sans-serif'
		>
			{mapTitle}
		</text>
	);
}

export default MapTitle;
