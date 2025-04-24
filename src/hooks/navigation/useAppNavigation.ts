// src/hooks/useAppNavigation.ts
import { useNavigate, useParams } from "react-router-dom";

export function useAppNavigation() {
  const navigate = useNavigate();
  const { application, workspace } = useParams();

  return {
    navigateToScenarios: () => {
      if (application && workspace)
        navigate(`/app/${application}/${workspace}`);
      else if (workspace) navigate(`/${workspace}`);
      else navigate("/");
    },

    navigateToWorkspaces: () => {
      if (application) navigate(`/app/${application}`);
      else navigate("/");
    },

    navigateToHome: () => navigate("/"),

    navigateToFlow: (scenarioId: string) => {
      if (workspace) navigate(`/${workspace}/${scenarioId}`);
      else console.error("Brak workspace, nie można nawigować do flow");
    },

    getParams: () => ({ application, workspace }),
  };
}
