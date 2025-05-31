import React from 'react';
import ComponentText from './ComponentText';
import Inertia from './Inertia';
import Movable from './Movable';
import PositionCalculator from './PositionCalculator';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import { ExistingSingleCoordMatcher } from './positionUpdaters/ExistingSingleCoordMatcher';
import { NotDefinedCoordsMatcher } from './positionUpdaters/NotDefinedCoordsMatcher';

import { MapDimensions } from '../../constants/defaults';
import { MapElement, Replacer } from '../../types/base';
import { MapTheme } from '../../types/map/styles';
import { useModKeyPressedConsumer } from '../KeyPressContext';

interface MovedPosition {
    x: number;
    y: number;
}

interface MapComponentProps {
    keyword: string;
    launchUrl?: (url: string) => void;
    mapDimensions: MapDimensions;
    element: MapElement;
    mapText: string;
    mutateMapText: (newText: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: (line: number) => void;
    scaleFactor: number;
    children: React.ReactNode;
}

const MapComponent: React.FC<MapComponentProps> = (props) => {
    const isModKeyPressed = useModKeyPressedConsumer();

    const positionCalc = new PositionCalculator();
    const x = positionCalc.maturityToX(
        props.element.maturity,
        props.mapDimensions.width,
    );
    const y =
        positionCalc.visibilityToY(
            props.element.visibility,
            props.mapDimensions.height,
        ) + (props.element.offsetY ? props.element.offsetY : 0);

    const onElementClick = () => props.setHighlightLine(props.element.line);
    const canApplyInertia = () =>
        !props.element.evolved &&
        props.element.evolving === false &&
        props.element.inertia === true;

    const notEvolvedNoLabelMatcher: Replacer = {
        matcher: (line: string, identifier: string, type: string): boolean => {
            return (
                !props.element.evolved &&
                ExistingCoordsMatcher.matcher(line, identifier, type) &&
                !ExistingCoordsMatcher.matcher(line, '', 'label')
            );
        },
        action: (line: string, moved: any): string => {
            return ExistingCoordsMatcher.action(line, moved);
        },
    };

    const notEvolvedWithLabelMatcher: Replacer = {
        matcher: (line: string, identifier: string, type: string): boolean => {
            return (
                !props.element.evolved &&
                ExistingCoordsMatcher.matcher(line, identifier, type) &&
                ExistingCoordsMatcher.matcher(line, '', 'label')
            );
        },
        action: (line: string, moved: any): string => {
            const parts = line.split('label');
            const newPart = ExistingCoordsMatcher.action(parts[0], moved);
            return newPart + 'label' + parts[1];
        },
    };

    const evolvedMatcher: Replacer = {
        matcher: (line: string, identifier: string): boolean => {
            return (
                props.element.evolved &&
                ExistingSingleCoordMatcher.matcher(line, identifier, 'evolve')
            );
        },
        action: (line: string, moved: any): string => {
            return ExistingSingleCoordMatcher.action(line, moved);
        },
    };

    const positionUpdater = new DefaultPositionUpdater(
        props.keyword,
        props.mapText,
        props.mutateMapText,
        [
            notEvolvedNoLabelMatcher,
            notEvolvedWithLabelMatcher,
            evolvedMatcher,
            NotDefinedCoordsMatcher,
        ],
    );

    console.log('MapComponent DefaultPositionUpdater created:', {
        keyword: props.keyword,
        elementType: props.element.type,
        elementName: props.element.name,
        mapTextPresent: !!props.mapText,
        mutateMapTextPresent: typeof props.mutateMapText === 'function',
        mutateMapTextType: typeof props.mutateMapText,
    });

    function endDrag(moved: MovedPosition): void {
        console.log('MapComponent endDrag called:', {
            moved,
            element: props.element.name,
            mapText: props.mapText ? 'present' : 'missing',
            mutateMapText:
                typeof props.mutateMapText === 'function'
                    ? 'present'
                    : 'missing',
        });
        const visibility = positionCalc.yToVisibility(
            moved.y,
            props.mapDimensions.height,
        );
        const maturity = positionCalc.xToMaturity(
            moved.x,
            props.mapDimensions.width,
        );
        console.log('MapComponent calling positionUpdater.update:', {
            visibility,
            maturity,
            elementName: props.element.name,
        });
        positionUpdater.update(
            { param1: parseFloat(visibility), param2: parseFloat(maturity) },
            props.element.name,
        );
        console.log('MapComponent positionUpdater.update completed');
    }

    console.log('MapComponent', props);

    return (
        <>
            <Movable
                id={'element_' + props.element.id}
                onMove={endDrag}
                x={x}
                y={y}
                fixedY={props.element.evolved}
                fixedX={false}
                shouldShowMoving={true}
                isModKeyPressed={isModKeyPressed}
                scaleFactor={props.scaleFactor}
            >
                <>{props.children}</>
            </Movable>
            {canApplyInertia() && (
                <Inertia
                    maturity={props.element.maturity + 0.05}
                    visibility={props.element.visibility}
                    mapDimensions={props.mapDimensions}
                />
            )}
            <g transform={'translate(' + x + ',' + y + ')'}>
                <ComponentText
                    id={'component_text_' + props.element.id}
                    mapStyleDefs={props.mapStyleDefs}
                    element={props.element}
                    mapText={props.mapText}
                    mutateMapText={props.mutateMapText}
                    onClick={onElementClick}
                    scaleFactor={props.scaleFactor}
                />
            </g>
        </>
    );
};

export default MapComponent;
