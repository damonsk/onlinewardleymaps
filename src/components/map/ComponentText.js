import React from 'react';
import RelativeMovable from './RelativeMovable';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';

function ComponentText(props) {
	const elementId = 'element_text_' + props.element.id;
	function endDrag(moved) {
		props.mutateMapText(
			props.mapText
				.split('\n')
				.map(line => {
					if (props.element.evolved) {
						if (
							line
								.replace(/\s/g, '')
								.indexOf(
									'evolve' +
										props.element.name.replace(/\s/g, '') +
										props.element.maturity
								) === 0
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
					} else {
						if (
							line
								.replace(/\s/g, '')
								.indexOf(
									props.element.type +
										props.element.name.replace(/\s/g, '') +
										'['
								) === 0
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
				<ComponentTextSymbol
					id={elementId}
					text={props.element.name}
					evolved={props.element.evolved}
					styles={props.mapStyleDefs.component}
					onClick={props.onClick}
				/>
			</RelativeMovable>
		</React.Fragment>
	);
}

export default ComponentText;
