import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, Target, Lightbulb, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type ActionStep = {
  id: number;
  title: string;
  completed: boolean;
};

type WizardStep = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
};

export default function CampaignWizard() {
  // Stan dla kreatora
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [campaignGoal, setCampaignGoal] = useState<string>("");
  const [actionSteps, setActionSteps] = useState<ActionStep[]>([
    { id: 1, title: "Define Target Audience", completed: false },
    { id: 2, title: "Develop Content Strategy", completed: false },
    { id: 3, title: "Launch Advertising Campaign", completed: false },
  ]);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);

  const aiSuggestions = [
    {
      id: "1",
      name: "Facebook Campaign",
      match: 90,
      description: "Reach a broad audience on Facebook.",
    },
    {
      id: "2",
      name: "Email Marketing",
      match: 75,
      description: "Personalized emails to boost engagement.",
    },
    {
      id: "3",
      name: "SEO & Content Marketing",
      match: 65,
      description: "Improve search engine visibility with valuable content.",
    },
  ];

  // Definicja kroków – tytuł, podtytuł oraz ikona
  const wizardSteps: WizardStep[] = [
    { title: "Campaign Goal", subtitle: "Set your campaign objective", icon: <Target className="h-5 w-5" /> },
    { title: "AI Suggestions", subtitle: "See tailored recommendations", icon: <Lightbulb className="h-5 w-5" /> },
    { title: "Action Plan", subtitle: "Plan your campaign steps", icon: <CheckCircle className="h-5 w-5" /> },
  ];

  const nextStep = () => {
    if (currentStep < wizardSteps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const toggleActionStep = (id: number) => {
    setActionSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, completed: !step.completed } : step
      )
    );
  };

  // Demo – symulacja przejścia przez kreatora
  const runDemo = async () => {
    setIsDemoRunning(true);
    // Krok 1: Ustawienie celu kampanii
    setCampaignGoal("Increase brand awareness by 20% in 3 months");
    await new Promise((res) => setTimeout(res, 1500));
    setCurrentStep(1);
    await new Promise((res) => setTimeout(res, 1500));
    setCurrentStep(2);
    // Automatyczne oznaczanie kroków w planie działania
    for (let i = 0; i < actionSteps.length; i++) {
      await new Promise((res) => setTimeout(res, 1000));
      setActionSteps((prev) =>
        prev.map((step) =>
          step.id === actionSteps[i].id ? { ...step, completed: true } : step
        )
      );
    }
    await new Promise((res) => setTimeout(res, 1000));
    setIsDemoRunning(false);
  };

  // Obliczenie postępu w sekcji "Action Plan"
  const actionProgress = Math.round(
    (actionSteps.filter((s) => s.completed).length / actionSteps.length) * 100
  );

  return (
    <Card  mobile>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Campaign Wizard
        </CardTitle>
        <CardDescription className="text-gray-600">
          Kliknij na kartę, aby przejść do danego etapu.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        {/* Nawigacja kroków jako karty */}
        <div className="flex gap-4 mb-6">
          {wizardSteps.map((step, index) => (
            <Card
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`cursor-pointer flex-1 border ${
                currentStep === index
                  ? "border-black bg-white"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <CardHeader className="p-4 flex flex-col items-center">
                <div className="mb-2 text-black">{step.icon}</div>
                <CardTitle className="text-center text-sm font-medium text-black">
                  {step.title}
                </CardTitle>
                <CardDescription className="text-center text-xs text-gray-600">
                  {step.subtitle}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <Separator />

        {/* Treść aktualnego etapu */}
        {currentStep === 0 && (
          <div className="mt-6">
            <Label htmlFor="campaignGoal" className="text-gray-700">
              Campaign Goal
            </Label>
            <Textarea
              id="campaignGoal"
              placeholder="Np. Increase brand awareness by 20% in 3 months..."
              value={campaignGoal}
              onChange={(e) => setCampaignGoal(e.target.value)}
              className="mt-2 bg-gray-50 text-gray-900 border border-gray-300"
            />
          </div>
        )}

        {currentStep === 1 && (
          <div className="mt-6">
            <p className="mb-2 font-medium text-gray-800">AI Suggestions for:</p>
            <p className="italic mb-4 text-gray-600">
              "{campaignGoal || "Your Campaign Goal"}"
            </p>
            <ScrollArea className="h-48 border border-gray-200 rounded">
              {aiSuggestions.map((sugg) => (
                <div
                  key={sugg.id}
                  className="p-4 border-b border-gray-200 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{sugg.name}</p>
                    <p className="text-sm text-gray-600">{sugg.description}</p>
                  </div>
                  <Badge variant="outline" className="border-gray-300 text-gray-800">
                    {sugg.match}%
                  </Badge>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}

        {currentStep === 2 && (
          <div className="mt-6">
            <p className="mb-2 font-medium text-gray-800">Action Plan</p>
            <div className="mb-4">
              <Progress value={actionProgress} className="w-full" />
            </div>
            {actionSteps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded mb-3"
              >
                <span className={step.completed ? "line-through text-gray-500" : "text-gray-800"}>
                  {step.title}
                </span>
                <Button
                  size="sm"
                  variant={step.completed ? "secondary" : "outline"}
                  onClick={() => toggleActionStep(step.id)}
                  disabled={isDemoRunning}
                  className="border-gray-300 text-gray-800"
                >
                  {step.completed ? (
                    <>
                      <Check className="mr-1 h-4 w-4" /> Completed
                    </>
                  ) : (
                    "Mark as Done"
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center p-6 border-t border-gray-200">
        <div className="flex gap-3">
          <Button onClick={prevStep} disabled={currentStep === 0 || isDemoRunning}>
            Back
          </Button>
          <Button
            onClick={nextStep}
            disabled={currentStep === wizardSteps.length - 1 || isDemoRunning}
          >
            Next
          </Button>
        </div>
        <Button variant="outline" onClick={runDemo} disabled={isDemoRunning}>
          {isDemoRunning ? "Running Demo..." : "Run Demo"}
        </Button>
      </CardFooter>
    </Card>
  );
}
