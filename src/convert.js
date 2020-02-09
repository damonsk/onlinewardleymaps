export default class Convert {
	parse(data) {
		let cleanedData = this.stripComments(data);
		let jobj = {
			title: this.title(cleanedData),
			elements: this.elements(cleanedData),
			anchors: this.anchors(cleanedData),
			links: this.links(cleanedData),
			evolution: this.evolution(cleanedData),
			presentation: this.presentation(cleanedData),
			methods: this.method(cleanedData),
			annotations: this.annotations(cleanedData),
			notes: this.notes(cleanedData),
			evolved: this.evolved(cleanedData),
		};

		return jobj;
	}

	extractLocation(input, defaultValue) {
		if (input.indexOf('[') > -1 && input.indexOf(']') > -1) {
			let loc = input
				.split('[')[1]
				.trim()
				.split(']')[0]
				.replace(/\s/g, '')
				.split(',');
			return {
				visibility: isNaN(parseFloat(loc[0]))
					? defaultValue.visibility
					: parseFloat(loc[0]),
				maturity: isNaN(parseFloat(loc[1]))
					? defaultValue.maturity
					: parseFloat(loc[1]),
			};
		} else return defaultValue;
	}

	stripComments(data) {
		var doubleSlashRemoved = data.split('\n').map(line => {
			return line.split('//')[0];
		});

		let lines = doubleSlashRemoved;
		let linesToKeep = [];
		let open = false;

		for (let i = 0; i < lines.length; i++) {
			let currentLine = lines[i];
			if (currentLine.indexOf('/*') > -1) {
				open = true;
				linesToKeep.push(currentLine.split('/*')[0].trim());
			} else if (open) {
				if (currentLine.indexOf('*/') > -1) {
					open = false;
					linesToKeep.push(currentLine.split('*/')[1].trim());
				}
			} else if (open == false) {
				linesToKeep.push(currentLine);
			}
		}

		return linesToKeep.join('\n');
	}

	method(input) {
		let trimmed = input.trim();
		let elementsAsArray = trimmed.split('\n');
		let methodElements = [];

		for (let i = 0; i < elementsAsArray.length; i++) {
			const element = elementsAsArray[i];
			if (element.trim().indexOf('outsource ') == 0) {
				let name = element.split('outsource ')[1].trim();
				if (name.length > 0) {
					methodElements.push({ name: name, method: 'outsource' });
				}
			} else if (element.trim().indexOf('build ') == 0) {
				let name = element.split('build ')[1].trim();
				if (name.length > 0) {
					methodElements.push({ name: name, method: 'build' });
				}
			} else if (element.trim().indexOf('buy ') == 0) {
				let name = element.split('buy ')[1].trim();
				if (name.length > 0) {
					methodElements.push({ name: name, method: 'buy' });
				}
			}
		}

		return methodElements;
	}

	presentation(input) {
		let presentationObject = {
			style: 'plain',
			annotations: { visibility: 0.9, maturity: 0.1 },
			yAxis: { label: 'Value Chain', max: 'Visible', min: 'Invisible' },
		};
		let trimmed = input.trim();
		let elementsAsArray = trimmed.split('\n');
		for (let i = 0; i < elementsAsArray.length; i++) {
			const element = elementsAsArray[i];
			if (element.trim().indexOf('style') == 0) {
				let name = element.split('style ')[1].trim();
				presentationObject.style = name;
			}

			if (element.trim().indexOf('annotations ') == 0) {
				presentationObject.annotations = this.extractLocation(element, {
					visibility: 0.9,
					maturity: 0.1,
				});
			}

			if (element.trim().indexOf('y-axis ') == 0) {
				let yAxis = element
					.trim()
					.split('y-axis ')[1]
					.split('->');
				if (yAxis.length == 3) {
					presentationObject.yAxis.label = yAxis[0].trim();
					presentationObject.yAxis.min = yAxis[1].trim();
					presentationObject.yAxis.max = yAxis[2].trim();
				}
			}
		}
		return presentationObject;
	}

	evolution(input) {
		let trimmed = input.trim();
		let elementsAsArray = trimmed.split('\n');
		for (let i = 0; i < elementsAsArray.length; i++) {
			const element = elementsAsArray[i];
			if (element.trim().indexOf('evolution') == 0) {
				let name = element
					.split('evolution ')[1]
					.trim()
					.split('->');
				return [
					{ line1: name[0], line2: '' },
					{ line1: name[1], line2: '' },
					{ line1: name[2], line2: '' },
					{ line1: name[3], line2: '' },
				];
			}
		}
		return [
			{ line1: 'Genesis', line2: '' },
			{ line1: 'Custom-Built', line2: '' },
			{ line1: 'Product', line2: '(+rental)' },
			{ line1: 'Commodity', line2: '(+utility)' },
		];
	}

	title(input) {
		if (input.trim().length < 1) return 'Untitled Map';
		let trimmed = input.trim();
		let firstLine = trimmed.split('\n')[0];

		if (firstLine.indexOf('title') == 0) {
			return firstLine.split('title ')[1].trim();
		}

		return 'Untitled Map';
	}

	notes(input) {
		if (input.trim().length < 1) return [];
		let trimmed = input.trim();
		let elementsAsArray = trimmed.split('\n');
		var notesArray = [];
		for (let i = 0; i < elementsAsArray.length; i++) {
			const element = elementsAsArray[i];
			if (element.trim().indexOf('note ') == 0) {
				let noteText = element
					.substr('note '.length, element.length - 'note '.length)
					.trim()
					.split(' [')[0]
					.trim();

				let notePosition = this.extractLocation(element, {
					visibility: 0.9,
					maturity: 0.1,
				});
				notesArray.push({
					text: noteText,
					visibility: notePosition.visibility,
					maturity: notePosition.maturity,
				});
			}
		}
		return notesArray;
	}

	annotations(input) {
		if (input.trim().length < 1) return [];
		let trimmed = input.trim();
		let elementsAsArray = trimmed.split('\n');
		var annotationsArray = [];
		for (let i = 0; i < elementsAsArray.length; i++) {
			const element = elementsAsArray[i];
			if (element.trim().indexOf('annotation ') == 0) {
				let number = parseInt(
					element
						.split('annotation ')[1]
						.trim()
						.split(' [')[0]
						.trim()
				);
				let positionData = [];
				if (element.replace(/\s/g, '').indexOf('[[') > -1) {
					let justOccurances =
						'[' +
						element
							.replace(/\s/g, '')
							.split('[[')[1]
							.split(']]')[0] +
						']';
					let occurancesAsArray = justOccurances
						.replace(/\],\[/g, ']|[')
						.split('|');
					occurancesAsArray.forEach(e => {
						positionData.push(this.extractLocation(e));
					});
				} else if (element.indexOf('[') > -1 && element.indexOf(']') > -1) {
					positionData.push(
						this.extractLocation(element, { visibility: 0.9, maturity: 0.1 })
					);
				}
				let text = '';
				if (
					element.trim().indexOf(']') > -1 &&
					element.trim().indexOf(']') != element.trim().length - 1
				) {
					if (element.replace(/\s/g, '').indexOf(']]') === -1) {
						text = element.split(']')[1].trim();
					}
					if (element.replace(/\s/g, '').indexOf(']]') > -1) {
						var pos = element.lastIndexOf(']');
						text = element.substr(pos + 1, element.length - 1).trim();
					}
				}
				if (positionData.length > 0) {
					annotationsArray.push({
						number: parseInt(number),
						occurances: positionData,
						text: text,
					});
				}
			}
		}
		return annotationsArray;
	}

	elements(input) {
		let trimmed = input.trim();
		let elementsAsArray = trimmed.split('\n');
		let elementsToReturn = [];
		for (let i = 0; i < elementsAsArray.length; i++) {
			const element = elementsAsArray[i];
			if (element.trim().indexOf('component') == 0) {
				let name = element
					.split('component ')[1]
					.trim()
					.split(' [')[0]
					.trim();

				let newPoint;
				if (element.indexOf('evolve ') > -1) {
					newPoint = element.split('evolve ')[1].trim();
					newPoint = newPoint.replace('inertia', '').trim();
				}

				let positionData = this.extractLocation(element, {
					visibility: 0.95,
					maturity: 0.05,
				});

				let labelOffset = { x: 5, y: -10 };

				if (element.indexOf('label ') > -1) {
					let findPos = element.split('label [');
					if (findPos.length > 0 && findPos[1].indexOf(']') > -1) {
						let extractedPos = findPos[1].split(']')[0].split(',');
						labelOffset.x = parseFloat(extractedPos[0].trim());
						labelOffset.y = parseFloat(extractedPos[1].trim());
					}
				}

				elementsToReturn.push({
					name: name,
					maturity: positionData.maturity,
					visibility: positionData.visibility,
					id: 1 + i,
					evolving: newPoint != null && newPoint != undefined,
					evolveMaturity: newPoint,
					inertia: element.indexOf('inertia') > -1,
					label: labelOffset,
				});
			}
		}

		return elementsToReturn;
	}

	evolved(input) {
		let trimmed = input.trim();
		let elementsAsArray = trimmed.split('\n');
		let elementsToReturn = [];
		for (let i = 0; i < elementsAsArray.length; i++) {
			const element = elementsAsArray[i];
			if (element.trim().indexOf('evolve ') == 0) {
				let name = element.split('evolve ')[1].trim();

				let evolveMaturity = element.match(/\s[0-9]?\.[0-9]+[0-9]?/);
				let newPoint = 0.85;
				if (evolveMaturity.length > 0) {
					newPoint = parseFloat(evolveMaturity[0]);
					name = name.split(newPoint)[0].trim();
				}

				let labelOffset = { x: 5, y: -10 };

				if (element.indexOf('label ') > -1) {
					let findPos = element.split('label [');
					if (findPos.length > 0 && findPos[1].indexOf(']') > -1) {
						let extractedPos = findPos[1].split(']')[0].split(',');
						labelOffset.x = parseFloat(extractedPos[0].trim());
						labelOffset.y = parseFloat(extractedPos[1].trim());
					}
				}

				elementsToReturn.push({
					name: name,
					maturity: newPoint,
					label: labelOffset,
				});
			}
		}

		return elementsToReturn;
	}

	anchors(input) {
		let trimmed = input.trim();
		let elementsAsArray = trimmed.split('\n');

		let anchorsToReturn = [];

		for (let i = 0; i < elementsAsArray.length; i++) {
			const element = elementsAsArray[i];
			if (element.trim().indexOf('anchor') == 0) {
				let name = element
					.split('anchor ')[1]
					.trim()
					.split(' [')[0]
					.trim();

				let positionData = this.extractLocation(element, {
					visibility: 0.95,
					maturity: 0.05,
				});

				anchorsToReturn.push({
					name: name,
					maturity: positionData.maturity,
					visibility: positionData.visibility,
					id: 1 + i,
				});
			}
		}

		return anchorsToReturn;
	}

	links(input) {
		let trimmed = input.trim();
		let elementsAsArray = trimmed.split('\n');

		let linksToReturn = [];

		for (let i = 0; i < elementsAsArray.length; i++) {
			const element = elementsAsArray[i];
			if (
				element.trim().length > 0 &&
				element.trim().indexOf('evolution') == -1 &&
				element.trim().indexOf('anchor') == -1 &&
				element.trim().indexOf('evolve') == -1 &&
				element.trim().indexOf('component') == -1 &&
				element.trim().indexOf('style') == -1 &&
				element.trim().indexOf('build') == -1 &&
				element.trim().indexOf('buy') == -1 &&
				element.trim().indexOf('outsource') == -1 &&
				element.trim().indexOf('title') == -1 &&
				element.trim().indexOf('annotation') == -1 &&
				element.trim().indexOf('annotations') == -1 &&
				element.trim().indexOf('y-axis') == -1 &&
				element.trim().indexOf('note') == -1
			) {
				if (element.indexOf('+>') > -1) {
					let name = element.split('+>');
					linksToReturn.push({
						start: name[0].trim(),
						end: name[1].trim(),
						flow: true,
						future: true,
						past: false,
					});
				} else if (element.indexOf('+<>') > -1) {
					let name = element.split('+<>');
					linksToReturn.push({
						start: name[0].trim(),
						end: name[1].trim(),
						flow: true,
						future: true,
						past: true,
					});
				} else if (element.indexOf('+<') > -1) {
					let name = element.split('+<');
					linksToReturn.push({
						start: name[0].trim(),
						end: name[1].trim(),
						flow: true,
						future: false,
						past: true,
					});
				} else if (element.indexOf("+'") > -1) {
					let flowValue;
					let endName;
					let isFuture = false;
					let isPast = false;
					if (element.indexOf("'>") > -1) {
						flowValue = element.split("+'")[1].split("'>")[0];
						endName = element.split("'>");
						isFuture = true;
					} else if (element.indexOf("'<>") > -1) {
						flowValue = element.split("+'")[1].split("'<>")[0];
						endName = element.split("'<>");
						isPast = true;
						isFuture = true;
					} else if (element.indexOf("'<") > -1) {
						flowValue = element.split("+'")[1].split("'<")[0];
						endName = element.split("'<");
						isPast = true;
					}

					let startName = element.split("+'");
					linksToReturn.push({
						start: startName[0].trim(),
						end: endName[1].trim(),
						flow: true,
						flowValue: flowValue,
						future: isFuture,
						past: isPast,
					});
				} else {
					let name = element.split('->');
					linksToReturn.push({
						start: name[0].trim(),
						end: name[1].trim(),
						flow: false,
					});
				}
			}
		}

		return linksToReturn;
	}
}
