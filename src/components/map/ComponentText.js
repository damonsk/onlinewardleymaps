import React from 'react';
import RelativeMovable from './RelativeMovable';

function ComponentText(props) {
	const elementId = 'element_text_' + props.element.id;
	function endDrag(moved) {
		props.mutateMapText(
			props.mapText
				.split('\n')
				.map(line => {
					if (
						line
							.replace(/\s/g, '')
							.indexOf(
								'component' + props.element.name.replace(/\s/g, '') + '['
							) == 0
					) {
						if (line.replace(/\s/g, '').indexOf('label[') > -1) {
							return line.replace(
								/\slabel\s\[(.?|.+?)\]+/g,
								` label [${moved.x}, ${moved.y}]`
							);
						} else {
							return line.trim() + ` label [${moved.x}, ${moved.y}]`;
						}
					} else {
						return line;
					}
				})
				.join('\n')
		);
	}

	return (
		<React.Fragment>
			<RelativeMovable
				id={elementId}
				fixedY={false}
				fixedX={false}
				onMove={endDrag}
				x={props.element.label.x}
				y={props.element.label.y}
			>
				{props.element.name.length < 15 ? (
					<text
						key={elementId}
						id={elementId}
						className="label"
						x="0"
						y="0"
						textAnchor="start"
						fill={
							props.element.evolved
								? props.mapStyleDefs.component.evolvedTextColor
								: props.mapStyleDefs.component.textColor
						}
					>
						{props.element.name}
					</text>
				) : (
					<text
						id={elementId}
						x="0"
						y="0"
						key={elementId}
						transform="translate(30, 10)"
						className="label"
						fill={
							props.element.evolved
								? props.mapStyleDefs.component.evolvedTextColor
								: props.mapStyleDefs.component.textColor
						}
					>
						{props.element.name
							.trim()
							.split(' ')
							.map((text, i) => (
								<tspan
									key={'component_text_span_' + elementId + '_' + i}
									x={0}
									dy={i > 0 ? 15 : 0}
									textAnchor="middle"
								>
									{text.trim()}
								</tspan>
							))}
					</text>
				)}
			</RelativeMovable>
		</React.Fragment>
	);
}

export default ComponentText;
