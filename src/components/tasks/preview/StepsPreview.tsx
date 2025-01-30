/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepVisualizer from './StepVisualizer';

interface Step {
  id: string;
  name: string;
  description: string;
  config?: Record<string, any>;
}

interface StepState {
  data: {
    answer?: string;
    isConfirmed?: boolean;
    role?: string;
  };
  isValid: boolean;
}

interface StepsPreviewProps {
  steps: Step[];
  stepsState: StepState[];
  currentStepIndex: number;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
}

const StepsPreview: React.FC<StepsPreviewProps> = ({ 
  steps, 
  stepsState, 
  currentStepIndex,
  isPanelOpen,
  onTogglePanel
}) => {
  const getStepAnswer = (step: Step) => {
    const stepIndex = steps.findIndex((s) => s.id === step.id);
    const stepState = stepsState[stepIndex];
    return stepState?.data?.answer;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Steps Preview</h2>
          <p className="text-sm text-muted-foreground">
            Track your progress through the workflow steps
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onTogglePanel}
          className="h-9 w-9"
        >
          {isPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </Button>
      </div>

      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visual">Visual</TabsTrigger>
          <TabsTrigger value="data">Step Data</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="mt-4">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="relative space-y-4 ml-4">
              {steps.map((step, index) => (
                <StepVisualizer
                  key={step.id}
                  step={step}
                  index={index}
                  currentStepIndex={currentStepIndex}
                  stepsLength={steps.length}
                  stepAnswer={getStepAnswer(step)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="data" className="mt-4">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <pre className="p-4 bg-muted rounded-lg text-sm select-text">
              {JSON.stringify({
                totalSteps: steps.length,
                currentStep: currentStepIndex + 1,
                steps: steps.map((step, index) => ({
                  id: step.id,
                  name: step.name,
                  description: step.description,
                  config: step.config || {},
                  data: stepsState[index]?.data || {
                    answer: "",
                    isConfirmed: false,
                  },
                })),
              }, null, 2)}
            </pre>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <pre className="p-4 bg-muted rounded-lg text-sm select-text">
              {JSON.stringify({
                messages: [],
              }, null, 2)}
            </pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StepsPreview;