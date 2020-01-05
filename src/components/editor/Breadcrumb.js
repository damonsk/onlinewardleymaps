import React from 'react';

const Breadcrumb = props => {
	return (
		<nav aria-label="breadcrumb">
			<ol className="breadcrumb" data-testid="breadcrumb-list">
				<li className="breadcrumb-item" data-testid="breadcrumb-list-item">
					Your Map:{' '}
					<a
						href={props.currentUrl.indexOf('#') === -1 ? '#' : props.currentUrl}
						id="url"
						data-testid="breadcrumb-list-item-your-map"
					>
						{props.currentUrl}
					</a>
				</li>
			</ol>
		</nav>
	);
};

export default Breadcrumb;
