import React from 'react';
import CoreHeader from './CoreHeader';

function NewHeader(props) {
  const { toggleMenu } = props;
  return <CoreHeader toggleMenu={toggleMenu} />;
}

export default NewHeader;
