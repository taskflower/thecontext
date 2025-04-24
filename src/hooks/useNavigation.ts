// src/hooks/useNavigation.ts
import { useNavigate, useParams } from "react-router-dom";

/**
 * Hook dostarczający funkcje nawigacyjne używane w aplikacji.
 */
export function useNavigation() {
  const navigate = useNavigate();
  const { application, workspace } = useParams();

  return {
    // Nawigacja do listy scenariuszy
    navigateToScenarios: () => {
      if (application && workspace) navigate(`/app/${application}/${workspace}`);
      else if (workspace) navigate(`/${workspace}`);
      else navigate('/');
    },

    // Nawigacja do listy workspace'ów
    navigateToWorkspaces: () => {
      if (application) navigate(`/app/${application}`);
      else navigate('/');
    },

    // Nawigacja do głównej strony
    navigateToHome: () => navigate('/'),

    // Nawigacja do konkretnego scenariusza (flow)
    navigateToFlow: (scenarioId: string) => {
      if (workspace) navigate(`/${workspace}/${scenarioId}`);
      else console.error("Brak workspace, nie można nawigować do flow");
    },

    // Zwraca aktualne parametry
    getParams: () => ({ application, workspace })
  };
}