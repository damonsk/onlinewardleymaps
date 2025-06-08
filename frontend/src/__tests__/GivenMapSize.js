import {useContext} from 'react';
import Converter from '../conversion/Converter';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useContext: jest.fn(),
}));

useContext.mockReturnValue({enableNewPipelines: false});

describe('Given map size can change', function () {
    test('When dimensions specified, ensure values are parsed', function () {
        const mockContextValue = useContext();
        let actual = 'size [1024, 768]' + '\n';
        let result = new Converter(mockContextValue).parse(actual);
        expect(result.presentation.size.width).toEqual(1024);
        expect(result.presentation.size.height).toEqual(768);
    });
});
