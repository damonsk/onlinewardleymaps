import React, { MouseEvent } from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapAnchors } from '../../types/base';
import { MapTheme } from '../../types/map/styles';
import { useModKeyPressedConsumer } from '../KeyPressContext';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import Movable from './Movable';
import PositionCalculator from './PositionCalculator';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import { NotDefinedCoordsMatcher } from './positionUpdaters/NotDefinedCoordsMatcher';

export interface MapAchor {
    evolved: boolean;
    name: string;
    maturity: number;
    visibility: number;
    id: string;
}

interface AnchorProps {
    anchor: MapAnchors;
    mapDimensions: MapDimensions;
    mapText: string;
    mutateMapText: (...args: any[]) => any;
    mapStyleDefs: MapTheme;
    onClick: (event: MouseEvent) => void;
}

const Anchor: React.FunctionComponent<AnchorProps> = ({
    anchor,
    mapText,
    mutateMapText,
    mapDimensions,
    mapStyleDefs,
    onClick,
}) => {
    const isModKeyPressed = useModKeyPressedConsumer();
    const identity = 'anchor';
    const elementKey = (prefix: string = '', suffix: string = '') => {
        return `${identity}_${prefix !== undefined ? prefix + '_' : ''}${
            anchor.id
        }${suffix !== undefined ? '_' + suffix : ''}`;
    };

    const positionCalc = new PositionCalculator();
    const positionUpdater = new DefaultPositionUpdater(
        identity,
        mapText,
        mutateMapText,
        [ExistingCoordsMatcher, NotDefinedCoordsMatcher],
    );
    const x = () =>
        positionCalc.maturityToX(anchor.maturity, mapDimensions.width);
    const y = () =>
        positionCalc.visibilityToY(anchor.visibility, mapDimensions.height);
    function endDrag(moved: { y: number; x: number }) {
        const visibility = positionCalc.yToVisibility(
            moved.y,
            mapDimensions.height,
        );
        const maturity = positionCalc.xToMaturity(moved.x, mapDimensions.width);
        positionUpdater.update(
            { param1: visibility, param2: maturity },
            anchor.name,
        );
    }
    return (
        <>
            <Movable
                id={elementKey()}
                onMove={endDrag}
                x={x()}
                y={y()}
                fixedY={false}
                fixedX={false}
                isModKeyPressed={isModKeyPressed}
            >
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
export default Anchor;
