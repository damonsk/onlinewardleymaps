import React, {MouseEventHandler, ReactNode, memo} from 'react';
import {MapTheme} from '../../constants/mapstyles';
import ComponentSymbol from '../symbols/ComponentSymbol';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import EcosystemSymbol from '../symbols/EcosystemSymbol';
import InertiaSymbol from '../symbols/InertiaSymbol';
import MarketSymbol from '../symbols/MarketSymbol';
import MethodSymbol from './MethodSymbol';

const iconWidth = '120px';
const hideLabelIconWidth = '50px';
const iconHeight = '40px';

export interface SVGWrapperProps {
    title?: string;
    style?: React.CSSProperties;
    mapStyleDefs: MapTheme;
    width: string;
    className?: string;
    height: string;
    viewBox?: string;
    children: ReactNode;
    onClick: React.MouseEventHandler<SVGSVGElement>;
}

export const SVGWrapper: React.FC<SVGWrapperProps> = ({
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
        xmlnsXlink="http://www.w3.org/1999/xlink">
        <title>{title}</title>
        {children}
    </svg>
);

const IconWrapper = memo(SVGWrapper);

export interface ComponentIconProps {
    id: string;
    evolved: boolean | undefined;
    text: string;
    onClick?: MouseEventHandler<SVGSVGElement>;
    mapStyleDefs: MapTheme;
    hideLabel?: boolean;
}

export const ComponentIcon: React.FC<ComponentIconProps> = ({id, mapStyleDefs, onClick, hideLabel = false, text, evolved}) => (
    <IconWrapper
        width={hideLabel ? hideLabelIconWidth : iconWidth}
        height={iconHeight}
        mapStyleDefs={mapStyleDefs}
        onClick={onClick ? onClick : () => {}}>
        {hideLabel === false && (
            <ComponentTextSymbol id={id} textTheme={mapStyleDefs.component} text={text || 'Component'} x="8" y="15" evolved={evolved} />
        )}
        <ComponentSymbol cx="8px" cy="25px" evolved={evolved} styles={mapStyleDefs.component} />
    </IconWrapper>
);

export const GenericNoteIcon: React.FC<IconProps> = ({id, hideLabel, mapStyleDefs, onClick}) => (
    <IconWrapper width={hideLabel ? hideLabelIconWidth : iconWidth} height={iconHeight} mapStyleDefs={mapStyleDefs} onClick={onClick}>
        <ComponentTextSymbol id={id} note={'note'} textTheme={mapStyleDefs.note} x="1" y="20" />
    </IconWrapper>
);

export const ComponentEvolvedIcon: React.FC<IconProps> = ({mapStyleDefs, id}) => (
    <ComponentIcon id={id} mapStyleDefs={mapStyleDefs} evolved text="Evolution" />
);

export interface IconProps {
    hideLabel: boolean;
    mapStyleDefs: MapTheme;
    id: string;
    onClick: MouseEventHandler<SVGSVGElement>;
}

export const InertiaIcon: React.FC<IconProps> = ({hideLabel, mapStyleDefs, id, onClick}) => (
    <IconWrapper width={hideLabel ? hideLabelIconWidth : iconWidth} height={iconHeight} mapStyleDefs={mapStyleDefs} onClick={onClick}>
        {hideLabel === false && <ComponentTextSymbol id={id} textTheme={mapStyleDefs.component} text="Inertia" x="8" y="15" />}
        <ComponentSymbol styles={mapStyleDefs.component} cx="8px" cy="25px" />
        <InertiaSymbol x={50} y={25} />
    </IconWrapper>
);

export const MarketIcon: React.FC<IconProps> = ({id, hideLabel, mapStyleDefs, onClick}) => (
    <IconWrapper width={hideLabel ? hideLabelIconWidth : iconWidth} height={iconHeight} mapStyleDefs={mapStyleDefs} onClick={onClick}>
        {hideLabel === false && <ComponentTextSymbol id={id} textTheme={mapStyleDefs.component} text="Market" x="45" y="15" />}
        <g transform="translate(20 20) scale(0.8)">
            <MarketSymbol
                styles={{
                    ...mapStyleDefs.component,
                    fill: mapStyleDefs.component?.fill ?? 'none',
                    stroke: mapStyleDefs.component?.stroke ?? 'none',
                }}
                onClick={() => {}}
            />
        </g>
    </IconWrapper>
);

export interface MethodIconProps extends IconProps {
    buy?: boolean;
    build?: boolean;
    outsource?: boolean;
}

export const MethodIcon: React.FC<MethodIconProps> = ({hideLabel, id, onClick, mapStyleDefs, buy, build, outsource}) => {
    // Determine method type from boolean flags
    let methodText = 'Build'; // Default
    if (buy) methodText = 'Buy';
    else if (outsource) methodText = 'Outsource';
    else if (build) methodText = 'Build';

    return (
        <IconWrapper width={hideLabel ? hideLabelIconWidth : iconWidth} height={iconHeight} mapStyleDefs={mapStyleDefs} onClick={onClick}>
            {hideLabel === false && <ComponentTextSymbol id={id} textTheme={mapStyleDefs.component} text={methodText} x="45" y="15" />}
            <g transform="translate(21 21) scale(0.8)">
                <MethodSymbol buy={buy} build={build} outsource={outsource} styles={mapStyleDefs.methods} x="0" y="0" />
            </g>
            <ComponentSymbol styles={mapStyleDefs.component} cx="21px" cy="21px" />
        </IconWrapper>
    );
};

export const BuyMethodIcon: React.FC<IconProps> = ({onClick, hideLabel, id, mapStyleDefs}) => (
    <MethodIcon id={id} buy={true} build={false} outsource={false} onClick={onClick} mapStyleDefs={mapStyleDefs} hideLabel={hideLabel} />
);

export const BuildMethodIcon: React.FC<IconProps> = ({id, onClick, mapStyleDefs, hideLabel}) => (
    <MethodIcon id={id} buy={false} build={true} outsource={false} onClick={onClick} mapStyleDefs={mapStyleDefs} hideLabel={hideLabel} />
);

export const OutSourceMethodIcon: React.FC<IconProps> = ({id, onClick, hideLabel, mapStyleDefs}) => (
    <MethodIcon id={id} buy={false} build={false} outsource={true} onClick={onClick} mapStyleDefs={mapStyleDefs} hideLabel={hideLabel} />
);

export const EcosystemIcon: React.FC<IconProps> = ({hideLabel, mapStyleDefs, onClick, id}) => (
    <IconWrapper width={hideLabel ? hideLabelIconWidth : iconWidth} height={iconHeight} mapStyleDefs={mapStyleDefs} onClick={onClick}>
        {hideLabel === false && <ComponentTextSymbol id={id} textTheme={mapStyleDefs.component} text="Ecosystem" x="45" y="15" />}
        <g transform="translate(21 21) scale(0.5)">
            <EcosystemSymbol styles={mapStyleDefs.component} />
        </g>
    </IconWrapper>
);
