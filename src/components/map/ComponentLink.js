import React from 'react';
import MapPositionCalculator from '../../MapPositionCalculator';
var createReactClass = require('create-react-class');

function ComponentLink(props) {
	const mapCalc = new MapPositionCalculator();
	const x1 = () =>
		mapCalc.maturityToX(props.startElement.maturity, props.mapDimensions.width);
	const x2 = () =>
		mapCalc.maturityToX(props.endElement.maturity, props.mapDimensions.width);
	const y1 = () =>
		mapCalc.visibilityToY(
			props.startElement.visibility,
			props.mapDimensions.height
		);
	const y2 = () =>
		mapCalc.visibilityToY(
			props.endElement.visibility,
			props.mapDimensions.height
		);

	function defineStoke() {
		return props.startElement.evolved || props.endElement.evolved
			? 'red'
			: 'grey';
	}

	const isFlow = () => {
		return (
			props.link.flow &&
			(props.link.future == props.link.past || // both
				(props.link.past == true &&
					props.endElement.evolving == false &&
					props.startElement.evolving == true) ||
				(props.link.past == true &&
					props.endElement.evolving == true &&
					props.startElement.evolving == false) ||
				(props.link.future == true && props.startElement.eolving == true) ||
				(props.link.future == true && props.startElement.evolved == true) ||
				(props.link.future == true && props.endElement.evolved == true))
		);
	};

	return (
		<g>
			<line x1={x1()} y1={y1()} x2={x2()} y2={y2()} stroke={defineStoke()} />
			{isFlow() ? (
				<FlowLink
					endElement={props.endElement}
					startElement={props.startElement}
					link={props.link}
					x1={x1()}
					x2={x2()}
					y1={y1()}
					y2={y2()}
				/>
			) : null}
		</g>
	);
}

var FlowLink = createReactClass({
	render: function() {
		return (
			<>
				<g
					id={'flow_' + this.props.endElement.name}
					transform={'translate(' + this.props.x2 + ',' + this.props.y2 + ')'}
				>
					{this.props.link.flowValue != undefined ? null : (
						<text
							className="draggable label"
							id={
								'flow_text_' +
								this.props.startElement.id +
								'_' +
								this.props.endElement.id
							}
							x="10"
							y="-30"
							textAnchor="start"
							fill="#03a9f4"
						>
							{this.props.link.flowValue}
						</text>
					)}
				</g>
				<line
					x1={this.props.x1}
					y1={this.props.y1}
					x2={this.props.x2}
					y2={this.props.y2}
					strokeWidth="10"
					stroke="#99c5ee9e"
				/>
			</>
		);
	},
});

export default ComponentLink;
