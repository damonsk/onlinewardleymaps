import React from 'react';

const Breadcrumb = props => (
	<nav aria-label="breadcrumb">
		<ol className="breadcrumb">
			<li className="breadcrumb-item">
				Your Map: {' '}
				<a href={props.currentUrl.indexOf('#') === -1 ? '' : props.currentUrl } id="url">
					{props.currentUrl}
				</a>
			</li>
		</ol>
	</nav>
);

export default Breadcrumb;
