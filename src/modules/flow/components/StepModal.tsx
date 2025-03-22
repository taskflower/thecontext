import React from "react";
import { X } from "lucide-react";
import { StepModalProps } from "../../ui/types";
import FullPluginWrapper from "@/modules/plugins/wrappers/FullPluginWrapper";

export const StepModal: React.FC<StepModalProps> = ({
  steps,
  currentStep,
  onNext,
  onPrev,
  onClose,
}) => {
  const currentNode = steps[currentStep];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-medium text-card-foreground">
            Step {currentStep + 1} of {steps.length}: {currentNode.label}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-accent/80"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <div className="font-medium mb-2 text-card-foreground">
              Node: {currentNode.label}
            </div>
            <div className="text-sm mb-2 text-muted-foreground">Value: {currentNode.value}</div>
          </div>

          {/* Render plugin if available */}
          {currentNode.pluginKey && (
            <div className="mb-4 border border-border rounded-lg">
              <div className="bg-muted/10 px-4 py-2 border-b border-border">
                <h4 className="font-medium">Node Plugin: {currentNode.pluginKey}</h4>
              </div>
              <div className="p-4">
                <FullPluginWrapper componentKey={currentNode.pluginKey} />
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={onPrev}
              disabled={currentStep === 0}
              className={`px-3 py-1 rounded-md text-sm ${
                currentStep === 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              }`}
            >
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={onNext}
                className="px-3 py-1 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-3 py-1 rounded-md text-sm bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};