import {renameAnchor} from '../../constants/renameAnchor';

describe('renameAnchor Business use case', () => {
    let mutateMapTextSpy: jest.Mock;

    beforeEach(() => {
        mutateMapTextSpy = jest.fn();
    });

    it('should rename anchor Business to Foobar and update links', () => {
        const mapText = [
            'anchor Business [0.5, 0.7]',
            'component Cup [0.3, 0.8]',
            'Business->Cup'
        ].join('\n');

        const result = renameAnchor(1, 'Business', 'Foobar', mapText, mutateMapTextSpy);
        
        expect(result.success).toBe(true);
        const expectedText = [
            'anchor Foobar [0.5, 0.7]',
            'component Cup [0.3, 0.8]',
            'Foobar->Cup'
        ].join('\n');
        expect(mutateMapTextSpy).toHaveBeenCalledWith(expectedText);
    });

    it('should handle quoted anchor names with Business example', () => {
        const mapText = [
            'anchor "Business Unit" [0.5, 0.7]',
            'component Cup [0.3, 0.8]',
            '"Business Unit"->Cup'
        ].join('\n');

        const result = renameAnchor(1, 'Business Unit', 'Foobar Unit', mapText, mutateMapTextSpy);
        
        expect(result.success).toBe(true);
        const expectedText = [
            'anchor "Foobar Unit" [0.5, 0.7]',
            'component Cup [0.3, 0.8]',
            '"Foobar Unit"->Cup'
        ].join('\n');
        expect(mutateMapTextSpy).toHaveBeenCalledWith(expectedText);
    });
});