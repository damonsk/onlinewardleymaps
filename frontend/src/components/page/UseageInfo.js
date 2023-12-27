import React from 'react';
import Usage from '../editor/Usage';

export default function UsageInfo({ mapText, mutateMapText }) {
	return (
		<div className="row usage no-gutters">
			<div className="col">
				<Usage mapText={mapText} mutateMapText={mutateMapText} />
			</div>
		</div>
	);
}
