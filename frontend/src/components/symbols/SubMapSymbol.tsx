import React, {memo, MouseEvent} from 'react';
import {MapComponentTheme} from '../../constants/mapstyles';
import {UnifiedComponent} from '../../types/unified';

/**
 * SubMapSymbol Props - using unified type system directly
 * This interface eliminates legacy types and improves type safety
 */
interface ModernSubMapSymbolProps {
    id?: string;
    cx?: string;
    cy?: string;
    onClick: (e: MouseEvent<SVGElement>) => void;
    styles: MapComponentTheme;
    launchUrl?: () => void;
    component?: UnifiedComponent; // Direct reference to UnifiedComponent
}

/**
 * SubMapSymbol - SubMap symbol representation using unified types
 * This component eliminates legacy type dependencies and improves rendering performance
 */
const SubMapSymbol: React.FC<ModernSubMapSymbolProps> = ({
    id,
    cx,
    cy,
    onClick,
    styles,
    launchUrl,
    component, // Direct access to UnifiedComponent
}) => {
    // Use component properties directly from unified type
    const evolved = component?.evolved || false;
    const fill = evolved ? styles.evolvedFill : styles.fill;
    const stroke = evolved ? styles.evolved : styles.stroke;

    return (
        <>
            <rect
                x="-20"
                y="-6"
                stroke={'none'}
                width={'30px'}
                fillOpacity="0"
                className={'submapLink'}
                onClick={launchUrl}
                height={'12px'}
            />
            <g transform={'translate(-23, -8)'}>
                <svg
                    onClick={launchUrl}
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 16 16"
                    color="black"
                    className="submapLink"
                    height="18px"
                    width="18px"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{color: 'black'}}>
                    <path d="M4.715 6.542L3.343 7.914a3 3 0 104.243 4.243l1.828-1.829A3 3 0 008.586 5.5L8 6.086a1.001 1.001 0 00-.154.199 2 2 0 01.861 3.337L6.88 11.45a2 2 0 11-2.83-2.83l.793-.792a4.018 4.018 0 01-.128-1.287z"></path>
                    <path d="M5.712 6.96l.167-.167a1.99 1.99 0 01.896-.518 1.99 1.99 0 01.518-.896l.167-.167A3.004 3.004 0 006 5.499c-.22.46-.316.963-.288 1.46z"></path>
                    <path d="M6.586 4.672A3 3 0 007.414 9.5l.775-.776a2 2 0 01-.896-3.346L9.12 3.55a2 2 0 012.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 00-4.243-4.243L6.586 4.672z"></path>
                    <path d="M10 9.5a2.99 2.99 0 00.288-1.46l-.167.167a1.99 1.99 0 01-.896.518 1.99 1.99 0 01-.518.896l-.167.167A3.004 3.004 0 0010 9.501z"></path>
                </svg>
            </g>
            <circle
                id={id}
                cx={cx}
                cy={cy}
                strokeWidth={styles.strokeWidth}
                r={styles.radius}
                stroke={stroke}
                fill={fill}
                onClick={onClick}
            />
        </>
    );
};

export default memo(SubMapSymbol);
