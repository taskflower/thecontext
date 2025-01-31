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
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type Step = {
  id: number;
  title: string;
  completed: boolean;
};

type MarketingSuggestion = {
  id: string;
  name: string;
  match: number; // w %
  description: string;
};

export default function MarketingCampaignBuilder() {
  const [campaignGoal, setCampaignGoal] = useState<string>("");
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, title: "Zdefiniuj grupę docelową", completed: false },
    { id: 2, title: "Opracuj strategię treści", completed: false },
    { id: 3, title: "Uruchom kampanię reklamową", completed: false },
  ]);

  const [suggestions] = useState<MarketingSuggestion[]>([
    {
      id: "1",
      name: "Kampania na Facebooku",
      match: 90,
      description: "Dotarcie do szerokiej grupy odbiorców na Facebooku.",
    },
    {
      id: "2",
      name: "Marketing e-mailowy",
      match: 75,
      description: "Personalizowane wiadomości e-mail zwiększające zaangażowanie.",
    },
    {
      id: "3",
      name: "SEO i Content Marketing",
      match: 65,
      description: "Poprawa widoczności w wyszukiwarkach i wartościowe treści.",
    },
  ]);

  // Obliczamy % postępu kampanii w oparciu o zrobione kroki
  const completedSteps = steps.filter((step) => step.completed).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  const toggleStep = (id: number) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, completed: !step.completed } : step
      )
    );
  };

  return (
    <>
      {/* KARTA: Cel i deklaracja kampanii */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Określ cel kampanii</CardTitle>
          <CardDescription>
            Opisz, jaki efekt chcesz osiągnąć dzięki kampanii marketingowej.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label htmlFor="campaignGoal">Główny cel kampanii</Label>
          <Textarea
            id="campaignGoal"
            placeholder="Np. Zwiększenie świadomości marki o 20% w ciągu 3 miesięcy..."
            value={campaignGoal}
            onChange={(e) => setCampaignGoal(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={() => alert(`Zapisano cel kampanii: ${campaignGoal}`)}>
            Zapisz cel
          </Button>
        </CardFooter>
      </Card>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* KARTA: Rekomendacje AI */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Rekomendacje AI</CardTitle>
            <CardDescription>
              Dopasowane do Twojego celu w {campaignGoal ? `„${campaignGoal}”` : "…"}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="h-64 px-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="py-4 border-b last:border-none flex items-start justify-between"
                >
                  <div>
                    <p className="font-semibold">{suggestion.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </p>
                  </div>
                  <Badge variant="outline">{suggestion.match}%</Badge>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Zobacz więcej propozycji
            </Button>
          </CardFooter>
        </Card>

        {/* KARTA: Plan działania */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Plan działania</CardTitle>
            <CardDescription>Kroki do realizacji Twojej kampanii marketingowej</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Postęp: {progress}%
              </p>
              <Progress value={progress} className="w-full" />
            </div>
            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="p-3 border rounded-md flex items-center justify-between"
                >
                  <div
                    className={`${
                      step.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {step.title}
                  </div>
                  <Button
                    variant={step.completed ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => toggleStep(step.id)}
                  >
                    {step.completed ? (
                      <>
                        <Check className="mr-1 h-4 w-4" />
                        Zakończono
                      </>
                    ) : (
                      "Oznacz"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" onClick={() => alert("Dodaj nowy krok...")}>
              Dodaj krok
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
