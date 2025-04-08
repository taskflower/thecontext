// src/components/flow/FlowHeader.tsx
import { Node } from '@/store/types';

interface FlowHeaderProps {
  scenarioName: string;
  currentNodeIndex: number;
  totalNodes: number;
  currentNode: Node;
  onBack: () => void;
}

/**
 * Nagłówek widoku Flow z informacjami o aktualnym kroku
 */
export const FlowHeader: React.FC<FlowHeaderProps> = ({
  scenarioName,
  currentNodeIndex,
  totalNodes,
  currentNode,
  onBack
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <button 
          onClick={onBack}
          className="text-[hsl(var(--primary))] hover:opacity-80 text-sm font-medium"
        >
          ← Powrót
        </button>
        <h1 className="text-2xl font-semibold">{scenarioName}</h1>
      </div>
      
      <div className="flex justify-between items-center mb-4 text-sm text-[hsl(var(--muted-foreground))]">
        <span>
          Krok {currentNodeIndex + 1} z {totalNodes}
        </span>
        <span>
          {currentNode.label}
          {currentNode.pluginType && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
              {currentNode.pluginType === 'url-input' ? 'URL' : currentNode.pluginType}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

// src/components/flow/FlowNavigationControls.tsx
import React from 'react';
import useStore from '@/store';

interface FlowNavigationControlsProps {
  currentIndex: number;
  totalNodes: number;
}

/**
 * Przyciski nawigacyjne do poruszania się między węzłami
 */
export const FlowNavigationControls: React.FC<FlowNavigationControlsProps> = ({
  currentIndex,
  totalNodes
}) => {
  const nextStep = useStore(state => state.nextStep);
  const prevStep = useStore(state => state.prevStep);
  const finishFlow = useStore(state => state.finishFlow);
  
  const isLastStep = currentIndex === totalNodes - 1;
  
  return (
    <div className="flex justify-between">
      <button
        onClick={prevStep}
        disabled={currentIndex === 0}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors px-4 py-2
          ${currentIndex === 0
            ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
            : "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-opacity-80"
          }`}
      >
        ← Wstecz
      </button>

      {isLastStep ? (
        <button
          onClick={finishFlow}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] transition-colors hover:bg-opacity-90 px-4 py-2"
        >
          Zakończ
        </button>
      ) : (
        <button
          onClick={nextStep}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] transition-colors hover:bg-opacity-90 px-4 py-2"
        >
          Dalej →
        </button>
      )}
    </div>
  );
};

export default { FlowHeader, FlowNavigationControls };