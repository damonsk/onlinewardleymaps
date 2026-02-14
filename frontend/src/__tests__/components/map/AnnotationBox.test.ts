import {updateAnnotationLineText} from '../../../components/map/AnnotationBox';

describe('AnnotationBox map text updates', () => {
    it('updates single-occurrence annotation text', () => {
        const input = 'annotation 2 [0.78, 0.64] Hot water is obvious and well known';
        const result = updateAnnotationLineText(input, 2, 'Updated annotation text');

        expect(result).toBe('annotation 2 [0.78, 0.64] Updated annotation text');
    });

    it('updates multi-occurrence annotation text', () => {
        const input = 'annotation 1 [[0.85,0.64],[0.85,0.68]] Standardising power allows Kettles to evolve faster';
        const result = updateAnnotationLineText(input, 1, 'New grouped text');

        expect(result).toBe('annotation 1 [[0.85,0.64],[0.85,0.68]] New grouped text');
    });

    it('removes trailing text when saving empty annotation text', () => {
        const input = 'annotation 3 [0.12, 0.45] Existing text';
        const result = updateAnnotationLineText(input, 3, '   ');

        expect(result).toBe('annotation 3 [0.12, 0.45]');
    });

    it('does not modify unrelated lines', () => {
        const input = 'component Kettle [0.43, 0.35]';
        const result = updateAnnotationLineText(input, 1, 'Should not apply');

        expect(result).toBe(input);
    });
});
