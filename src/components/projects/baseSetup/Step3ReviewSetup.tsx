// Step3ReviewSetup.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { IGeneratedSetup } from "@/utils/projects/projectTypes";
import { useTaskStore } from "@/store/taskStore";
import { useDocumentStore } from "@/store/documentStore";
import { useProjectStore } from "@/store/projectStore";

interface Step3Props {
  generatedSetup: IGeneratedSetup | null;
  onSetCurrentStep: (step: number) => void;
}

export const Step3ReviewSetup: React.FC<Step3Props> = ({
  generatedSetup,
  onSetCurrentStep
}) => {
  // Use stores directly
  const addTemplate = useTaskStore((state) => state.addTemplate);
  const addTask = useTaskStore((state) => state.addTask);
  const addDocument = useDocumentStore((state) => state.addDocument);
  const currentProject = useProjectStore((state) => state.currentProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const addContainerToProject = useProjectStore((state) => state.addContainerToProject);

  // Local state
  const [isGenerating, setIsGenerating] = useState(false);
  const [confirmSetup, setConfirmSetup] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Apply the generated setup
  const applyGeneratedSetup = async () => {
    if (!generatedSetup || !currentProject) return;
    
    setIsGenerating(true);
    setErrorMessage(null);
    
    try {
      const projectId = currentProject.id;
      
      // Create containers
      const containerIds: Record<number, string> = {};
      
      for (let i = 0; i < generatedSetup.containers.length; i++) {
        const container = generatedSetup.containers[i];
        
        // Use the enhanced addContainerToProject function
        const containerId = addContainerToProject(projectId, container.name);
        if (containerId) {
          containerIds[i] = containerId;
          
          // Add documents if any
          if (container.documents) {
            container.documents.forEach(doc => {
              addDocument(containerId, {
                title: doc.title,
                content: doc.content,
                customFields: {},
                schemaId: "default"
              });
            });
          }
        }
      }
      
      // Create templates
      const templateIds: string[] = [];
      generatedSetup.templates.forEach(template => {
        const templateId = addTemplate({
          name: template.name,
          description: template.description,
          defaultPriority: template.defaultPriority,
          defaultSteps: template.defaultSteps
        });
        templateIds.push(templateId);
      });
      
      // Create initial task if provided
      if (generatedSetup.initialTask) {
        const task = generatedSetup.initialTask;
        
        addTask({
          title: task.title,
          description: task.description,
          status: "pending",
          priority: task.priority,
          containerId: task.containerId || containerIds[0] || "",
          relatedDocumentIds: [],
          steps: []
        });
      }
      
      // Update project with references to created resources
      updateProject(projectId, {
        templates: templateIds,
        setupCompleted: true
      });
      
      setConfirmSetup(true);
      setShowSuccessMessage(true);
      
      // Reset after success
      setTimeout(() => {
        setShowSuccessMessage(false);
        onSetCurrentStep(3); // Final step
      }, 3000);
      
    } catch (error) {
      console.error("Failed to apply setup:", error);
      setErrorMessage("Failed to apply the generated setup. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {generatedSetup ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Generated Setup</CardTitle>
              <CardDescription>
                Review and approve the generated structure for your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">
                  Containers ({generatedSetup.containers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generatedSetup.containers.map((container, index) => (
                    <div key={index} className="border p-3 rounded-md">
                      <div className="font-medium">{container.name}</div>
                      {container.documents && container.documents.length > 0 && (
                        <div className="text-sm text-muted-foreground mt-2">
                          <div>Documents:</div>
                          <ul className="list-disc pl-5">
                            {container.documents.map((doc, docIndex) => (
                              <li key={docIndex}>{doc.title}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">
                  Templates ({generatedSetup.templates.length})
                </h3>
                <div className="space-y-3">
                  {generatedSetup.templates.map((template, index) => (
                    <div key={index} className="border p-3 rounded-md">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm">{template.description}</div>
                      <div className="text-sm text-muted-foreground mt-2">
                        <div>Steps:</div>
                        <ul className="list-disc pl-5">
                          {template.defaultSteps.map((step, stepIndex) => (
                            <li key={stepIndex}>
                              {step.order}. {step.type}: {step.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {generatedSetup.initialTask && (
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Initial Task
                  </h3>
                  <div className="border p-3 rounded-md">
                    <div className="font-medium">{generatedSetup.initialTask.title}</div>
                    <div className="text-sm">{generatedSetup.initialTask.description}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Priority: {generatedSetup.initialTask.priority}
                    </div>
                  </div>
                </div>
              )}
              
              {errorMessage && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex space-x-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onSetCurrentStep(1)}
                >
                  Change Description
                </Button>
                <Button 
                  className="flex-1"
                  onClick={applyGeneratedSetup}
                  disabled={isGenerating || confirmSetup}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : confirmSetup ? "Approved" : "Approve Setup"}
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {showSuccessMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Project setup has been created.</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p>No setup has been generated yet. Go back to the previous step.</p>
          <Button 
            variant="outline" 
            onClick={() => onSetCurrentStep(1)}
            className="mt-4"
          >
            Return to Project Description
          </Button>
        </div>
      )}
    </div>
  );
};