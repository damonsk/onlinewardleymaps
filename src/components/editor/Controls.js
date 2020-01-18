import React, { useRef } from 'react';
import { owmBuild } from '../../version';
import {
	Alert,
	Modal,
	InputGroup,
	FormControl,
	Button,
	ButtonGroup,
	DropdownButton,
	Dropdown,
} from 'react-bootstrap';

function Controls(props) {
	const example = () => {
		const exampleText =
			'title Tea Shop' +
			'\r\n' +
			'component Business [0.95, 0.63]' +
			'\r\n' +
			'component Public [0.95, 0.78]' +
			'\r\n' +
			'component Cup of Tea [0.79, 0.61]' +
			'\r\n' +
			'component Cup [0.73, 0.78]' +
			'\r\n' +
			'component Tea [0.63, 0.81]' +
			'\r\n' +
			'component Hot Water [0.52, 0.80]' +
			'\r\n' +
			'component Water [0.38, 0.82]' +
			'\r\n' +
			'component Kettle [0.43, 0.35] evolve 0.62' +
			'\r\n' +
			'component Power [0.1, 0.7] evolve 0.89' +
			'\r\n' +
			'Business->Cup of Tea' +
			'\r\n' +
			'Public->Cup of Tea' +
			'\r\n' +
			'Cup of Tea->Cup' +
			'\r\n' +
			'Cup of Tea->Tea' +
			'\r\n' +
			'Cup of Tea->Hot Water' +
			'\r\n' +
			'Hot Water->Water' +
			'\r\n' +
			'Hot Water->Kettle ' +
			'\r\n' +
			'Kettle->Power' +
			'\r\n' +
			'' +
			'\r\n' +
			'annotation 1 [[0.43,0.49],[0.08,0.79]] Standardising power allows Kettles to evolve faster' +
			'\r\n' +
			'annotation 2 [0.48, 0.85] Hot water is obvious and well known' +
			'\r\n' +
			'annotations [0.97, 0.02]' +
			'\r\n' +
			'' +
			'\r\n' +
			'style colour';
		props.mutateMapText(exampleText);
		props.setMetaText('');
	};

	const [modalShow, setModalShow] = React.useState(false);
	const textArea = useRef(null);
	const copyCodeToClipboard = () => {
		textArea.current.select();
		document.execCommand('copy');
	};

	return (
		<React.Fragment>
			<small id="owm-build">v{owmBuild}</small>
			<button
				id="new-map"
				onClick={props.newMapClick}
				type="button"
				className="btn btn-secondary"
			>
				New Map
			</button>
			<button
				id="example-map"
				onClick={example}
				type="button"
				className="btn btn-secondary"
			>
				Example Map
			</button>
			<button
				id="save-map"
				onClick={props.saveMapClick}
				type="button"
				className={
					'btn btn-primary ' +
					(props.saveOutstanding ? 'btn-danger' : 'btn-success')
				}
			>
				Save
			</button>

			<DropdownButton
				as={ButtonGroup}
				title="Share"
				id="bg-nested-dropdown"
				alignRight
				variant="info"
			>
				<Dropdown.Item eventKey="1" onClick={props.downloadMapImage}>
					Download as PNG
				</Dropdown.Item>
				<Dropdown.Item eventKey="2" onClick={() => setModalShow(true)}>
					Get Clone URL
				</Dropdown.Item>
			</DropdownButton>

			<Modal
				show={modalShow}
				onHide={() => setModalShow(false)}
				size="lg"
				aria-labelledby="contained-modal-title-vcenter"
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title id="contained-modal-title-vcenter">
						Clone URL
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>
						You can share this URL with others to allow them to create a new map
						using this map as its initial state.
					</p>
					<p>Any changes made by others will not be reflected in this map.</p>
					{props.currentUrl == '(unsaved)' ? (
						<Alert variant="danger">Please save your map first!</Alert>
					) : (
						<InputGroup className="mb-3">
							<FormControl
								ref={textArea}
								onChange={function() {}}
								aria-describedby="basic-addon1"
								value={props.currentUrl.replace('#', '#clone:')}
							/>
							<InputGroup.Append>
								<Button
									variant="outline-secondary"
									onClick={() => copyCodeToClipboard()}
								>
									Copy
								</Button>
							</InputGroup.Append>
						</InputGroup>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant={'success'} onClick={props.saveMapClick}>
						Save Map
					</Button>
					<Button onClick={() => setModalShow(false)}>Close</Button>
				</Modal.Footer>
			</Modal>
		</React.Fragment>
	);
}

export default Controls;
