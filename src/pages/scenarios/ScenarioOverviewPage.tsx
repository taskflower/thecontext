// src/pages/scenarios/components/details/ScenarioOverviewPage.tsx
import React from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { Scenario } from "@/types";
import { useTaskStore } from "@/store";
import { ScenarioProgressWidget } from "./components/widgets/ScenarioProgressWidget";
import { ScenarioDescriptionWidget } from "./components/widgets/ScenarioDescriptionWidget";
import { ScenarioMilestonesWidget } from "./components/widgets/ScenarioMilestonesWidget";
import { ScenarioStatusWidget } from "./components/widgets/ScenarioStatusWidget";
import { ScenarioAudienceWidget } from "./components/widgets/ScenarioAudienceWidget";
import { ScenarioChannelsWidget } from "./components/widgets/ScenarioChannelsWidget";

type ContextType = { scenario: Scenario };

const ScenarioOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { scenario } = useOutletContext<ContextType>();
  const { tasks } = useTaskStore();
  
  // Filter related data
  const scenarioTasks = tasks.filter((t) => t.scenarioId === id);

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