import React, {useEffect} from 'react';
import MapPositionCalculator from "../../MapPositionCalculator";
import AnnotationText from './AnnotationText';

function AnnotationElement(props){

    var _mapHelper = new MapPositionCalculator();
    const x = () => _mapHelper.maturityToX(props.annotation.maturity, props.mapDimensions.width);
    const y = () => _mapHelper.visibilityToY(props.annotation.visibility, props.mapDimensions.height);
    const [position, setPosition] = React.useState({
        x: x(),
        y: y(),
        coords: {},
    });
    
    const handleMouseMove = React.useRef(e => {
        setPosition(position => {
            const xDiff = position.coords.x - e.pageX;
            const yDiff = position.coords.y - e.pageY;
            return {
                x: position.x - xDiff,
                y: position.y - yDiff,
                coords: {
                    x: e.pageX,
                    y: e.pageY,
                },
            };
        });
    });

    const handleMouseDown = e => {
        const pageX = e.pageX; 
        const pageY = e.pageY;
        
        setPosition(position => Object.assign({}, position, {
            coords: {
            x: pageX,
            y: pageY,
            },
        }));
        document.addEventListener('mousemove', handleMouseMove.current);
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove.current);
        setPosition(position =>
            Object.assign({}, position, {
            coords: {},
            })
        );
        endDrag();
    };

    function endDrag() {
        props.mutateMapText(
            props.mapText
                .split("\n")
                .map(line => {
                    if (line.replace(/\s/g, "").indexOf("annotation" + props.annotation.number.replace(/\s/g, "") + "[" ) !== -1) {
                        return line.replace(/\[(.+?)\]/g, `[${1 - ((1 / props.mapDimensions.height) * position.y).toFixed(2)}, ${((1 / props.mapDimensions.width) * position.x).toFixed(2)}]`);
                    } else {
                        return line;
                    }
                }).join("\n")
        );
    }

    const defineStoke = function(){
        return "darkred";
    }

    const defineFill = function(){
        return "#FFF";
    }

    useEffect(() => {
        position.x = x();
    }, [props.annotation.maturity]);
    useEffect(() => {
        position.y = y();
    }, [props.annotation.visibility]);

    useEffect(() => {
        position.y = y();
        position.x = x();
    }, [props.mapDimensions]);

    return (
        <g transform={"translate (" + position.x + "," + position.y +")"}>            
            <circle 
                cx="-0" 
                cy="0" 
                className="draggable" 
                r="20" 
                onMouseDown={(e) => handleMouseDown(e)}
                onMouseUp={(e) => handleMouseUp(e)}
                fill={defineFill()} 
                stroke={defineStoke()} />
            <text 
                x="-5"
                y="5"
                className="label draggable" 
                textAnchor="start" 
                fill="black">{props.annotation.number}</text>
            {props.annotation.text.length > 0 ? <AnnotationText mapText={props.mapText} mutateMapText={props.mutateMapText} annotation={props.annotation} mapDimensions={props.mapDimensions} /> : null}
        </g>
    )
}

export default AnnotationElement;