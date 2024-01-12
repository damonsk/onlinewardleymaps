import React from 'react';
import PositionCalculator from './PositionCalculator';
import FlowText from './FlowText';
import LinkSymbol from '../symbols/LinkSymbol';
import { useFeatureSwitches } from '../FeatureSwitchesContext';

function ComponentLink(props) {
  const { enableLinkContext } = useFeatureSwitches();
  const { mapStyleDefs, mapDimensions, startElement, endElement, link } = props;
  const { height, width } = mapDimensions;
  const positionCalc = new PositionCalculator();
  const x1 = positionCalc.maturityToX(startElement.maturity, width);
  const x2 = positionCalc.maturityToX(endElement.maturity, width);
  const y1 =
    positionCalc.visibilityToY(startElement.visibility, height) +
    (startElement.offsetY ? startElement.offsetY : 0);
  const y2 =
    positionCalc.visibilityToY(endElement.visibility, height) +
    (endElement.offsetY ? endElement.offsetY : 0);

  const isEvolved = startElement.evolved || endElement.evolved;
  const isFlow =
    link.flow &&
    (link.future === link.past || // both
      (link.past === true &&
        endElement.evolving === false &&
        startElement.evolving === true) ||
      (link.past === true &&
        endElement.evolving === true &&
        startElement.evolving === false) ||
      (link.future === true && startElement.evolving === true) ||
      (link.future === true && startElement.evolved === true) ||
      (link.future === true && endElement.evolved === true));

  function getAngle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  }

  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  const buffer = 5;
  const angle = getAngle(x1, y1, x2, y2);
  const isUpsideDown = angle > 90 || angle < -90;
  const adjustedAngle = isUpsideDown ? angle + 180 : angle;

  return (
    <>
      <LinkSymbol
        id={`link_${startElement.id}_${endElement.id}`}
        x1={x1}
        x2={x2}
        y1={y1}
        y2={y2}
        flow={isFlow}
        evolved={isEvolved}
        styles={mapStyleDefs.link}
      />
      {link.flowValue && (
        <FlowText
          mapStyleDefs={mapStyleDefs}
          startElement={startElement}
          endElement={endElement}
          link={link}
          metaText={props.metaText}
          setMetaText={props.setMetaText}
          x={x2}
          y={y2}
        />
      )}
      {enableLinkContext && link.context && (
        <text
          is="custom"
          font-size={mapStyleDefs.link.contextFontSize ?? '10px'}
          text-anchor={'middle'}
          x={centerX}
          y={centerY - buffer}
          transform={`rotate(${adjustedAngle} ${centerX} ${centerY})`}
        >
          {link.context}
        </text>
      )}
    </>
  );
}

export default ComponentLink;
