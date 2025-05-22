  // engine/navigation.ts - Jedna linia logiki
  import { useParams, useNavigate } from "react-router-dom";

  export const useAppNavigation = () => {
    const { config, workspace, scenario, step } = useParams();
    const navigate = useNavigate();
    
    const navigateTo = (navPath: string) => {
      navigate(`/${config}/${navPath}`);
    };
    
    return {
      config, 
      workspace, 
      scenario, 
      step,
      navigateTo
    };
  };