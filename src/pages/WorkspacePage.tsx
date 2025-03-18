/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/WorkspacePage.tsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../modules/store";
import { DialogProvider } from "@/components/APPUI/DialogProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { FlowPlayer } from "@/modules/flowPlayer";


const ScenarioCard: React.FC<{ scenario: any }> = ({ scenario }) => {
  const [showFlow, setShowFlow] = useState(false);

  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>{scenario.name}</CardTitle>
        <CardDescription>{scenario.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Dane scenariusza...</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setShowFlow(true)}>Play Flow</Button>
        {showFlow && (
          <div className="mt-4">
            <FlowPlayer />
            <Button variant="outline" onClick={() => setShowFlow(false)}>
              Close
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

const WorkspacePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const workspaces = useAppStore((state) => state.items);
  const workspace = workspaces.find((ws) => ws.slug === slug);

  if (!workspace) {
    return <div>Nie znaleziono workspace o podanym slug.</div>;
  }

  // Scenariusze przypisane do workspace
  const scenarios = workspace.children || [];

  return (
    <DialogProvider>
      <div className="p-4 container mx-auto">
        {/* Nawigacja workspace */}
        <div className="flex gap-2 mb-4">
          {workspaces.map((ws) => (
            <Button
              key={ws.id}
              onClick={() => ws.slug && navigate(`/${ws.slug}`)}
              disabled={!ws.slug}
              variant={ws.slug === slug ? "outline" : "ghost"}
            >
              {ws.title}
            </Button>
          ))}
        </div>

        {/* Nagłówek workspace */}
        <h1 className="text-2xl font-bold mb-4">{workspace.title}</h1>

        {/* Lista scenariuszy */}
        <div className="flex gap-4 flex-wrap">
          {scenarios.length > 0 ? (
            scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))
          ) : (
            <div>Brak scenariuszy</div>
          )}
        </div>
      </div>
    </DialogProvider>
  );
};

export default WorkspacePage;
