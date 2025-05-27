import React, { ReactNode, createContext, useContext } from 'react';
import { OwmFeatureSwitches } from '../constants/featureswitches';

interface FeatureSwitchesProviderProps {
    children: ReactNode;
    value: OwmFeatureSwitches;
}

const FeatureSwitchesContext = createContext<any>(null);

export const FeatureSwitchesProvider: React.FC<
    FeatureSwitchesProviderProps
> = ({ children, value }) => (
    <FeatureSwitchesContext.Provider value={value}>
        {children}
    </FeatureSwitchesContext.Provider>
);

export const useFeatureSwitches = (): any => useContext(FeatureSwitchesContext);
