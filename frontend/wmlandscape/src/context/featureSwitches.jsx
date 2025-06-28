// Define the context and providers needed for VS Code extension
import React, { createContext, useEffect, useState } from 'react';

// Feature switches context and provider
export const FeatureSwitchesContext = createContext(null);

export const FeatureSwitchesProvider = ({ value, children }) => {
  return <FeatureSwitchesContext.Provider value={value}>{children}</FeatureSwitchesContext.Provider>;
};

export const useFeatureSwitches = () => {
  const context = React.useContext(FeatureSwitchesContext);
  if (context === undefined) {
    throw new Error('useFeatureSwitches must be used within a FeatureSwitchesProvider');
  }
  return context;
};

// Mod key context and provider
export const ModKeyPressedContext = createContext(false);

export const ModKeyPressedProvider = ({ children }) => {
  const [isModKeyPressed, setIsModKeyPressed] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        setIsModKeyPressed(true);
      }
    };
    
    const handleKeyUp = (e) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIsModKeyPressed(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  return <ModKeyPressedContext.Provider value={isModKeyPressed}>{children}</ModKeyPressedContext.Provider>;
};

export const useModKeyPressedConsumer = () => {
  const context = React.useContext(ModKeyPressedContext);
  if (context === undefined) {
    throw new Error('useModKeyPressedConsumer must be used within a ModKeyPressedProvider');
  }
  return context;
};
