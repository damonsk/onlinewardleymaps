import React from 'react';

const Breadcrumb = ({ currentUrl }) => {
	return (
		<nav aria-label="breadcrumb" className="bc">
			<ol className="breadcrumb" data-testid="breadcrumb-list">
				<li className="breadcrumb-item" data-testid="breadcrumb-list-item">
					Your Map:{' '}
					<a
						href={currentUrl.indexOf('#') === -1 ? '#' : currentUrl}
						id="url"
						data-testid="breadcrumb-list-item-your-map"
					>
						{currentUrl.indexOf('#') === -1 ? '(unsaved)' : currentUrl}
					</a>
				</li>
			</ol>
		</nav>
	);
};

export default Breadcrumb;
