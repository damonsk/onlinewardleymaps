import React, { ReactNode, createContext, useContext } from 'react';
import { IProvideFeatureSwitches } from '../types/base';

interface FeatureSwitchesProviderProps {
    children: ReactNode;
    value: IProvideFeatureSwitches;
}

export const FeatureSwitchesContext = createContext<any>(null);

export const FeatureSwitchesProvider: React.FC<FeatureSwitchesProviderProps> = ({children, value}) => (
    <FeatureSwitchesContext.Provider value={value}>{children}</FeatureSwitchesContext.Provider>
);

export const useFeatureSwitches = (): any => useContext(FeatureSwitchesContext);
