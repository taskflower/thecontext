
import { useFlowNavigation } from '@/hooks';

import { useCallback } from 'react';
import { calculateFlowPath } from './flowUtils';
import { StepModal } from '@/components/APPUI';
import { useScenarioStore } from '../scenarios';


export const FlowPlayer: React.FC = () => {
  const getCurrentScenario = useScenarioStore(state => state.getCurrentScenario);
  
  const {
    isPlaying,
    currentStepIndex,
    steps,
    startFlow,
    nextStep,
    prevStep,
    stopFlow
  } = useFlowNavigation();
  
  const handlePlay = useCallback(() => {
    const scenario = getCurrentScenario();
    if (scenario) {
      const path = calculateFlowPath(scenario.children, scenario.edges);
      startFlow(path);
    }
  }, [getCurrentScenario, startFlow]);
  
  return (
    <>
      <div className="absolute top-2 right-2 z-10">
        <button 
          onClick={handlePlay}
          className="p-2 rounded-md bg-blue-500 text-white text-xs font-medium hover:bg-blue-600"
        >
          Play Flow
        </button>
      </div>
      
      {isPlaying && steps.length > 0 && (
        <StepModal 
          steps={steps}
          currentStep={currentStepIndex}
          onNext={nextStep}
          onPrev={prevStep}
          onClose={stopFlow}
        />
      )}
    </>
  );
};