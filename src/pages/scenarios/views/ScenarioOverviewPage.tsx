import React from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Scenario } from "@/types";
import scenarioService from "../services/ScenarioService";
import { ScenarioAudienceWidget, ScenarioChannelsWidget, ScenarioDescriptionWidget, ScenarioMilestonesWidget, ScenarioProgressWidget, ScenarioStatusWidget } from '../components';


type ContextType = { scenario: Scenario };

const ScenarioOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { scenario } = useOutletContext<ContextType>();
  
  // Pobieranie zadań przez serwis
  const scenarioTasks = id ? scenarioService.getScenarioTasks(id) : [];

  return (
    <div className="space-y-6">
      <ScenarioProgressWidget scenario={scenario} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ScenarioDescriptionWidget scenario={scenario} />
          <ScenarioMilestonesWidget
            scenario={scenario}
            tasks={scenarioTasks}
          />
        </div>
        
        <div className="space-y-6">
          <ScenarioStatusWidget scenario={scenario} />
          <ScenarioAudienceWidget scenario={scenario} />
          <ScenarioChannelsWidget scenario={scenario} />
        </div>
      </div>
    </div>
  );
};

export default ScenarioOverviewPage;