/**
 * HookPoint component - renders plugin components at defined hook points
 */
import React from 'react';
import { HookPointProps } from './types';
import { useHookPoints } from './context';

/**
 * HookPoint component that renders plugin components at specific hook points
 */
const HookPoint: React.FC<HookPointProps> = ({
  name,
  defaultComponent = null,
  props = {}
}) => {
  const { getHookPointComponents } = useHookPoints();
  
  // Get all registered components for this hook point
  const hookPointRegistrations = getHookPointComponents?.(name) || [];
  
  // If no components and no default, render nothing
  if (hookPointRegistrations.length === 0 && !defaultComponent) {
    return null;
  }
  
  // Organize components by position
  const beforeComponents = hookPointRegistrations
    .filter(reg => reg.position === 'before')
    .map((reg, index) => (
      <React.Fragment key={`${reg.pluginId}-${index}`}>
        {React.createElement(reg.component, props)}
      </React.Fragment>
    ));
    
  const replacementComponents = hookPointRegistrations
    .filter(reg => reg.position === 'replace')
    .map((reg, index) => (
      <React.Fragment key={`${reg.pluginId}-${index}`}>
        {React.createElement(reg.component, props)}
      </React.Fragment>
    ));
    
  const afterComponents = hookPointRegistrations
    .filter(reg => reg.position === 'after')
    .map((reg, index) => (
      <React.Fragment key={`${reg.pluginId}-${index}`}>
        {React.createElement(reg.component, props)}
      </React.Fragment>
    ));
  
  // If there are replacement components, render those instead of the default
  const shouldRenderDefault = replacementComponents.length === 0;
  
  return (
    <>
      {beforeComponents}
      {shouldRenderDefault && defaultComponent}
      {replacementComponents}
      {afterComponents}
    </>
  );
};

export default HookPoint;