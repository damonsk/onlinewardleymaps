import React, {Component} from 'react';
import MethodElement from './MethodElement';
import MapElements from '../../MapElements';
import MapGrid from './MapGrid';
import MapEvolution from './MapEvolution';
import ComponentLink from './ComponentLink';
import EvolvingComponentLink from './EvolvingComponentLink';
import MapComponent from './MapComponent';
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
                        mapText={this.props.mapText}
                        mutateMapText={this.props.mutateMapText}
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

        var canSatisfyLink = function(l, startElements, endElements){
            return getElementByName(startElements, l.start) != undefined && getElementByName(endElements, l.end) != undefined
        }

        var evolvingEndLinks = this.props.mapObject.links.filter(li => mapElements.getEvolvedElements().find(i => i.name == li.end) && mapElements.getNoneEvolvingElements().find(i => i.name == li.start));
        var evolvedToEvolving = this.props.mapObject.links.filter(li => mapElements.getEvolvedElements().find(i => i.name == li.start) && mapElements.getEvolveElements().find(i => i.name == li.end));
        var bothEvolved = this.props.mapObject.links.filter(li => mapElements.getEvolvedElements().find(i => i.name == li.start) && mapElements.getEvolvedElements().find(i => i.name == li.end));
        var evolveStartLinks = this.props.mapObject.links.filter(li => mapElements.getEvolvedElements().find(i => i.name == li.start) && mapElements.getNoneEvolvingElements().find(i => i.name == li.end));
        var bothEvolving = this.props.mapObject.links.filter(li => mapElements.getEvolveElements().find(i => i.name == li.start) && mapElements.getEvolveElements().find(i => i.name == li.end));
        var evolveToEvolved = this.props.mapObject.links.filter(li => mapElements.getEvolveElements().find(i => i.name == li.start) && mapElements.getEvolvedElements().find(i => i.name == li.end));

        return (
            <>
            <svg 
                className={this.props.mapStyle} 
                id="svgMap" 
                width={this.props.mapDimensions.width + 2 * this.props.mapPadding} 
                height={this.props.mapDimensions.height + 4 * this.props.mapPadding} 
                viewBox={"-" + this.props.mapPadding + " 0 " + (this.props.mapDimensions.width + this.props.mapPadding) + " " + (this.props.mapDimensions.height + this.props.mapPadding)} 
                version="1.1" xmlns="http://www.w3.org/2000/svg" 
                xmlnsXlink="http://www.w3.org/1999/xlink">
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="15" refY="0" viewBox="0 -5 10 10" orient="0">
                        <path d="M0,-5L10,0L0,5" fill="#ff0000" />
                    </marker>
                </defs>
                <g id="grid">

                    <MapGrid mapDimensions={this.props.mapDimensions} />
                    <MapEvolution 
                        mapDimensions={this.props.mapDimensions} 
                        mapEvolutionStates={this.props.mapEvolutionStates} />

                </g>
                <g id="map">
                    <g id="methods">
                    {this.props.mapObject.methods.map((m, i) => 
                        <MethodElement 
                            key={i} 
                            element={getElementByName(mapElements.getNonEvolvedElements(), m.name)} 
                            mapDimensions={this.props.mapDimensions} 
                            method={m} /> 
                    )}
                    </g>
                    <g id="links">
                        {this.props.mapObject.links.map((l, i) => canSatisfyLink(l, mapElements.getMergedElements(), mapElements.getMergedElements()) == false ? null : <ComponentLink
                                    key={i}
                                    mapDimensions={this.props.mapDimensions} 
                                    startElement={getElementByName(mapElements.getMergedElements(), l.start)}
                                    endElement={getElementByName(mapElements.getMergedElements(), l.end)}
                                    link={l}
                                    />
 
                        )}
                    </g>

                    <g id="evolvingEndLinks">
                        {evolvingEndLinks.map((l, i) => canSatisfyLink(l, mapElements.getNoneEvolvingElements(), mapElements.getEvolveElements()) == false ? null : <ComponentLink
                                        key={i}
                                        mapDimensions={this.props.mapDimensions} 
                                        startElement={getElementByName(mapElements.getNoneEvolvingElements(), l.start)}
                                        endElement={getElementByName(mapElements.getEvolveElements(), l.end)}
                                        link={l}
                                        />
                        )}
                    </g>
                    <g id="evolvingBothLinks">
                        {bothEvolved.map((l, i) => canSatisfyLink(l, mapElements.getEvolvedElements(), mapElements.getEvolvedElements()) == false ? null : <ComponentLink
                                        key={i}
                                        mapDimensions={this.props.mapDimensions} 
                                        startElement={getElementByName(mapElements.getEvolvedElements(), l.start)}
                                        endElement={getElementByName(mapElements.getEvolvedElements(), l.end)}
                                        link={l}
                                        />
                        )}
                    </g> 
                    <g id="evolvedToEvolvingLinks">
                        {evolvedToEvolving.map((l, i) => canSatisfyLink(l, mapElements.getEvolvedElements(), mapElements.getEvolveElements()) == false ? null : <ComponentLink
                                        key={i}
                                        mapDimensions={this.props.mapDimensions} 
                                        startElement={getElementByName(mapElements.getEvolvedElements(), l.start)}
                                        endElement={getElementByName(mapElements.getEvolveElements(), l.end)}
                                        link={l}
                                        />
                        )}
                    </g> 
                    <g id="evolvingStartLinks">
                        {evolveStartLinks.map((l, i) => canSatisfyLink(l, mapElements.getNoneEvolvingElements(), mapElements.getEvolveElements()) == false ? null : <ComponentLink
                                        key={i}
                                        mapDimensions={this.props.mapDimensions} 
                                        startElement={getElementByName(mapElements.getNoneEvolvingElements(), l.start)}
                                        endElement={getElementByName(mapElements.getEvolveElements(), l.end)}
                                        link={l}
                                        />
                        )}
                    </g> 
                    <g id="evolvingStartEvolvingEndLinks">
                        {bothEvolving.map((l, i) => canSatisfyLink(l, mapElements.getEvolveElements(), mapElements.getEvolveElements()) == false ? null : <ComponentLink
                                        key={i}
                                        mapDimensions={this.props.mapDimensions} 
                                        startElement={getElementByName(mapElements.getEvolveElements(), l.start)}
                                        endElement={getElementByName(mapElements.getEvolveElements(), l.end)}
                                        link={l}
                                        />
                        )}
                    </g> 
                    <g id="evolvedStartEvolvingEndLinks">
                        {evolveToEvolved.map((l, i) => canSatisfyLink(l, mapElements.getEvolveElements(), mapElements.getEvolvedElements()) == false ? null : <ComponentLink
                                        key={i}
                                        mapDimensions={this.props.mapDimensions} 
                                        startElement={getElementByName(mapElements.getEvolveElements(), l.start)}
                                        endElement={getElementByName(mapElements.getEvolvedElements(), l.end)}
                                        link={l}
                                        />
                        )}
                    </g> 
                    <g id="evolvedLinks">
                        {mapElements.getEvolveElements().map((e, i) => <EvolvingComponentLink
                                        key={i}
                                        mapDimensions={this.props.mapDimensions} 
                                        startElement={getElementByName(mapElements.getEvolvedElements(), e.name)}
                                        endElement={getElementByName(mapElements.getEvolveElements(), e.name)}
                                        link={e}
                                        />
                            
                            )};
                    </g>
                    <g id="elements">
                        {mapElements.getMergedElements().map((el, i) =>
                            <MapComponent   
                                key={i}
                                mapDimensions={this.props.mapDimensions} 
                                element={el}
                                mapText={this.props.mapText}
                                mutateMapText={this.props.mutateMapText}
                                />
                            )}
                    </g>
                    

                </g>
            </svg>
            </>
        );
    }
});

export default MapView;