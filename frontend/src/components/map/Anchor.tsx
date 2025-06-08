import React, {MouseEvent} from 'react';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import {UnifiedComponent} from '../../types/unified';
import {useModKeyPressedConsumer} from '../KeyPressContext';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import Movable from './Movable';
import ModernPositionCalculator from './ModernPositionCalculator';
import ModernDefaultPositionUpdater from './positionUpdaters/ModernDefaultPositionUpdater';
import {ModernExistingCoordsMatcher} from './positionUpdaters/ModernExistingCoordsMatcher';
import {ModernNotDefinedCoordsMatcher} from './positionUpdaters/ModernNotDefinedCoordsMatcher';

interface ModernAnchorProps {
    anchor: UnifiedComponent;
    mapDimensions: MapDimensions;
    mapText: string;
    mutateMapText: (...args: any[]) => any;
    mapStyleDefs: MapTheme;
    onClick: (event: MouseEvent) => void;
}

/**
 * Anchor - Modern implementation using unified types
 * Part of Phase 4 Component Interface Modernization
 *
 * This component renders anchors (user needs) on a Wardley Map
 */
const Anchor: React.FunctionComponent<ModernAnchorProps> = ({anchor, mapText, mutateMapText, mapDimensions, mapStyleDefs, onClick}) => {
    const isModKeyPressed = useModKeyPressedConsumer();
    const identity = 'anchor';
    const elementKey = (prefix: string = '', suffix: string = '') => {
        return `${identity}_${prefix !== undefined ? prefix + '_' : ''}${anchor.id}${suffix !== undefined ? '_' + suffix : ''}`;
    };

    const positionCalc = new ModernPositionCalculator();
    const positionUpdater = new ModernDefaultPositionUpdater(identity, mapText, mutateMapText, [
        ModernExistingCoordsMatcher,
        ModernNotDefinedCoordsMatcher,
    ]);
    const x = () => positionCalc.maturityToX(anchor.maturity, mapDimensions.width);
    const y = () => positionCalc.visibilityToY(anchor.visibility, mapDimensions.height);

    function endDrag(moved: {y: number; x: number}) {
        const visibility = positionCalc.yToVisibility(moved.y, mapDimensions.height);
        const maturity = positionCalc.xToMaturity(moved.x, mapDimensions.width);
        positionUpdater.update({param1: visibility, param2: maturity}, anchor.name);
    }

    return (
        <>
            <Movable id={elementKey()} onMove={endDrag} x={x()} y={y()} fixedY={false} fixedX={false} isModKeyPressed={isModKeyPressed}>
                <ComponentTextSymbol
                    id={elementKey('text')}
                    text={anchor.name}
                    x="0"
                    y="-10"
                    textAnchor="middle"
                    evolved={anchor.evolved}
                    textTheme={mapStyleDefs.component}
                    onClick={onClick}
                />
            </Movable>
        </>
    );
};

export default React.memo(Anchor);
