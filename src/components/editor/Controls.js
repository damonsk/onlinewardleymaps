import React, { useRef } from 'react';
import { owmBuild } from '../../version';
import { ExampleMap } from '../../constants/defaults';
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
		props.mutateMapText(ExampleMap);
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
