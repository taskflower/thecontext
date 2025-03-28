// src/modules/flow/useDialog.tsx
import React, { useState, useCallback } from 'react';
import { useAppStore } from '../store';
import StepModal from './components/StepModal';
import { DialogTemplate } from './components/interfaces';

/**
 * Hook do łatwego zarządzania dialogami flow
 */
export const useDialog = (defaultTemplate: DialogTemplate = 'default') => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [template, setTemplate] = useState<DialogTemplate>(defaultTemplate);
  
  const startFlowSession = useAppStore(state => state.startFlowSession);
  const resetFlowSession = useAppStore(state => state.resetFlowSession);
  
  // Rozpocznij nowy dialog
  const startDialog = useCallback((newTemplate?: DialogTemplate) => {
    // Resetuj i przygotuj sesję
    resetFlowSession();
    startFlowSession();
    
    // Ustaw szablon, jeśli podano
    if (newTemplate) {
      setTemplate(newTemplate);
    }
    
    // Otwórz dialog
    setIsDialogOpen(true);
  }, [resetFlowSession, startFlowSession]);
  
  // Zamknij dialog
  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);
  
  // Zmień szablon dialogu
  const changeTemplate = useCallback((newTemplate: DialogTemplate) => {
    setTemplate(newTemplate);
  }, []);
  
  // Komponent dialogu
  const DialogComponent = useCallback(() => {
    if (!isDialogOpen) return null;
    return <StepModal onClose={closeDialog} template={template} />;
  }, [isDialogOpen, template, closeDialog]);
  
  return {
    isDialogOpen,
    currentTemplate: template,
    startDialog,
    closeDialog,
    changeTemplate,
    DialogComponent
  };
};

/**
 * Przykład użycia:
 * 
 * const MyComponent = () => {
 *   const { 
 *     startDialog, 
 *     closeDialog, 
 *     DialogComponent, 
 *     changeTemplate 
 *   } = useDialog('default');
 *   
 *   return (
 *     <>
 *       <button onClick={() => startDialog()}>Start dialog</button>
 *       <button onClick={() => changeTemplate('alternative')}>
 *         Change template
 *       </button>
 *       <DialogComponent />
 *     </>
 *   );
 * };
 */