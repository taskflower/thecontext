// ProjectBasedSetupPage.tsx
import React, { useState } from "react";
import { IGeneratedSetup } from "@/utils/projects/projectTypes";

import { useProjectStore } from "@/store/projectStore";
import {
  Step1ProjectSelection,
  Step2LLMConversation,
  Step3ReviewSetup,
  Step4Completion,
  StepIndicator,
  StepNavigation,
} from "@/components/projects/baseSetup";
import AdminOutletTemplate from "@/layouts/AdminOutletTemplate";

const ProjectBasedSetupPage: React.FC = () => {
  // Store
  const currentProject = useProjectStore((state) => state.currentProject);

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedSetup, setGeneratedSetup] = useState<IGeneratedSetup | null>(
    null
  );

  // Step labels
  const stepLabels = [
    "Project",
    "AI Description",
    "Review Setup",
    "Completion",
  ];

  // Navigation functions
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle generated setup from LLM
  const handleGeneratedSetup = (setup: IGeneratedSetup) => {
    setGeneratedSetup(setup);
  };

  // Reset form for new project
  const resetSetup = () => {
    setCurrentStep(0);
    setGeneratedSetup(null);
  };

  // Render the appropriate step component
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <Step1ProjectSelection />;
      case 1:
        return (
          <Step2LLMConversation
            onGeneratedSetup={handleGeneratedSetup}
            onSetCurrentStep={setCurrentStep}
          />
        );
      case 2:
        return (
          <Step3ReviewSetup
            generatedSetup={generatedSetup}
            onSetCurrentStep={setCurrentStep}
          />
        );
      case 3:
        return <Step4Completion onResetSetup={resetSetup} />;
      default:
        return null;
    }
  };

  // Main component render
  return (
    <AdminOutletTemplate
      title="Project Creator"
      description=" Set up a new project with the help of artificial intelligence"
    >
      {/* Stepper */}
      <StepIndicator currentStep={currentStep} steps={stepLabels} />

      {/* Step Content */}

      {renderStepContent()}

      {/* Navigation */}
      {currentStep !== 3 && (
        <StepNavigation
          currentStep={currentStep}
          totalSteps={4}
          onNext={nextStep}
          onBack={prevStep}
          nextDisabled={
            (currentStep === 0 && !currentProject) ||
            (currentStep === 2 && !generatedSetup)
          }
        />
      )}
    </AdminOutletTemplate>
  );
};

export default ProjectBasedSetupPage;
