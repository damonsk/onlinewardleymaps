import PropTypes from 'prop-types';
import MethodSymbol from '../symbols/MethodSymbol';
import PositionCalculator from './PositionCalculator';

function MethodElement({ element, mapDimensions, method, mapStyleDefs }) {
    const positionCalc = new PositionCalculator();
    const x = positionCalc.maturityToX(element.maturity, mapDimensions.width);
    const y = positionCalc.visibilityToY(
        Number(element.visibility),
        mapDimensions.height,
    );
    return (
        <MethodSymbol
            id={'method_' + element.id}
            x={x}
            y={y}
            method={method}
            styles={mapStyleDefs.methods}
        />
    );
}

MethodElement.propTypes = {
    element: PropTypes.shape({
        id: PropTypes.number,
        maturity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        visibility: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    mapDimensions: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }),
    method: PropTypes.string,
    mapStyleDefs: PropTypes.object,
};

export default MethodElement;
