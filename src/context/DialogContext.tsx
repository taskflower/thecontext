/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define all dialog types in your application
type DialogType = 'newScenario' | 'editScenario' | 'execution' | 'filterHelp';

interface DialogContextType {
  openDialog: (type: DialogType, props?: any) => void;
  closeDialog: (type: DialogType) => void;
  isDialogOpen: (type: DialogType) => boolean;
  getDialogProps: (type: DialogType) => any;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

interface DialogProviderProps {
  children: ReactNode;
}

export const DialogProvider: React.FC<DialogProviderProps> = ({ children }) => {
  // State to track which dialogs are open and their props
  const [openDialogs, setOpenDialogs] = useState<Record<DialogType, boolean>>({
    newScenario: false,
    editScenario: false,
    execution: false,
    filterHelp: false,
  });
  
  const [dialogProps, setDialogProps] = useState<Record<DialogType, any>>({
    newScenario: {},
    editScenario: {},
    execution: {},
    filterHelp: {},
  });

  const openDialog = (type: DialogType, props?: any) => {
    setOpenDialogs(prev => ({ ...prev, [type]: true }));
    if (props) {
      setDialogProps(prev => ({ ...prev, [type]: props }));
    }
  };

  const closeDialog = (type: DialogType) => {
    setOpenDialogs(prev => ({ ...prev, [type]: false }));
  };

  const isDialogOpen = (type: DialogType) => openDialogs[type];
  
  const getDialogProps = (type: DialogType) => dialogProps[type];

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog, isDialogOpen, getDialogProps }}>
      {children}
    </DialogContext.Provider>
  );
};