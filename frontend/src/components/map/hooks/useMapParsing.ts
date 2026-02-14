import {useMemo, useCallback} from 'react';
import * as MapStyles from '../../../constants/mapstyles';
import Converter from '../../../conversion/Converter';
import {UnifiedConverter} from '../../../conversion/UnifiedConverter';
import {IProvideFeatureSwitches} from '../../../types/base';

interface UseMapParsingProps {
    mapText: string;
    featureSwitches: IProvideFeatureSwitches;
}

interface ParsedMapData {
    isValid: boolean;
    legacy: any | null;
    unified: any | null;
    errors: any[];
}

interface UseMapParsingReturn {
    parsedMapData: ParsedMapData;
    getMapStyleDefs: (style: string) => any;
}

export const useMapParsing = (props: UseMapParsingProps): UseMapParsingReturn => {
    const {mapText, featureSwitches} = props;

    // Memoized parsing to prevent unnecessary re-computation
    const parsedMapData = useMemo(() => {
        try {
            const converter = new Converter(featureSwitches);
            const unifiedConverter = new UnifiedConverter(featureSwitches);

            const legacyResult = converter.parse(mapText);
            const unifiedResult = unifiedConverter.parse(mapText);

            return {
                isValid: true,
                legacy: legacyResult,
                unified: unifiedResult,
                errors: legacyResult.errors,
            };
        } catch (err) {
            console.log('Error parsing map:', err);
            return {
                isValid: false,
                legacy: null,
                unified: null,
                errors: [],
            };
        }
    }, [mapText, featureSwitches]);

    const getMapStyleDefs = useCallback((style: string) => {
        switch (style) {
            case 'colour':
            case 'color':
                return MapStyles.Colour;
            case 'wardley':
                return MapStyles.Wardley;
            case 'dark':
                return MapStyles.Dark;
            case 'handwritten':
                return MapStyles.Handwritten;
            default:
                return MapStyles.Plain;
        }
    }, []);

    return {
        parsedMapData,
        getMapStyleDefs,
    };
};
