import React, { memo } from 'react';
import ComponentSymbol from '../symbols/ComponentSymbol';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import InertiaSymbol from '../symbols/InertiaSymbol';
import MarketSymbol from '../symbols/MarketSymbol';
import EcosystemSymbol from '../symbols/EcosystemSymbol';
import MethodSymbol from './MethodSymbol';

const iconWidth = '120px';
const hideLabelIconWidth = '50px';
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
	onClick,
}) => (
	<svg
		fontFamily={mapStyleDefs?.fontFamily}
		fontSize={mapStyleDefs?.fontSize}
		className={className || mapStyleDefs?.className}
		width={width}
		height={height}
		style={style}
		onClick={onClick}
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
		width={props.hideLabel ? hideLabelIconWidth : iconWidth}
		height={iconHeight}
		mapStyleDefs={props.mapStyleDefs}
		onClick={props.onClick}
	>
		{props.hideLabel === false && (
			<ComponentTextSymbol
				styles={props.mapStyleDefs.component}
				text={props.text || 'Component'}
				x="8"
				y="15"
				evolved={props.evolved}
			/>
		)}
		<ComponentSymbol
			cx="8px"
			cy="25px"
			evolved={props.evolved}
			styles={props.mapStyleDefs.component}
		/>
	</IconWrapper>
);

export const GenericNoteIcon = props => (
	<IconWrapper
		width={props.hideLabel ? hideLabelIconWidth : iconWidth}
		height={iconHeight}
		mapStyleDefs={props.mapStyleDefs}
		onClick={props.onClick}
	>
		<ComponentTextSymbol
			note={'note'}
			styles={props?.mapStyleDefs?.note}
			x="1"
			y="20"
		/>
	</IconWrapper>
);

export const ComponentEvolvedIcon = props => (
	<ComponentIcon mapStyleDefs={props.mapStyleDefs} evolved text="Evolution" />
);

export const InertiaIcon = props => (
	<IconWrapper
		width={props.hideLabel ? hideLabelIconWidth : iconWidth}
		height={iconHeight}
		mapStyleDefs={props.mapStyleDefs}
		onClick={props.onClick}
	>
		{props.hideLabel === false && (
			<ComponentTextSymbol
				styles={props.mapStyleDefs.component}
				text="Inertia"
				x="8"
				y="15"
			/>
		)}
		<ComponentSymbol styles={props.mapStyleDefs.component} cx="8px" cy="25px" />
		<InertiaSymbol x={50} y={25} />
	</IconWrapper>
);

export const MarketIcon = props => (
	<IconWrapper
		width={props.hideLabel ? hideLabelIconWidth : iconWidth}
		height={iconHeight}
		mapStyleDefs={props.mapStyleDefs}
		onClick={props.onClick}
	>
		{props.hideLabel === false && (
			<ComponentTextSymbol
				styles={props.mapStyleDefs.component}
				text="Market"
				x="45"
				y="15"
			/>
		)}
		<g transform="translate(20 20) scale(0.8)">
			<MarketSymbol styles={props.mapStyleDefs.component} />
		</g>
	</IconWrapper>
);

export const MethodIcon = props => (
	<IconWrapper
		width={props.hideLabel ? hideLabelIconWidth : iconWidth}
		height={iconHeight}
		mapStyleDefs={props.mapStyleDefs}
		onClick={props.onClick}
	>
		{props.hideLabel === false && (
			<ComponentTextSymbol
				styles={props.mapStyleDefs.component}
				text={props.method}
				x="45"
				y="15"
			/>
		)}
		<g transform="translate(21 21) scale(0.8)">
			<MethodSymbol
				method={props.method.toLowerCase()}
				styles={props.mapStyleDefs.methods}
				x="0"
				y="0"
			/>
		</g>
		<ComponentSymbol
			styles={props.mapStyleDefs.component}
			cx="21px"
			cy="21px"
		/>
	</IconWrapper>
);

export const BuyMethodIcon = props => (
	<MethodIcon
		method={'Buy'}
		onClick={props.onClick}
		mapStyleDefs={props.mapStyleDefs}
		hideLabel={props.hideLabel}
	/>
);

export const BuildMethodIcon = props => (
	<MethodIcon
		method={'Build'}
		onClick={props.onClick}
		mapStyleDefs={props.mapStyleDefs}
		hideLabel={props.hideLabel}
	/>
);

export const OutSourceMethodIcon = props => (
	<MethodIcon
		method={'Outsource'}
		onClick={props.onClick}
		mapStyleDefs={props.mapStyleDefs}
		hideLabel={props.hideLabel}
	/>
);

export const EcosystemIcon = props => (
	<IconWrapper
		width={props.hideLabel ? hideLabelIconWidth : iconWidth}
		height={iconHeight}
		mapStyleDefs={props.mapStyleDefs}
		onClick={props.onClick}
	>
		{props.hideLabel === false && (
			<ComponentTextSymbol
				styles={props.mapStyleDefs.component}
				text="Ecosystem"
				x="45"
				y="15"
			/>
		)}
		<g transform="translate(21 21) scale(0.5)">
			<EcosystemSymbol styles={props.mapStyleDefs.component} />
		</g>
	</IconWrapper>
);
