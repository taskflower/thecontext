import React, { useState, useEffect } from "react";
import StepPluginWrapper from "@/modules/plugins/wrappers/StepPluginWrapper";
import { StepModalProps } from "../types";
import { cn } from "@/utils/utils";
import { Bot, Puzzle, X } from "lucide-react";
import { useAppStore } from "../../store";
import useHistoryStore from "../../history/historyStore";

export const StepModal: React.FC<StepModalProps> = ({
  steps,
  currentStep,
  onNext,
  onPrev,
  onClose,
}) => {
  const currentNode = steps[currentStep];
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const isLastStep = currentStep === steps.length - 1;
  
  // Pobierz potrzebne funkcje ze store'ów
  const getCurrentScenario = useAppStore(state => state.getCurrentScenario);
  const saveConversation = useHistoryStore(state => state.saveConversation);

  // Reset input when changing steps
  useEffect(() => {
    if (currentNode && !userInputs[currentNode.id] && currentNode.userPrompt) {
      setUserInputs(prev => ({
        ...prev,
        [currentNode.id]: currentNode.userPrompt || ""
      }));
    }
  }, [currentNode, userInputs]);

  const getCurrentInput = () => {
    return currentNode ? (userInputs[currentNode.id] || "") : "";
  };

  const handleInputChange = (value: string) => {
    if (!currentNode) return;
    
    setUserInputs(prev => ({
      ...prev,
      [currentNode.id]: value
    }));
  };

  // Funkcja zapisująca historię konwersacji
  const saveHistory = () => {
    console.log("Zapisywanie historii konwersacji");
    
    const scenario = getCurrentScenario();
    if (!scenario) {
      console.error("Błąd: Brak aktywnego scenariusza do zapisu historii");
      return;
    }
    
    // Przygotuj finalną ścieżkę z aktualnymi danymi użytkownika
    const finalSteps = steps.map(node => {
      // Aktualizuj każdy węzeł o dane wpisane przez użytkownika
      if (userInputs[node.id]) {
        return { ...node, userPrompt: userInputs[node.id] };
      }
      return node;
    });
    
    console.log("Zapisywane dane węzłów:", finalSteps.map(node => ({
      id: node.id,
      label: node.label,
      userPrompt: node.userPrompt
    })));
    
    try {
      const historyId = saveConversation(
        scenario.id,
        scenario.label || scenario.name,
        finalSteps
      );
      console.log("SUKCES: Historia zapisana automatycznie z ID:", historyId);
    } catch (error) {
      console.error("Błąd podczas zapisywania historii:", error);
    }
  };

  // Obsługa nawigacji z zapisem inputów
  const handleNavigation = (direction: 'prev' | 'next' | 'finish') => {
    // Zapisz aktualny input do lokalnej pamięci
    if (currentNode) {
      const userInput = getCurrentInput();
      console.log(`Zapisuję input dla węzła ${currentNode.id}:`, userInput);
      
      // Aktualizuj lokalny stan
      steps[currentStep] = {
        ...steps[currentStep],
        userPrompt: userInput
      };
      
      // Zapisz do stanu komponentu
      setUserInputs(prev => ({
        ...prev,
        [currentNode.id]: userInput
      }));
    }
    
    if (direction === 'prev') {
      onPrev();
    } else if (direction === 'next') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onNext();
      }, 300);
    } else if (direction === 'finish') {
      // Zapisz historię przed zamknięciem
      saveHistory();
      // Wywołaj standardową funkcję onClose
      onClose();
    }
  };

  // Obsługa zamknięcia okna z zapisem historii
  const handleClose = () => {
    // Zapisz historię przed zamknięciem
    saveHistory();
    // Wywołaj standardową funkcję onClose
    onClose();
  };

  if (!currentNode) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg border border-border shadow-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-medium">
            Krok {currentStep + 1} z {steps.length}: {currentNode.label}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 space-y-4">
            {/* Assistant message */}
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Asystent:
                </p>
                <div className="bg-muted rounded-lg py-2 px-3">
                  {currentNode.assistantMessage ||
                    "Czekam na Twoją odpowiedź..."}
                </div>
              </div>
            </div>

            {/* Plugin (if exists) */}
            {currentNode.pluginKey && (
              <div className="border border-border rounded-lg overflow-hidden mt-4">
                <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center">
                  <Puzzle className="h-4 w-4 mr-2 text-primary" />
                  <h4 className="font-medium">
                    Plugin: {currentNode.pluginKey}
                  </h4>
                </div>
                <div className="p-4 bg-background">
                  <StepPluginWrapper
                    componentKey={currentNode.pluginKey}
                    nodeData={currentNode}
                  />
                </div>
              </div>
            )}

            {/* User input field */}
            <div className="mt-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Twoja odpowiedź:
              </p>
              <textarea
                value={getCurrentInput()}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Wpisz swoją wiadomość..."
                className="w-full p-3 border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
              ></textarea>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => handleNavigation('prev')}
              disabled={currentStep === 0 || isProcessing}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                currentStep === 0 || isProcessing
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
              )}
            >
              ← Poprzedni
            </button>

            <button
              onClick={() => handleNavigation(isLastStep ? 'finish' : 'next')}
              disabled={isProcessing}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                isProcessing 
                  ? "bg-primary/70 text-primary-foreground cursor-wait" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {isLastStep ? "Zakończ" : "Następny →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};