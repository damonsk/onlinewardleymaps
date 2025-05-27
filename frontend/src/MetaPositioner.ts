interface MetaItem {
    name: string;
    x: number;
    y: number;
}

interface Offset {
    x: number;
    y: number;
    coords: Record<string, unknown>;
}

export default class MetaPositioner {
    for(id: string, metaText: string, defaultOffset: Offset): Offset {
        if (metaText.length > 0) {
            const meta: MetaItem[] = JSON.parse(metaText);
            const itemToModify = meta.find((el) => el.name === id);
            if (itemToModify !== undefined) {
                return {
                    x: itemToModify.x,
                    y: itemToModify.y,
                    coords: {},
                };
            } else {
                return defaultOffset;
            }
        }
        return defaultOffset;
    }

    update(
        id: string,
        metaText: string,
        moved: { x: number; y: number },
    ): string {
        if (metaText.length > 0) {
            const meta: MetaItem[] = JSON.parse(metaText);
            if (meta.find((el) => el.name === id) === undefined) {
                meta.push({ name: id, x: moved.x, y: moved.y });
            }
            const modifiedArray = meta.map((el) => {
                if (el.name === id) {
                    return { ...el, x: moved.x, y: moved.y };
                }
                return el;
            });
            return JSON.stringify(modifiedArray);
        } else {
            return JSON.stringify([{ name: id, x: moved.x, y: moved.y }]);
        }
    }
}
