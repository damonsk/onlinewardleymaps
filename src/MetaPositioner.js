export default class MetaPositioner {
	for(id, metaText, defaultOffset) {
		if (metaText.length > 0) {
			var meta = JSON.parse(metaText);
			var itemToModify = meta.find(el => {
				if (el.name === id) return el;
				return null;
			});
			if (itemToModify !== null) {
				return {
					x: itemToModify.x,
					y: itemToModify.y,
					coords: {},
				};
			} else return defaultOffset;
		}
		return defaultOffset;
	}

	update(id, metaText, moved) {
		if (metaText.length > 0) {
			var meta = JSON.parse(metaText);
			if (meta.find(el => el.name === id) === undefined) {
				meta.push({ name: id, x: moved.x, y: moved.y });
			}
			var modifiedArray = meta.map(el => {
				if (el.name === id) {
					el.x = moved.x;
					el.y = moved.y;
				}
				return el;
			});
			return JSON.stringify(modifiedArray);
		} else {
			return JSON.stringify([{ name: id, x: moved.x, y: moved.y }]);
		}
	}
}
