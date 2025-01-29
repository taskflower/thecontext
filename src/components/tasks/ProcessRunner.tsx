import { FC, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { plugins } from '@/plugins';
import { StepData, Template } from '@/types/template';

interface ProcessRunnerProps {
  template: Template;
  onBack: () => void;
  onComplete: () => void;
}

export const ProcessRunner: FC<ProcessRunnerProps> = ({ 
  template, 
  onBack,
  onComplete 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepsData, setStepsData] = useState<StepData[]>(
    template.steps.map(step => ({ ...step.data }))
  );

  const currentStep = template.steps[currentStepIndex];
  const PluginComponent = plugins[currentStep.pluginId].component;
  const isLastStep = currentStepIndex === template.steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex(prev => Math.min(template.steps.length - 1, prev + 1));
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{template.name}</h2>
          <p className="text-muted-foreground">
            Complete the steps below to run this template
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Step {currentStepIndex + 1} of {template.steps.length}: {currentStep.name}
          </CardTitle>
          <CardDescription>{currentStep.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <PluginComponent
              data={stepsData[currentStepIndex]}
              onChange={(data) => setStepsData(prev => 
                prev.map((d, i) => i === currentStepIndex ? { ...d, ...data } : d)
              )}
            />

            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                disabled={currentStepIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                className="gap-2"
              >
                {isLastStep ? (
                  <>
                    Complete
                    <CheckCircle className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessRunner;