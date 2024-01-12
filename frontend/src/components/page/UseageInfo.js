import React from 'react';
import Usage from '../editor/Usage';

export default function UsageInfo({ mapText, mutateMapText, mapStyleDefs }) {
  return (
    <div className="row usage no-gutters">
      <div className="col">
        <Usage
          mapStyleDefs={mapStyleDefs}
          mapText={mapText}
          mutateMapText={mutateMapText}
        />
      </div>
    </div>
  );
}
