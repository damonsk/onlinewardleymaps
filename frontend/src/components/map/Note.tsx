import { MapDimensions } from '../../constants/defaults';
import { MapNotes } from '../../types/base';
import { MapTheme } from '../../types/map/styles';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import Movable from './Movable';
import PositionCalculator from './PositionCalculator';
import { ExistingCoordsMatcher } from './positionUpdaters/ExistingCoordsMatcher';
import LineNumberPositionUpdater from './positionUpdaters/LineNumberPositionUpdater';
import { NotDefinedCoordsMatcher } from './positionUpdaters/NotDefinedCoordsMatcher';

interface MovedPosition {
    x: number;
    y: number;
}

interface NoteProps {
    note: MapNotes;
    mapDimensions: MapDimensions;
    mapText: string;
    mutateMapText: (text: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: (line: number) => void;
    scaleFactor: number;
}

function Note(props: NoteProps): JSX.Element {
    const positionCalc = new PositionCalculator();
    const positionUpdater = new LineNumberPositionUpdater(
        'note',
        props.mapText,
        props.mutateMapText,
        [ExistingCoordsMatcher, NotDefinedCoordsMatcher],
    );

    const x = (): number =>
        positionCalc.maturityToX(
            props.note.maturity,
            props.mapDimensions.width,
        );
    const y = (): number =>
        positionCalc.visibilityToY(
            props.note.visibility,
            props.mapDimensions.height,
        );

    function endDrag(moved: MovedPosition): void {
        const visibility = positionCalc.yToVisibility(
            moved.y,
            props.mapDimensions.height,
        );
        const maturity = positionCalc.xToMaturity(
            moved.x,
            props.mapDimensions.width,
        );
        positionUpdater.update(
            { param1: parseFloat(visibility), param2: parseFloat(maturity) },
            props.note.text,
            props.note.line,
        );
    }

    return (
        <Movable
            id={'note_' + props.note.id}
            onMove={endDrag}
            x={x()}
            y={y()}
            fixedY={false}
            fixedX={false}
            scaleFactor={props.scaleFactor}
        >
            <ComponentTextSymbol
                id={'note_text_' + props.note.id}
                note={props.note.text}
                textTheme={props?.mapStyleDefs?.note}
                onClick={() => props.setHighlightLine(props.note.line)}
            />
        </Movable>
    );
}

export default Note;
