import React from 'react';
import {MapDimensions} from '../../constants/defaults';
import {MapTheme} from '../../constants/mapstyles';
import {MapNotes} from '../../types/base';
import ComponentTextSymbol from '../symbols/ComponentTextSymbol';
import ModernPositionCalculator from './ModernPositionCalculator';
import Movable from './Movable';
import {ModernExistingCoordsMatcher} from './positionUpdaters/ModernExistingCoordsMatcher';
import ModernLineNumberPositionUpdater from './positionUpdaters/ModernLineNumberPositionUpdater';
import {NotDefinedCoordsMatcher} from './positionUpdaters/NotDefinedCoordsMatcher';

interface MovedPosition {
    x: number;
    y: number;
}

interface ModernNoteProps {
    note: MapNotes;
    mapDimensions: MapDimensions;
    mapText: string;
    mutateMapText: (text: string) => void;
    mapStyleDefs: MapTheme;
    setHighlightLine: (line: number) => void;
    scaleFactor: number;
}

const Note: React.FC<ModernNoteProps> = ({note, mapDimensions, mapText, mutateMapText, mapStyleDefs, setHighlightLine, scaleFactor}) => {
    const positionCalc = new ModernPositionCalculator();
    const positionUpdater = new ModernLineNumberPositionUpdater('note', mapText, mutateMapText, [
        ModernExistingCoordsMatcher,
        NotDefinedCoordsMatcher,
    ]);

    const x = (): number => positionCalc.maturityToX(note.maturity, mapDimensions.width);

    const y = (): number => positionCalc.visibilityToY(note.visibility, mapDimensions.height);

    function endDrag(moved: MovedPosition): void {
        const visibility = positionCalc.yToVisibility(moved.y, mapDimensions.height);
        const maturity = positionCalc.xToMaturity(moved.x, mapDimensions.width);
        positionUpdater.update({param1: parseFloat(visibility), param2: parseFloat(maturity)}, note.text, note.line);
    }

    return (
        <Movable id={`modern_note_${note.id}`} onMove={endDrag} x={x()} y={y()} fixedY={false} fixedX={false} scaleFactor={scaleFactor}>
            <ComponentTextSymbol
                id={`modern_note_text_${note.id}`}
                note={note.text}
                textTheme={mapStyleDefs?.note}
                onClick={() => setHighlightLine(note.line)}
            />
        </Movable>
    );
};

export default Note;
