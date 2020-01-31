import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';

function MigrationsModal(props) {
	const [modalShow, setModalShow] = useState(false);

	function applyMigrations() {
		props.mutateMapText(props.migrations.result);
		setModalShow(false);
	}

	React.useEffect(() => {
		if (props.migrations.changed) {
			setModalShow(true);
		}
	}, [props.migrations]);

	return (
		<React.Fragment>
			<Modal
				show={modalShow}
				onHide={() => setModalShow(false)}
				size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title id="contained-modal-title-vcenter">
						Syntax Changes
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>
						Your map uses outdated syntax which has since changed to enable
						future development of OWM.
					</p>
					<p>Don&apos;t worry we can auto update your map text.</p>
					<p>
						You can accept or discard these changes. Please save your map if you
						accept changes.
					</p>
					{props.migrations.changeSets.map((e, i) => (
						<Alert variant="info" key={'changeSet_' + i}>
							<p>Before:</p>
							<p>{e.before}</p>
							<p>After:</p>
							<p>
								{e.after.split('\n').map((l, li) => (
									<span key={li}>
										{l}
										<br />
									</span>
								))}
							</p>
						</Alert>
					))}
				</Modal.Body>
				<Modal.Footer>
					<Button variant={'success'} onClick={applyMigrations}>
						Accept
					</Button>
					<Button onClick={() => setModalShow(false)} variant={'danger'}>
						Discard
					</Button>
				</Modal.Footer>
			</Modal>
		</React.Fragment>
	);
}

export default MigrationsModal;
