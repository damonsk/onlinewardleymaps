import React, { createContext, useContext } from 'react';

const FeatureSwitchesContext = createContext();

export const FeatureSwitchesProvider = ({ children, value }) => (
  <FeatureSwitchesContext.Provider value={value}>
    {children}
  </FeatureSwitchesContext.Provider>
);

export const useFeatureSwitches = () => useContext(FeatureSwitchesContext);
