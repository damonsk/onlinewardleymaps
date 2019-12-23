import React, {Component} from 'react';
import MethodElement from './MethodElement';
import MapElements from '../../MapElements';
var createReactClass = require('create-react-class');


class MapView extends Component {

    constructor(props){
        super(props);
    }

    render() {
        return (
            <div className="col-8">
                {/* Wrapping div required to ensure that images aren't generated with a ton of whitespace */}
                <div ref={this.props.mapRef}>
                  <h3 id="title">{this.props.mapTitle}</h3>
                  <div id="map">

                    <MapCanvas 
                        mapDimensions={this.props.mapDimensions} 
                        mapPadding={20} 
                        mapEvolutionStates={this.props.mapEvolutionStates}
                        mapStyle={this.props.mapStyle} 
                        mapObject={this.props.mapObject}
                        />

                  </div>
              </div>
            </div>
        )
    }
}

var MapCanvas = createReactClass({
    render: function() {

        var mapElements = new MapElements(this.props.mapObject);

        var getElementByName = function (elements, name) {
            var hasName = function (element) {
                return element.name === name;
            };
            return elements.find(hasName);
        };

        var svgWidth = this.props.mapDimensions.width + 2 * this.props.mapPadding;
        var svgHeight = this.props.mapDimensions.height + 4 * this.props.mapPadding;
        var vbWidth = this.props.mapDimensions.width + this.props.mapPadding;
        var vbHeight = this.props.mapDimensions.height + this.props.mapPadding;
        var custMark = (this.props.mapDimensions.width / 4) + 2;
        var prodMark = (this.props.mapDimensions.width / 2) + 2;
        var commMark = (this.props.mapDimensions.width / 4 * 3) + 2;
        var visMark = this.props.mapDimensions.height / 2;

        const evolveElements = this.props.mapObject.elements.filter(el => el.evolving);
        const noneEvolving = this.props.mapObject.elements.filter(el => el.evolving == false);
        const nonEvolvedElements = noneEvolving.concat(evolveElements);

        return (
            <>
            <svg className={this.props.mapStyle} id="svgMap" width={svgWidth} height={svgHeight} viewBox={"-" + this.props.mapPadding + " 0 " + vbWidth + " " + vbHeight} version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="15" refY="0" viewBox="0 -5 10 10" orient="0">
                        <path d="M0,-5L10,0L0,5" fill="#ff0000" />
                    </marker>
                </defs>
                <g id="grid">
                    <g id="valueChain" transform={"translate(0,"+this.props.mapDimensions.height+") rotate(270)"}>
                        <line x1="0" y1="0" x2={this.props.mapDimensions.height} y2="0" stroke="black"/>
                        <line x1="-2em" y1={custMark} x2={this.props.mapDimensions.height} y2={custMark} stroke="black" strokeDasharray="5,5"/>
                        <line x1="-2em" y1={prodMark} x2={this.props.mapDimensions.height} y2={prodMark} stroke="black" strokeDasharray="5,5"/>
                        <line x1="-2em" y1={commMark} x2={this.props.mapDimensions.height} y2={commMark} stroke="black" strokeDasharray="5,5"/>
                        <text x="0" y="-0.2em" textAnchor="start">Invisible</text>
                        <text x={visMark} y="-0.2em" textAnchor="middle" fontWeight="bold">Value Chain</text>
                        <text x={this.props.mapDimensions.height} y="-0.2em" textAnchor="end">Visible</text>
                    </g>
                    <g id="Evolution" transform={"translate(0," + this.props.mapDimensions.height + ")"}>
                        <line x1="0" y1="0" x2={this.props.mapDimensions.width} y2="0" stroke="black"/>
                        <text x="0" y="1em" textAnchor="start">{this.props.mapEvolutionStates.genesis}</text>
                        <text x="0" y="2em" textAnchor="start">&nbsp;</text>
                        <text x={custMark + 5} y="1em" textAnchor="start">{this.props.mapEvolutionStates.custom}</text>
                        <text x={custMark + 5} y="2em" textAnchor="start">&nbsp;</text>
                        <text x={prodMark + 5} y="1em" textAnchor="start">{this.props.mapEvolutionStates.product}</text>
                        <text x={prodMark + 5} y="2em" textAnchor="start">&nbsp;</text>
                        <text x={commMark + 5} y="1em" textAnchor="start">{this.props.mapEvolutionStates.commodity}</text>
                        <text x={commMark + 5} y="2em" textAnchor="start">&nbsp;</text>
                        <text x={this.props.mapDimensions.width} y="1.5em" textAnchor="end" fontWeight="bold">Evolution</text>
                    </g>
                </g>
                <g id="newMap">
                    <g id="methods">
                    {this.props.mapObject.methods.map((m, i) => 
                        <MethodElement 
                            key={i} 
                            element={getElementByName(mapElements.getNonEvolvedElements(), m.name)} 
                            mapDimensions={this.props.mapDimensions} 
                            method={m} /> 
                    )}
                    </g>
                </g>
                <g id="map">
                </g>
            </svg>
            </>
        );
    }
});

export default MapView;