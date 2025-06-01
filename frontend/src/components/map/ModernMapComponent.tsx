import React from 'react';
import { MapDimensions } from '../../constants/defaults';
import { MapTheme } from '../../types/map/styles';
import { UnifiedComponent } from '../../types/unified';
import { useModKeyPressedConsumer } from '../KeyPressContext';
import ComponentText from './ComponentText';
import Inertia from './Inertia';
import Movable from './Movable';
import PositionCalculator from './PositionCalculator';
import DefaultPositionUpdater from './positionUpdaters/DefaultPositionUpdater';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import { ExistingSingleCoordMatcher } from './positionUpdaters/ExistingSingleCoordMatcher';
import { NotDefinedCoordsMatcher } from './positionUpdaters/NotDefinedCoordsMatcher';

interface MovedPosition {
    x: number;
    y: number;
}

/**
 * Modern Map Component - Phase 4A: Core Component Type Migration
 * This component uses UnifiedComponent directly without adapters
 */
interface ModernMapComponentProps {
    keyword: string;
    launchUrl?: (url: string) => void;
    mapDimensions: MapDimensions;
    component: UnifiedComponent; // Changed from element: MapElement to component: UnifiedComponent
    mapText: string;
    mutateMapText: (newText: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: (line: number) => void;
    scaleFactor: number;
    valueChainStage?: string;
}

/**
 * ModernMapComponent uses UnifiedComponent directly for rendering
 * This implements Phase 4A of the migration plan
 */
const ModernMapComponent: React.FC<ModernMapComponentProps> = ({
    keyword,
    launchUrl,
    mapDimensions,
    component, // Using component instead of element
    mapText,
    mutateMapText,
    mapStyleDefs,
    setHighlightLine,
    scaleFactor,
    valueChainStage,
}) => {
    const { modKeyPressed } = useModKeyPressedConsumer();
    const calculatedPosition = new PositionCalculator(
        component.maturity,
        component.visibility,
        mapDimensions,
    );
    const posX = calculatedPosition.getX();
    const posY = calculatedPosition.getY();

    let componentStyles = mapStyleDefs.component;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (component.line) {
            setHighlightLine(component.line);
        }

        if (component.url && launchUrl) {
            if (typeof component.url === 'string') {
                launchUrl(component.url);
            } else if (component.url.url) {
                launchUrl(component.url.url);
            }
        }
    };

    const updatePosition = (movedPosition: MovedPosition) => {
        if (component.line === undefined) return;

        let replacers = [];

        if (!modKeyPressed) {
            // When pressing just left mouse button - add corrected maturity and visibility
            replacers.push(
                new ExistingCoordsMatcher(
                    component.name,
                    component.maturity,
                    component.visibility,
                    movedPosition.x,
                    movedPosition.y,
                ),
            );
            replacers.push(
                new ExistingSingleCoordMatcher(
                    component.name,
                    movedPosition.x,
                    movedPosition.y,
                ),
            );
            replacers.push(
                new NotDefinedCoordsMatcher(
                    component.name,
                    movedPosition.x,
                    movedPosition.y,
                ),
            );
        }

        const newText = new DefaultPositionUpdater(mapText, replacers).update();

        mutateMapText(newText);
    };

    return (
        <Movable
            id={component.id}
            x={posX}
            y={posY}
            updatePosition={updatePosition}
        >
            <g
                id={component.id}
                onClick={handleClick}
                style={{ cursor: 'pointer' }}
            >
                {component.inertia && (
                    <Inertia
                        cx={posX}
                        cy={posY}
                        radius={componentStyles.radius}
                    />
                )}
                <ComponentText
                    component={component}
                    cx={posX}
                    cy={posY}
                    styles={componentStyles}
                    valueChain={valueChainStage}
                />
            </g>
        </Movable>
    );
};

export default ModernMapComponent;
