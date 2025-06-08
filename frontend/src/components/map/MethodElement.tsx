import React from 'react';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../types/map/styles';
import {UnifiedComponent} from '../../types/unified';
import MethodSymbol from '../symbols/MethodSymbol';
import ModernPositionCalculator from './ModernPositionCalculator';

interface ModernMethodElementProps {
    methodComponent: UnifiedComponent; // Accept both regular and method components
    mapDimensions: MapDimensions;
    mapStyleDefs: MapTheme;
    setHighlightLine?: (line: number) => void;
}

const MethodElement: React.FC<ModernMethodElementProps> = ({methodComponent, mapDimensions, mapStyleDefs, setHighlightLine}) => {
    const positionCalc = new ModernPositionCalculator();
    const x = positionCalc.maturityToX(methodComponent.maturity, mapDimensions.width);
    const y = positionCalc.visibilityToY(methodComponent.visibility, mapDimensions.height);
    const handleClick = () => {
        if (setHighlightLine && methodComponent.line) {
            setHighlightLine(methodComponent.line);
        }
    };

    return (
        <MethodSymbol
            id={`method_${methodComponent.id}`}
            x={x}
            y={y}
            buy={methodComponent.decorators.buy || false}
            build={methodComponent.decorators.build || false}
            outsource={methodComponent.decorators.outsource || false}
            styles={mapStyleDefs.methods}
            onClick={handleClick}
        />
    );
};

export default MethodElement;
