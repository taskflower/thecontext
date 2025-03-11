// src/modules/scenarios_module/ScenarioList.tsx
import React from 'react';
import { useScenariosMultiStore } from './scenariosMultiStore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ScenarioList: React.FC = () => {
  const { scenarios, currentScenarioId, setCurrentScenario } = useScenariosMultiStore();
  const scenarioEntries = Object.entries(scenarios || {});

  if (scenarioEntries.length === 0) {
    return <div>Brak scenariuszy.</div>;
  }

  return (
    <div className="space-y-4">
      {scenarioEntries.map(([id, scenario]) => (
        <Card key={id} className={`border ${currentScenarioId === id ? 'bg-blue-50' : ''}`}>
          <CardHeader>
            <CardTitle>{id}</CardTitle>
          </CardHeader>
          <CardContent>
            <div>Liczba węzłów: {Object.keys(scenario.nodes ?? {}).length}</div>
            <div>Liczba połączeń: {(scenario.edges ?? []).length}</div>
            <div>Liczba kategorii: {(scenario.categories ?? []).length}</div>
          </CardContent>
          <div className="p-4">
            <Button onClick={() => setCurrentScenario(id)}>
              {currentScenarioId === id ? 'Wybrany' : 'Wybierz scenariusz'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ScenarioList;
