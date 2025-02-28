import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useWizardStore } from '@/store/wizardStore';

export function useTaskIntegration() {
  const { activeTaskId, setActiveTask } = useUIStore();
  const wizardStore = useWizardStore();
  
  // Synchronizuj stan między store'ami
  useEffect(() => {
    if (activeTaskId !== wizardStore.activeTaskId) {
      wizardStore.setActiveTask(activeTaskId);
    }
  }, [activeTaskId, wizardStore]);
  
  // Synchronizuj w drugą stronę
  useEffect(() => {
    if (wizardStore.activeTaskId !== activeTaskId && wizardStore.activeTaskId !== null) {
      setActiveTask(wizardStore.activeTaskId);
    }
  }, [wizardStore.activeTaskId, activeTaskId, setActiveTask]);
  
  return {
    openTaskWizard: wizardStore.openWizard,
    setActiveTask: setActiveTask
  };
}