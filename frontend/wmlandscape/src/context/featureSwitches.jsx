// Define the context and providers needed for VS Code extension
import React, {createContext} from 'react';

// Feature switches context and provider
export const FeatureSwitchesContext = createContext(null);

export const FeatureSwitchesProvider = ({value, children}) => {
    return <FeatureSwitchesContext.Provider value={value}>{children}</FeatureSwitchesContext.Provider>;
};

export const useFeatureSwitches = () => {
    const context = React.useContext(FeatureSwitchesContext);
    if (context === undefined) {
        throw new Error('useFeatureSwitches must be used within a FeatureSwitchesProvider');
    }
    return context;
};
