// src/pages/ragnarokTasks/ProjectBasedSetupPage.tsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
import { useTaskStore } from "@/store/taskStore";
import { useDocumentStore } from "@/store/documentStore";
import { useProjectStore } from "@/store/projectStore";
import { generateId } from "@/utils/utils";
import { ITaskTemplate, IContainer, IContainerDocument } from "@/utils/types";

// Step navigation component
const StepNavigation: React.FC<{
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  nextDisabled?: boolean;
}> = ({ currentStep, totalSteps, onNext, onBack, nextDisabled }) => {
  return (
    <div className="flex justify-between mt-6">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 0}
      >
        Wstecz
      </Button>
      <div className="text-sm text-muted-foreground">
        Krok {currentStep + 1} z {totalSteps}
      </div>
      <Button onClick={onNext} disabled={nextDisabled}>
        {currentStep === totalSteps - 1 ? "Zakończ" : "Dalej"}
      </Button>
    </div>
  );
};

// Type for LLM-generated setup
interface GeneratedSetup {
  projectName: string;
  containers: Array<{
    name: string;
    documents?: Array<{
      title: string;
      content: string;
    }>;
  }>;
  templates: Array<{
    name: string;
    description: string;
    defaultPriority: "low" | "medium" | "high";
    defaultSteps: Array<{
      order: number;
      type: "retrieval" | "processing" | "generation" | "validation" | "custom";
      description: string;
    }>;
  }>;
  initialTask?: {
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    containerId?: string;
  };
}

const ProjectBasedSetupPage: React.FC = () => {
  // Access stores
  const addTemplate = useTaskStore((state) => state.addTemplate);
  const addTask = useTaskStore((state) => state.addTask);
  const addContainer = useDocumentStore((state) => state.addContainer);
  const addDocument = useDocumentStore((state) => state.addDocument);
  const containers = useDocumentStore((state) => state.containers);
  const projects = useProjectStore((state) => state.projects);
  const addProject = useProjectStore((state) => state.addProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const currentProject = useProjectStore((state) => state.currentProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectIntent, setProjectIntent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSetup, setGeneratedSetup] = useState<GeneratedSetup | null>(null);
  const [confirmSetup, setConfirmSetup] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Initialize with current project if exists
  useEffect(() => {
    if (currentProject) {
      setProjectId(currentProject.id);
      setProjectName(currentProject.name);
      setProjectDescription(currentProject.description || "");
    }
  }, [currentProject]);

  // Handle step navigation
  const nextStep = () => {
    if (currentStep === 0 && !projectId) {
      // Create new project if on first step
      const newId = createProject();
      setProjectId(newId);
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Create project
  const createProject = () => {
    if (!projectName.trim()) return null;
    
    const id = generateId();
    addProject({
      id,
      name: projectName,
      description: projectDescription,
      createdAt: new Date(),
      containers: [],
      templates: [],
    });
    
    setCurrentProject(id);
    return id;
  };

  // Select existing project
  const handleSelectProject = (id: string) => {
    setProjectId(id);
    setCurrentProject(id);
    
    const project = projects.find(p => p.id === id);
    if (project) {
      setProjectName(project.name);
      setProjectDescription(project.description || "");
    }
  };

  // Generate setup from LLM
  const generateSetup = async () => {
    if (!projectIntent.trim() || !projectId) return;
    
    setIsGenerating(true);
    
    try {
      // This would be a real API call to your LLM service
      // For now, we simulate it with a delay and mock response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a demo response based on the intent
      const mockResponse: GeneratedSetup = createMockLLMResponse(projectIntent);
      
      setGeneratedSetup(mockResponse);
      setCurrentStep(2); // Move to review step
    } catch (error) {
      console.error("Failed to generate setup:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Mock LLM response generator
  const createMockLLMResponse = (intent: string): GeneratedSetup => {
    // Extract keywords from intent to customize the response
    const containsMarketing = intent.toLowerCase().includes('marketing');
    const containsResearch = intent.toLowerCase().includes('research') || intent.toLowerCase().includes('badanie');
    const containsDocuments = intent.toLowerCase().includes('document') || intent.toLowerCase().includes('dokument');
    
    return {
      projectName: projectName,
      containers: [
        {
          name: containsMarketing ? "Marketing Materials" : 
                 containsResearch ? "Research Documents" : 
                 "Project Documents",
          documents: [
            {
              title: "Sample Document",
              content: "This is a sample document to help you get started with your project."
            }
          ]
        },
        {
          name: containsMarketing ? "Campaign Assets" : 
                 containsResearch ? "Data Analysis" : 
                 "Resources",
        }
      ],
      templates: [
        {
          name: containsMarketing ? "Marketing Campaign" : 
                containsResearch ? "Research Analysis" : 
                "Standard Workflow",
          description: `Template for ${containsMarketing ? "creating marketing campaigns" : 
                                     containsResearch ? "conducting research analysis" : 
                                     "processing project documents"}`,
          defaultPriority: "medium",
          defaultSteps: [
            { order: 1, type: "retrieval", description: "Gather relevant information" },
            { order: 2, type: "processing", description: "Analyze gathered information" },
            { order: 3, type: "generation", description: "Create output document" },
            { order: 4, type: "validation", description: "Validate results" }
          ]
        }
      ],
      initialTask: {
        title: containsMarketing ? "Create Marketing Strategy" : 
               containsResearch ? "Initial Research Analysis" : 
               "Project Initialization",
        description: `This task will help you get started with your ${projectName} project.`,
        priority: "high"
      }
    };
  };

  // Apply the generated setup
  const applyGeneratedSetup = async () => {
    if (!generatedSetup || !projectId) return;
    
    setIsGenerating(true);
    
    try {
      // Create containers
      const containerIds: Record<number, string> = {};
      
      for (let i = 0; i < generatedSetup.containers.length; i++) {
        const container = generatedSetup.containers[i];
        const containerId = addContainer(container.name);
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
      
      // Create templates
      generatedSetup.templates.forEach(template => {
        addTemplate({
          name: template.name,
          description: template.description,
          defaultPriority: template.defaultPriority,
          defaultSteps: template.defaultSteps
        });
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
        containers: Object.values(containerIds),
        templates: generatedSetup.templates.map(t => t.name),
        setupCompleted: true
      });
      
      setConfirmSetup(true);
      setShowSuccessMessage(true);
      
      // Reset after success
      setTimeout(() => {
        setShowSuccessMessage(false);
        setCurrentStep(3); // Final step
      }, 3000);
      
    } catch (error) {
      console.error("Failed to apply setup:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Step 1: Create/Select Project
  const renderProjectStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Utwórz nowy projekt</CardTitle>
            <CardDescription>
              Zacznij od utworzenia nowego projektu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nazwa projektu</label>
                <Input 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Nazwa projektu"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Opis projektu</label>
                <Textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Opis projektu"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={createProject}
              disabled={!projectName.trim()}
            >
              Utwórz projekt
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wybierz istniejący projekt</CardTitle>
            <CardDescription>
              Kontynuuj pracę z istniejącym projektem
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <Select
                value={projectId || ""}
                onValueChange={handleSelectProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz projekt" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-muted-foreground">Brak projektów</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Step 2: LLM Conversation
  const renderLLMConversationStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Opisz swój projekt dla modelu AI</CardTitle>
          <CardDescription>
            Opisz czego potrzebujesz, a model wygeneruje odpowiednią strukturę zadań, szablonów i kontenerów.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={projectIntent}
            onChange={(e) => setProjectIntent(e.target.value)}
            placeholder="Np. Chcę stworzyć system zarządzania kampaniami marketingowymi, gdzie będę przechowywać materiały kampanii, planować zadania i analizować wyniki."
            className="min-h-[200px] mb-4"
          />
          <div className="text-sm text-muted-foreground mb-4">
            <p>Przykłady skutecznych opisów:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Potrzebuję systemu do zarządzania dokumentami badawczymi i analizy danych</li>
              <li>Chcę stworzyć system planowania kampanii marketingowych z szablonami zadań</li>
              <li>Potrzebuję organizować dokumenty klientów i powiązane z nimi zadania projektowe</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={generateSetup}
            disabled={!projectIntent.trim() || isGenerating}
          >
            {isGenerating ? "Generowanie..." : "Wygeneruj setup"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  // Step 3: Review Generated Setup
  const renderReviewSetupStep = () => (
    <div className="space-y-6">
      {generatedSetup ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Wygenerowany setup</CardTitle>
              <CardDescription>
                Sprawdź i zatwierdź wygenerowaną strukturę dla twojego projektu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">
                  Kontenery ({generatedSetup.containers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {generatedSetup.containers.map((container, index) => (
                    <div key={index} className="border p-3 rounded-md">
                      <div className="font-medium">{container.name}</div>
                      {container.documents && container.documents.length > 0 && (
                        <div className="text-sm text-muted-foreground mt-2">
                          <div>Dokumenty:</div>
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
                  Szablony ({generatedSetup.templates.length})
                </h3>
                <div className="space-y-3">
                  {generatedSetup.templates.map((template, index) => (
                    <div key={index} className="border p-3 rounded-md">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm">{template.description}</div>
                      <div className="text-sm text-muted-foreground mt-2">
                        <div>Kroki:</div>
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
                    Początkowe zadanie
                  </h3>
                  <div className="border p-3 rounded-md">
                    <div className="font-medium">{generatedSetup.initialTask.title}</div>
                    <div className="text-sm">{generatedSetup.initialTask.description}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Priorytet: {generatedSetup.initialTask.priority}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="flex space-x-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCurrentStep(1)}
                >
                  Zmień opis
                </Button>
                <Button 
                  className="flex-1"
                  onClick={applyGeneratedSetup}
                  disabled={isGenerating || confirmSetup}
                >
                  {isGenerating ? "Tworzenie..." : confirmSetup ? "Zatwierdzono" : "Zatwierdź setup"}
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {showSuccessMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Sukces!</strong>
              <span className="block sm:inline"> Setup projektu został utworzony.</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p>Nie wygenerowano jeszcze setupu. Wróć do poprzedniego kroku.</p>
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(1)}
            className="mt-4"
          >
            Wróć do opisu projektu
          </Button>
        </div>
      )}
    </div>
  );

  // Step 4: Completion
  const renderCompletionStep = () => (
    <div className="space-y-6 text-center py-12">
      <h2 className="text-2xl font-bold">Setup projektu ukończony!</h2>
      <p className="text-muted-foreground">
        Twój projekt został pomyślnie skonfigurowany. Możesz teraz przejść do pracy nad zadaniami.
      </p>
      <div className="flex justify-center gap-4 mt-8">
        <Button variant="outline" onClick={() => setCurrentStep(0)}>
          Konfiguruj nowy projekt
        </Button>
        <Button>
          Przejdź do zadań
        </Button>
      </div>
    </div>
  );

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderProjectStep();
      case 1:
        return renderLLMConversationStep();
      case 2:
        return renderReviewSetupStep();
      case 3:
        return renderCompletionStep();
      default:
        return null;
    }
  };

  // Main component render
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Kreator projektu</h1>
        <p className="text-muted-foreground mt-2">
          Skonfiguruj nowy projekt przy pomocy sztucznej inteligencji
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex justify-between">
          {["Projekt", "Opis dla AI", "Przegląd setupu", "Zakończenie"].map((step, index) => (
            <div 
              key={index}
              className={`flex flex-col items-center ${index <= currentStep ? "text-primary" : "text-muted-foreground"}`}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 border ${
                  index < currentStep 
                    ? "bg-primary text-primary-foreground" 
                    : index === currentStep 
                    ? "border-primary text-primary" 
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                {index < currentStep ? "✓" : index + 1}
              </div>
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 relative">
          <div className="absolute top-1/2 h-px w-full bg-muted-foreground/20" />
          <div 
            className="absolute top-1/2 h-px bg-primary transition-all" 
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card p-6 rounded-lg border min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      {currentStep !== 3 && (
        <StepNavigation
          currentStep={currentStep}
          totalSteps={4}
          onNext={nextStep}
          onBack={prevStep}
          nextDisabled={
            (currentStep === 0 && !projectId) ||
            (currentStep === 1 && !projectIntent.trim()) ||
            (currentStep === 2 && !generatedSetup)
          }
        />
      )}
    </div>
  );
};

export default ProjectBasedSetupPage;