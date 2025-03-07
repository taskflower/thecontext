import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui";
import { ScenarioConnectionsPanel } from '../components';


const ScenarioConnectionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) return null;

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <ScenarioConnectionsPanel scenarioId={id} />
      </CardContent>
    </Card>
  );
};

export default ScenarioConnectionsPage;