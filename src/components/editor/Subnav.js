import React from 'react';
import Breadcrumb from './Breadcrumb';

import { Button } from 'react-bootstrap';

const Subnav = props => {
	const { setToggleToolbar, toggleToolbar } = props;
	return (
		<div className="container-fluid ">
			<Breadcrumb currentUrl={props.currentUrl} />
			<div>
				<Button
					variant={props.toggleToolbar ? 'primary' : 'outline-primary'}
					onClick={() => setToggleToolbar(!toggleToolbar)}
				>
					Toolbar
				</Button>
			</div>
		</div>
	);
};

export default Subnav;
