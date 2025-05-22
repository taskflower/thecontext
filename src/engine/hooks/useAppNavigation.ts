import { useNavigate, useParams } from "react-router-dom";

// engine/hooks/useAppNavigation.ts
export const useAppNavigation = () => {
  const { config, workspace, scenario, step, id } = useParams();
  const navigate = useNavigate();

  const navigateTo = (navPath: string) => {
    navigate(`/${config}/${navPath}`);
  };

  return {
    config,
    workspace,
    scenario,
    step,
    id,  // Dodane
    navigateTo,
  };
};