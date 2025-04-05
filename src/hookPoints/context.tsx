/**
 * Hook points context provider
 */
import React, { createContext, useContext, useState, useCallback } from 'react';
import { HookPointContextValue, HookPointRegistration } from './types';

// Create context for hook points
const HookPointContext = createContext<HookPointContextValue>({
  hookPoints: {},
  registerHookPoint: () => {},
  unregisterHookPoint: () => {},
  getHookPointComponents: () => [],
});

export interface HookPointProviderProps {
  children: React.ReactNode;
}

/**
 * Hook points provider component
 */
export const HookPointProvider: React.FC<HookPointProviderProps> = ({ 
  children 
}) => {
  // State for all registered hook points
  const [hookPoints, setHookPoints] = useState<Record<string, HookPointRegistration[]>>({});
  
  // Register a hook point component
  const registerHookPoint = useCallback((registration: HookPointRegistration) => {
    setHookPoints(prevHookPoints => {
      const newHookPoints = { ...prevHookPoints };
      
      // Create array for this hook point if it doesn't exist
      if (!newHookPoints[registration.name]) {
        newHookPoints[registration.name] = [];
      }
      
      // Check if this plugin already has a registration for this hook point
      const existingIndex = newHookPoints[registration.name].findIndex(
        r => r.pluginId === registration.pluginId && r.position === registration.position
      );
      
      // Update or add the registration
      if (existingIndex >= 0) {
        newHookPoints[registration.name][existingIndex] = registration;
      } else {
        newHookPoints[registration.name].push(registration);
      }
      
      // Sort by priority
      newHookPoints[registration.name].sort((a, b) => a.priority - b.priority);
      
      return newHookPoints;
    });
  }, []);
  
  // Unregister a hook point component
  const unregisterHookPoint = useCallback((name: string, pluginId: string) => {
    setHookPoints(prevHookPoints => {
      // If hook point doesn't exist, return current state
      if (!prevHookPoints[name]) {
        return prevHookPoints;
      }
      
      const newHookPoints = { ...prevHookPoints };
      
      // Filter out registrations from this plugin
      newHookPoints[name] = prevHookPoints[name].filter(
        registration => registration.pluginId !== pluginId
      );
      
      // Remove the hook point entirely if it's empty
      if (newHookPoints[name].length === 0) {
        delete newHookPoints[name];
      }
      
      return newHookPoints;
    });
  }, []);
  
  // Get components for a specific hook point
  const getHookPointComponents = useCallback((name: string) => {
    return hookPoints[name] || [];
  }, [hookPoints]);
  
  // Context value
  const value: HookPointContextValue = {
    hookPoints,
    registerHookPoint,
    unregisterHookPoint,
    getHookPointComponents,
  };
  
  return (
    <HookPointContext.Provider value={value}>
      {children}
    </HookPointContext.Provider>
  );
};

/**
 * Hook to use the hook points system
 */
export const useHookPoints = () => useContext(HookPointContext);

export default HookPointContext;