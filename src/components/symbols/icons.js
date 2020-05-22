import React, { memo } from 'react';

import ComponentSymbol from '../symbols/ComponentSymbol';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import InertiaSymbol from '../symbols/InertiaSymbol';

const iconWidth = '80px';
const iconHeight = '40px';

export const SVGWrapper = ({
	title = '',
	style = {},
	mapStyleDefs,
	width = '100%',
	className = '',
	height = '100%',
	viewBox,
	children,
}) => (
	<svg
		fontFamily={mapStyleDefs?.fontFamily}
		fontSize={mapStyleDefs?.fontSize}
		className={className || mapStyleDefs?.className}
		width={width}
		height={height}
		style={style}
		viewBox={viewBox}
		xmlns="http://www.w3.org/2000/svg"
		xmlnsXlink="http://www.w3.org/1999/xlink"
	>
		<title>{title}</title>
		{children}
	</svg>
);

const IconWrapper = memo(SVGWrapper);

export const ComponentIcon = props => (
	<IconWrapper
		width={iconWidth}
		height={iconHeight}
		mapStyleDefs={props.mapStyleDefs}
	>
		<ComponentTextSymbol
			styles={props.mapStyleDefs.component}
			text={props.text || 'Component'}
			x="8"
			y="15"
			evolved={props.evolved}
		/>
		<ComponentSymbol
			cx="8px"
			cy="25px"
			evolved={props.evolved}
			styles={props.mapStyleDefs.component}
		/>
	</IconWrapper>
);

export const ComponentEvolvedIcon = props => (
	<ComponentIcon mapStyleDefs={props.mapStyleDefs} evolved text="Evolution" />
);

export const InertiaIcon = props => (
	<IconWrapper
		width={iconWidth}
		height={iconHeight}
		mapStyleDefs={props.mapStyleDefs}
	>
		<ComponentTextSymbol
			styles={props.mapStyleDefs.component}
			text="Inertia"
			x="8"
			y="15"
		/>
		<ComponentSymbol styles={props.mapStyleDefs.component} cx="8px" cy="25px" />
		<InertiaSymbol x={50} y={25} />
	</IconWrapper>
);
